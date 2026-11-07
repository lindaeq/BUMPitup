import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
export const PATIENT_ID = 'demo-patient-01';
const missing = ['apiKey', 'projectId', 'appId'].filter(key => !config[key]);
export const configError = missing.length ? `Missing Firebase configuration: ${missing.join(', ')}. Fill in .env.local using .env.example and restart Vite.` : '';
export const db = configError ? null : getFirestore(initializeApp(config));
export function firebaseError(error) {
  return error.code === 'permission-denied'
    ? 'Firestore denied access. Check the demo rules and their expiry in Firebase Console.'
    : `Firebase error (${error.code || 'unknown'}): ${error.message}`;
}
