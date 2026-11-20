import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, setLogLevel } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../../firebase-applet-config.json';

// Silence noisy internal WebChannel/gRPC idle stream disconnect logs
setLogLevel('silent');

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(
  app,
  { experimentalAutoDetectLongPolling: true },
  (firebaseConfig as any).firestoreDatabaseId
);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Set persistence to LOCAL (survives browser restarts)
setPersistence(auth, browserLocalPersistence).catch(console.error);
