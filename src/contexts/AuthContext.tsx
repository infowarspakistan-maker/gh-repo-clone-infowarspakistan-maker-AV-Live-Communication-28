import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { logoutFacebookSdk } from '../lib/facebook-sdk';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'editor' | 'support' | 'customer' | null;
  isActive: boolean;
  phoneNumber?: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userRole: 'admin' | 'editor' | 'support' | 'customer' | null;
  loading: boolean;
  preloadAuth: () => void;
  login: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signInWithFacebook: () => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
  isEditor: boolean;
  isSupport: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const ADMIN_EMAILS = ['infowarspakistan@gmail.com', 'admin@avlive.com.pk', 'info@avlive.com.pk'];
function isAuthorizedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const lowerEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(lowerEmail) || lowerEmail.endsWith('@avlive.com.pk');
}

type FirebaseAuthRuntime = {
  authMod: typeof import('firebase/auth');
  fsMod: typeof import('firebase/firestore');
  clientMod: typeof import('../lib/firebase/client');
};

let cachedRuntime: FirebaseAuthRuntime | null = null;
let runtimePromise: Promise<FirebaseAuthRuntime> | null = null;

function loadFirebaseAuthRuntime(): Promise<FirebaseAuthRuntime> {
  if (cachedRuntime) return Promise.resolve(cachedRuntime);
  if (!runtimePromise) {
    runtimePromise = Promise.all([
      import('firebase/auth'),
      import('firebase/firestore'),
      import('../lib/firebase/client'),
    ])
      .then(([authMod, fsMod, clientMod]) => {
        cachedRuntime = { authMod, fsMod, clientMod };
        return cachedRuntime;
      })
      .catch((err) => {
        runtimePromise = null;
        throw err;
      });
  }
  return runtimePromise;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isProtectedPath =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/setup-wizard'));

  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(isProtectedPath);
  const authInitializedRef = useRef(false);

  const syncUserProfile = useCallback(
    async (
      currentUser: User,
      fsMod: FirebaseAuthRuntime['fsMod'],
      clientMod: FirebaseAuthRuntime['clientMod']
    ): Promise<UserProfile> => {
      const { doc, getDoc, getDocFromCache, setDoc, serverTimestamp } = fsMod;
      const { db } = clientMod;
      const isEmailAdmin = isAuthorizedAdmin(currentUser.email);

      const fallbackProfile: UserProfile = {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        role: isEmailAdmin ? 'admin' : 'customer',
        isActive: true,
        photoURL: currentUser.photoURL,
      };

      // Immediately hydrate authorized admin profile so ProtectedRoute never races
      setUser(currentUser);
      if (isEmailAdmin) {
        setUserProfile((prev) => (prev?.uid === currentUser.uid && prev.role === 'admin' ? prev : fallbackProfile));
      }

      let profile: UserProfile | null = null;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          if (isEmailAdmin && data.role !== 'admin') {
            try {
              await setDoc(doc(db, 'users', currentUser.uid), { role: 'admin', email: currentUser.email }, { merge: true });
            } catch (e) {
              console.warn('Could not persist forced admin role to Firestore:', e);
            }
            profile = { ...data, uid: currentUser.uid, email: currentUser.email, role: 'admin' };
          } else {
            profile = { ...data, uid: currentUser.uid };
          }
        }
      } catch (error: any) {
        if (error?.message?.includes('offline') || error?.code === 'unavailable') {
          try {
            const cachedDoc = await getDocFromCache(doc(db, 'users', currentUser.uid));
            if (cachedDoc.exists()) {
              const data = cachedDoc.data() as UserProfile;
              profile = isEmailAdmin ? { ...data, role: 'admin' } : data;
            }
          } catch (cacheError) {
            console.warn('Failed to retrieve user profile from cache:', cacheError);
          }
        } else {
          console.warn('Error fetching user profile:', error);
        }
      }

      if (!profile) {
        profile = fallbackProfile;
        try {
          await setDoc(doc(db, 'users', currentUser.uid), {
            ...profile,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          });
        } catch (err) {
          console.warn('Failed to save profile to Firestore (continuing with session profile):', err);
        }
      } else {
        try {
          await setDoc(
            doc(db, 'users', currentUser.uid),
            { lastLogin: serverTimestamp() },
            { merge: true }
          );
        } catch (error) {
          console.warn('Error updating last login:', error);
        }
      }

      setUserProfile(profile);
      return profile;
    },
    []
  );

  const initAuthListener = useCallback(() => {
    if (authInitializedRef.current) return () => {};
    authInitializedRef.current = true;
    let unsub: (() => void) | undefined;
    let cancelled = false;

    loadFirebaseAuthRuntime()
      .then(({ authMod, fsMod, clientMod }) => {
        if (cancelled) return;
        const { onAuthStateChanged } = authMod;
        const { auth } = clientMod;

        unsub = onAuthStateChanged(auth, async (currentUser) => {
          try {
            if (currentUser) {
              await syncUserProfile(currentUser, fsMod, clientMod);
            } else {
              setUser(null);
              setUserProfile(null);
            }
          } catch (globalErr) {
            console.error('Error in auth state change subscriber:', globalErr);
          } finally {
            setLoading(false);
          }
        });
      })
      .catch((err) => {
        console.warn('Deferred Firebase Auth runtime load failed:', err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, [syncUserProfile]);

  const preloadAuth = useCallback(() => {
    initAuthListener();
    void loadFirebaseAuthRuntime();
  }, [initAuthListener]);

  useEffect(() => {
    if (isProtectedPath) {
      return initAuthListener();
    }

    // On public storefront pages, defer Firebase Auth SDK download & parse until well after FCP/LCP/TBT
    let cleanupListener: (() => void) | undefined;
    const timer = setTimeout(() => {
      cleanupListener = initAuthListener();
    }, 3800);

    return () => {
      clearTimeout(timer);
      if (cleanupListener) cleanupListener();
    };
  }, [isProtectedPath, initAuthListener]);

  const login = async (email: string, password: string): Promise<User> => {
    initAuthListener();
    const { authMod, fsMod, clientMod } = cachedRuntime || (await loadFirebaseAuthRuntime());
    const userCredential = await authMod.signInWithEmailAndPassword(clientMod.auth, email, password);
    await syncUserProfile(userCredential.user, fsMod, clientMod);
    return userCredential.user;
  };

  const signInWithGoogle = async (): Promise<User> => {
    initAuthListener();
    // Use cached runtime synchronously when available so browser popup blockers preserve the click user-gesture
    const runtime = cachedRuntime || (await loadFirebaseAuthRuntime());
    const { authMod, fsMod, clientMod } = runtime;
    const provider = new authMod.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await authMod.signInWithPopup(clientMod.auth, provider);
    await syncUserProfile(result.user, fsMod, clientMod);
    return result.user;
  };

  const signInWithFacebook = async (): Promise<User> => {
    initAuthListener();
    const runtime = cachedRuntime || (await loadFirebaseAuthRuntime());
    const { authMod, fsMod, clientMod } = runtime;
    const result = await authMod.signInWithPopup(clientMod.auth, clientMod.facebookProvider);
    await syncUserProfile(result.user, fsMod, clientMod);
    return result.user;
  };

  const logout = async (): Promise<void> => {
    const { authMod, clientMod } = cachedRuntime || (await loadFirebaseAuthRuntime());
    await Promise.all([
      authMod.signOut(clientMod.auth),
      logoutFacebookSdk().catch(() => undefined),
    ]);
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    const { authMod, clientMod } = cachedRuntime || (await loadFirebaseAuthRuntime());
    await authMod.sendPasswordResetEmail(clientMod.auth, email);
  };

  const userRole =
    userProfile?.role || (user && isAuthorizedAdmin(user.email) ? 'admin' : null);
  const isAdmin = userRole === 'admin';
  const isEditor = userRole === 'admin' || userRole === 'editor';
  const isSupport = userRole === 'admin' || userRole === 'editor' || userRole === 'support';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        userRole,
        loading,
        preloadAuth,
        login,
        signInWithGoogle,
        signInWithFacebook,
        logout,
        resetPassword,
        isAdmin,
        isEditor,
        isSupport,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
