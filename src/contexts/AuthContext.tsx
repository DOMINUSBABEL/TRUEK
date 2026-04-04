import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { requestNotificationPermission, setupMessageListener } from '../notifications';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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
            displayName: currentUser.displayName || 'Anonymous',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            reputation: 0,
            verified: false,
            tradeScore: 0,
            createdAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newUserData);
          setUserData(newUserData);
        }
        
        // Setup notifications
        requestNotificationPermission(currentUser.uid);
        setupMessageListener();
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
    } catch (error) {
      toast.error('Error al iniciar sesión con Google');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      toast.error('Error al cerrar sesión');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, logout }}>
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
