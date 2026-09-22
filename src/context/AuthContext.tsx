import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, testFirestoreConnection } from '../firebase/config';
import { getFriendlyAuthErrorMessage } from '../firebase/errors';
import { AppUser } from '../types';

export type MasarUser = User | AppUser;

export const DEMO_TEACHER_USER: AppUser = {
  uid: 'demo-teacher-local',
  displayName: 'المعلم التجريبي (مسار)',
  email: 'teacher.demo@masar.edu',
  isAnonymous: true,
};

interface AuthContextType {
  currentUser: MasarUser | null;
  loading: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInDemoTeacher: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MasarUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsDemoMode(false);
        localStorage.removeItem('masar_demo_teacher');
      } else {
        const storedDemo = localStorage.getItem('masar_demo_teacher') === 'true';
        if (storedDemo) {
          setCurrentUser(DEMO_TEACHER_USER);
          setIsDemoMode(true);
        } else {
          setCurrentUser(null);
          setIsDemoMode(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      localStorage.removeItem('masar_demo_teacher');
      setIsDemoMode(false);
    } catch (err: unknown) {
      const msg = getFriendlyAuthErrorMessage(err);
      console.warn('Google Sign In:', msg);
      setError(msg);
      throw new Error(msg);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      localStorage.removeItem('masar_demo_teacher');
      setIsDemoMode(false);
    } catch (err: unknown) {
      const msg = getFriendlyAuthErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name }).catch(() => {});
        localStorage.removeItem('masar_demo_teacher');
        setIsDemoMode(false);
      }
    } catch (err: unknown) {
      const msg = getFriendlyAuthErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const signInDemoTeacher = async () => {
    setError(null);
    try {
      // First attempt anonymous authentication via Firebase
      const cred = await signInAnonymously(auth);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: 'المعلم التجريبي' }).catch(() => {});
        setCurrentUser(cred.user);
        setIsDemoMode(false);
        localStorage.removeItem('masar_demo_teacher');
      }
    } catch (err: unknown) {
      // When anonymous auth is restricted by Firebase console or admin policy
      // (e.g. auth/admin-restricted-operation), smoothly fallback to local demo teacher session
      console.info('Firebase anonymous auth restricted by project. Switching to local demo mode:', err);
      setCurrentUser(DEMO_TEACHER_USER);
      setIsDemoMode(true);
      localStorage.setItem('masar_demo_teacher', 'true');
      setError(null);
    }
  };

  const logout = async () => {
    setError(null);
    localStorage.removeItem('masar_demo_teacher');
    setCurrentUser(null);
    setIsDemoMode(false);
    try {
      await signOut(auth);
    } catch (err: unknown) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isDemoMode,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInDemoTeacher,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
