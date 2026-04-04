import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { auth, db } from '../firebase';
import { requestNotificationPermission, setupMessageListener } from '../notifications';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          const newUserData = {
            uid: currentUser.uid,
            displayName: currentUser.isAnonymous ? 'Guest User' : (currentUser.displayName || 'Anonymous'),
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            reputation: 0,
            verified: false,
            tradeScore: 0,
            createdAt: new Date().toISOString(),
          };
          try {
            await setDoc(userDocRef, newUserData);
            setUserData(newUserData);
          } catch (error) {
            console.error('Error creating user profile:', error);
            // Even if creation fails, set userData to prevent breaking UI
            setUserData(newUserData);
          }
        }
        
        // Setup notifications (safely)
        try {
          requestNotificationPermission(currentUser.uid);
          setupMessageListener();
        } catch (err) {
          console.warn("Notifications not supported in this environment", err);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Error signing in with Google', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast('Inicio de sesión cancelado', { icon: 'ℹ️' });
      } else {
        toast.error('Error al iniciar sesión.');
      }
    }
  };

  const signInAsGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error('Error signing in anonymously', error);
      toast.error('No se pudo iniciar como invitado.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Error signing out', error);
      toast.error('Error al cerrar sesión.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, signInAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
