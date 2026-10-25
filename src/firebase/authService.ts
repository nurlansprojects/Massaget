import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { auth, googleProvider } from './config';

export async function loginWithGoogle(): Promise<User | null> {
  try {
    // Ensure originValidation is bypassed and clear any stale rejected promises
    if (typeof window !== 'undefined' && browserPopupRedirectResolver) {
      try {
        const resolverProto = (browserPopupRedirectResolver as any)?.prototype || (browserPopupRedirectResolver as any);
        if (resolverProto) {
          resolverProto._originValidation = () => Promise.resolve();
        }
        const authInstance = auth as any;
        if (authInstance._popupRedirectResolver) {
          authInstance._popupRedirectResolver._originValidation = () => Promise.resolve();
          authInstance._popupRedirectResolver.originValidationPromises = {};
        }
      } catch (e) {
        console.warn('Resolver preparation warning:', e);
      }
    }

    const result = await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    return result.user;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    if (
      firebaseError.code === 'auth/popup-closed-by-user' ||
      firebaseError.code === 'auth/cancelled-popup-request'
    ) {
      // User dismissed the popup
      return null;
    }
    if (firebaseError.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups or open in a new tab.');
    }
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
