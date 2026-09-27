import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      const profileSnapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
      const profile = profileSnapshot.exists() ? profileSnapshot.data() : {};
      setUser({
        id: firebaseUser.uid,
        name: profile.name || firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        address: profile.address || '',
        paymentMethod: profile.paymentMethod || 'cod',
      });
      setAuthLoading(false);
    });
  }, []);

  const register = async ({ name, email, password, address }) => {
    const credentials = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credentials.user, { displayName: name });
    await setDoc(doc(db, 'users', credentials.user.uid), {
      name,
      email,
      address,
      paymentMethod: 'cod',
    });
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  const value = useMemo(() => ({ user, authLoading, register, login, logout }), [user, authLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
