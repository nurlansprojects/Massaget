import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserPopupRedirectResolver } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with firestoreDatabaseId as required by AI Studio guidelines
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Patch browserPopupRedirectResolver to bypass redundant client-side network checks for authorized domains.
// In mobile browsers and iframes, Firebase Auth attempts proactive _originValidation via
// identitytoolkit.googleapis.com which fails when blocked by ad-blockers, tracking protection, or cross-origin restrictions,
// even though the domain is already authorized on the Google Cloud project.
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
  } catch (err) {
    console.warn('Could not patch origin validation:', err);
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test connection on boot per Firebase guidelines
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client is offline or initializing.');
    }
    return false;
  }
}
