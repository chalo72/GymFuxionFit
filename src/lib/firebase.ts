import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

/* ══════════════════════════════════════════
   FIREBASE CORE (EL SUPLENTE)
   Real-time Failover Layer
══════════════════════════════════════════ */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validar que las credenciales existen antes de inicializar para evitar caídas
const isFirebaseConfigured = Object.values(firebaseConfig).every((val) => Boolean(val));

export const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const firebaseDb = firebaseApp ? getFirestore(firebaseApp) : null;

if (!isFirebaseConfigured) {
  console.warn("⚠️ Firebase no está configurado correctamente en el .env. El Suplente está desactivado.");
} else {
  console.log("✅ Suplente (Firebase) inicializado y en espera.");
}

export const hasFirebase = () => isFirebaseConfigured;
