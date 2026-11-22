import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, setLogLevel, doc, getDocFromServer } from 'firebase/firestore';
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
export const PRODUCTS_STORAGE_BUCKET = 'studio-5367437135-24ac6.firebasestorage.app';
export const productsStorage = getStorage(app, `gs://${PRODUCTS_STORAGE_BUCKET}`);
export const googleProvider = new GoogleAuthProvider();

// Set persistence to LOCAL (survives browser restarts)
setPersistence(auth, browserLocalPersistence).catch(console.error);

export async function testFirestoreConnection(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
