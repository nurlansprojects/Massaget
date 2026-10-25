import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { loginWithGoogle, logoutUser, subscribeToAuthState } from '../firebase/authService';
import { getUserProfile, createUserProfile, updatePresence } from '../firebase/userService';
import { testFirebaseConnection } from '../firebase/config';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  needsOnboarding: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (data: { displayName: string; username: string; bio?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Test Firebase connection on initial boot
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const loadProfile = async (uid: string, user: User) => {
    try {
      const profile = await getUserProfile(uid);
      if (profile) {
        setUserProfile(profile);
        setNeedsOnboarding(false);
        updatePresence(uid, true);
      } else {
        // Needs onboarding to choose unique username
        setUserProfile(null);
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // In case of error, if user exists we still let them proceed to onboarding
      setNeedsOnboarding(true);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadProfile(user.uid, user);
      } else {
        setUserProfile(null);
        setNeedsOnboarding(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Track online/offline status
  useEffect(() => {
    if (!currentUser || !userProfile) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        updatePresence(currentUser.uid, true);
      } else {
        updatePresence(currentUser.uid, false);
      }
    };

    const handleUnload = () => {
      updatePresence(currentUser.uid, false);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [currentUser, userProfile]);

  const login = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        setCurrentUser(user);
        await loadProfile(user.uid, user);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (currentUser) {
      try {
        await updatePresence(currentUser.uid, false);
      } catch (e) {
        console.warn('Could not update presence on logout:', e);
      }
    }
    await logoutUser();
    setCurrentUser(null);
    setUserProfile(null);
    setNeedsOnboarding(false);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      const profile = await getUserProfile(currentUser.uid);
      if (profile) {
        setUserProfile(profile);
      }
    }
  };

  const completeOnboarding = async (data: {
    displayName: string;
    username: string;
    bio?: string;
    photoURL?: string;
  }) => {
    if (!currentUser) throw new Error('No authenticated user');
    setLoading(true);
    try {
      const profile = await createUserProfile(currentUser.uid, {
        displayName: data.displayName,
        username: data.username,
        email: currentUser.email || '',
        photoURL: data.photoURL || currentUser.photoURL || '',
        bio: data.bio || '',
      });
      setUserProfile(profile);
      setNeedsOnboarding(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        needsOnboarding,
        login,
        logout,
        refreshProfile,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
