import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { profileService } from '@/services/profileService';
import { userService } from '@/services/userService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, userName?: string) => {
    try {
      const displayName = userName || 'Gamer' + Math.floor(Math.random() * 10000);
      
      // Check if username is available
      if (userName) {
        const isAvailable = await userService.isUsernameAvailable(userName);
        if (!isAvailable) {
          throw new Error('Username is already taken. Please choose a different one.');
        }
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Set display name
      await updateProfile(user, { displayName });
      
      // Create user profile in Firestore
      await userService.createUserProfile(user.uid, {
        username: displayName,
        displayName: displayName,
        email: email,
        isPublic: true
      });
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/password authentication is not enabled. Please enable it in Firebase Console.');
      }
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if profile exists, create if not
      const existingProfile = await profileService.getUserProfile(user.uid);
      if (!existingProfile) {
        await profileService.updateUserProfile(user.uid, {
          userName: user.displayName || 'Gamer' + Math.floor(Math.random() * 10000),
          email: user.email || '',
          favoriteGames: [],
          totalComments: 0,
          averageRating: 0
        });
      }
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Google authentication is not enabled. Please enable it in Firebase Console.');
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};