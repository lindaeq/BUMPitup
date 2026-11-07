import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}
export const PATIENT_ID = 'demo-patient-01'
export const configError = !config.apiKey || !config.projectId || !config.appId
  ? 'Firebase configuration is incomplete. Fill in apps/web/.env.local from .env.example and restart Vite.'
  : ''
export const db = configError ? null : getFirestore(initializeApp(config))
export function firebaseError(error: unknown): string {
  const issue = error as { code?: string; message?: string }
  return issue.code === 'permission-denied'
    ? 'Firestore denied access. Check the demo rules and expiry in Firebase Console.'
    : `Firebase error: ${issue.message || 'Unknown error'}`
}
