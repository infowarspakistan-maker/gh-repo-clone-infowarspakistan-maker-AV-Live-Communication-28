import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  User,
  sendPasswordResetEmail,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, getDocFromCache, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase/client';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        // Force admin for the specific email
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
      // If we are offline, attempt to load from local cache
      if (error?.message?.includes('offline') || error?.code === 'unavailable') {
        console.warn('Firestore is offline. Attempting to fetch user profile from local cache...', error.message || error);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        
        if (currentUser) {
          let profile = await fetchUserProfile(currentUser.uid);
          
          // If profile doesn't exist, create one (especially for Google login) or fallback
          if (!profile) {
            const role = isAuthorizedAdmin(currentUser.email) ? 'admin' : 'customer';
            profile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              role: role as any,
              isActive: true,
              photoURL: currentUser.photoURL
            };
            try {
              await setDoc(doc(db, 'users', currentUser.uid), {
                ...profile,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
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

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  };

  const signInWithGoogle = async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const logout = async (): Promise<void> => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  };

  const userRole = userProfile?.role || null;
  const isAdmin = userRole === 'admin';
  const isEditor = userRole === 'admin' || userRole === 'editor';
  const isSupport = userRole === 'admin' || userRole === 'editor' || userRole === 'support';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      userRole,
      loading,
      login,
      signInWithGoogle,
      logout,
      resetPassword,
      isAdmin,
      isEditor,
      isSupport,
      isAuthenticated
    }}>
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
