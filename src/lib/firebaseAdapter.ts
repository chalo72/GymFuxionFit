import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { DatabaseAdapter } from './dbAdapter';

/**
 * 🔥 FIREBASE ADAPTER
 * Implementación de la interfaz usando Google Firebase / Firestore.
 */
export class FirebaseAdapter implements DatabaseAdapter {
  private db: any;

  constructor(config: any) {
    const app = initializeApp(config);
    this.db = getFirestore(app);
  }

  async init(): Promise<void> {
    try {
      await enableIndexedDbPersistence(this.db);
      console.log("🔥 Firebase Adapter Initialized with Offline Sync");
    } catch (err: any) {
      console.warn("Offline persistence failed (could be multiple tabs):", err.message);
    }
  }

  private normalizeName(name: string): string {
    const map: Record<string, string> = {
      'products': 'Productos',
      'members': 'Members',
      'transactions': 'transactions'
    };
    return map[name.toLowerCase()] || name;
  }

  async getCollection<T>(name: string): Promise<T[]> {
    const colName = this.normalizeName(name);
    const snap = await getDocs(collection(this.db, colName));
    return snap.docs.map(d => ({ ...d.data(), id: d.id })) as T[];
  }

  async getDocument<T>(name: string, id: string): Promise<T | null> {
    const colName = this.normalizeName(name);
    const snap = await getDoc(doc(this.db, colName, id));
    return snap.exists() ? ({ ...snap.data(), id: snap.id } as T) : null;
  }

  async setDocument<T>(name: string, id: string, data: T): Promise<void> {
    const colName = this.normalizeName(name);
    await setDoc(doc(this.db, colName, id), data as any, { merge: true });
  }

  async deleteDocument(name: string, id: string): Promise<void> {
    const colName = this.normalizeName(name);
    await deleteDoc(doc(this.db, colName, id));
  }

  subscribe<T>(name: string, callback: (data: T[]) => void): () => void {
    const colName = this.normalizeName(name);
    return onSnapshot(collection(this.db, colName), (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id })) as T[];
      callback(data);
    });
  }
}
