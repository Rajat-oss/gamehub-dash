import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { profileService } from '@/services/profileService';
import { userService } from '@/services/userService';
import { otpService } from '@/services/otpService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userName?: string) => Promise<{ needsVerification: boolean; email: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  updateUserProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
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
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isRegistering) {
        setUser(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isRegistering]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, userName?: string) => {
    try {
      const displayName = userName || 'Gamer' + Math.floor(Math.random() * 10000);

      if (userName) {
        const isAvailable = await userService.isUsernameAvailable(userName);
        if (!isAvailable) {
          throw new Error('Username is already taken. Please choose a different one.');
        }
      }

      // Store registration data in sessionStorage (more secure than localStorage)
      const regData = { email, password, displayName };
      sessionStorage.setItem('pendingRegistration', JSON.stringify(regData));

      // Send OTP
      await otpService.sendOTP(email);

      return { needsVerification: true, email };
    } catch (error: any) {
      sessionStorage.removeItem('pendingRegistration');
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

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const sendOTP = async (email: string) => {
    await otpService.sendOTP(email);
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      setIsRegistering(true);
      await otpService.verifyOTP(email, otp);

      const pendingReg = sessionStorage.getItem('pendingRegistration');
      if (pendingReg) {
        const { email: regEmail, password, displayName } = JSON.parse(pendingReg);

        if (regEmail === email) {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          await updateProfile(user, { displayName });

          await userService.createUserProfile(user.uid, {
            username: displayName,
            displayName: displayName,
            email: email,
            isPublic: true
          });

          await signOut(auth);

          sessionStorage.removeItem('pendingRegistration');
          await otpService.cleanupOTP(email);
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setIsRegistering(false);
    }
  };

  const refreshUser = () => {
    if (auth.currentUser) {
      setUser({ ...auth.currentUser } as User);
    }
  };

  const updateUserProfile = async (updates: { displayName?: string; photoURL?: string }) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, updates);
      refreshUser();
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    sendOTP,
    verifyOTP,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};