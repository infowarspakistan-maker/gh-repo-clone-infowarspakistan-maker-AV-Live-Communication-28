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
  const lowerEmail = email.toLowerCase();
  return ADMIN_EMAILS.includes(lowerEmail) || lowerEmail.endsWith('@avlive.com.pk');
}

async function loadFirebaseAuthRuntime() {
  const [authMod, fsMod, clientMod] = await Promise.all([
    import('firebase/auth'),
    import('firebase/firestore'),
    import('../lib/firebase/client'),
  ]);
  return { authMod, fsMod, clientMod };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isProtectedPath =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/setup-wizard'));

  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(isProtectedPath);
  const authInitializedRef = useRef(false);

  const initAuthListener = useCallback(() => {
    if (authInitializedRef.current) return () => {};
    authInitializedRef.current = true;
    let unsub: (() => void) | undefined;
    let cancelled = false;

    loadFirebaseAuthRuntime()
      .then(({ authMod, fsMod, clientMod }) => {
        if (cancelled) return;
        const { onAuthStateChanged } = authMod;
        const { doc, getDoc, getDocFromCache, setDoc, serverTimestamp } = fsMod;
        const { auth, db } = clientMod;

        const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
          try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (isAuthorizedAdmin(data.email) && data.role !== 'admin') {
                try {
                  await setDoc(doc(db, 'users', uid), { role: 'admin' }, { merge: true });
                } catch (e) {
                  console.warn('Could not write forced admin role to Firestore (offline):', e);
                }
                return { ...data, role: 'admin' } as UserProfile;
              }
              return data as UserProfile;
            }
            return null;
          } catch (error: any) {
            if (error?.message?.includes('offline') || error?.code === 'unavailable') {
              try {
                const cachedDoc = await getDocFromCache(doc(db, 'users', uid));
                if (cachedDoc.exists()) {
                  const data = cachedDoc.data();
                  if (isAuthorizedAdmin(data.email) && data.role !== 'admin') {
                    return { ...data, role: 'admin' } as UserProfile;
                  }
                  return data as UserProfile;
                }
              } catch (cacheError) {
                console.warn('Failed to retrieve user profile from cache:', cacheError);
              }
            } else {
              console.warn('Error fetching user profile:', error);
            }
            return null;
          }
        };

        unsub = onAuthStateChanged(auth, async (currentUser) => {
          try {
            setUser(currentUser);
            if (currentUser) {
              let profile = await fetchUserProfile(currentUser.uid);
              if (!profile) {
                const role = isAuthorizedAdmin(currentUser.email) ? 'admin' : 'customer';
                profile = {
                  uid: currentUser.uid,
                  email: currentUser.email,
                  displayName: currentUser.displayName,
                  role: role as any,
                  isActive: true,
                  photoURL: currentUser.photoURL,
                };
                try {
                  await setDoc(doc(db, 'users', currentUser.uid), {
                    ...profile,
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                  });
                } catch (err) {
                  console.warn('Failed to save profile to Firestore (offline fallback):', err);
                }
              }

              setUserProfile(profile);

              try {
                await setDoc(
                  doc(db, 'users', currentUser.uid),
                  { lastLogin: serverTimestamp() },
                  { merge: true }
                );
              } catch (error) {
                console.warn('Error updating last login:', error);
              }
            } else {
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
  }, []);

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
    const { authMod, clientMod } = await loadFirebaseAuthRuntime();
    const userCredential = await authMod.signInWithEmailAndPassword(clientMod.auth, email, password);
    return userCredential.user;
  };

  const signInWithGoogle = async (): Promise<User> => {
    initAuthListener();
    const { authMod, clientMod } = await loadFirebaseAuthRuntime();
    const result = await authMod.signInWithPopup(clientMod.auth, clientMod.googleProvider);
    return result.user;
  };

  const signInWithFacebook = async (): Promise<User> => {
    initAuthListener();
    const { authMod, clientMod } = await loadFirebaseAuthRuntime();
    const result = await authMod.signInWithPopup(clientMod.auth, clientMod.facebookProvider);
    return result.user;
  };

  const logout = async (): Promise<void> => {
    const { authMod, clientMod } = await loadFirebaseAuthRuntime();
    await Promise.all([
      authMod.signOut(clientMod.auth),
      logoutFacebookSdk().catch(() => undefined),
    ]);
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    const { authMod, clientMod } = await loadFirebaseAuthRuntime();
    await authMod.sendPasswordResetEmail(clientMod.auth, email);
  };

  const userRole = userProfile?.role || null;
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
