import { DatabaseAdapter, setAdapter } from './dbAdapter';
import { SupabaseAdapter } from './supabaseAdapter';
import { FirebaseAdapter } from './firebaseAdapter';
import { AppwriteAdapter } from './appwriteAdapter';

/**
 * 🛰️ MULTI-ENGINE ADAPTER
 * Esta clase especial coordina múltiples bases de datos al mismo tiempo.
 */
class MultiAdapter implements DatabaseAdapter {
  constructor(private primary: DatabaseAdapter, private shadow?: DatabaseAdapter) {}

  async init() {
    await this.primary.init();
    if (this.shadow) await this.shadow.init();
  }

  async getCollection<T>(name: string) {
    // Siempre leemos del primario para máxima velocidad
    return this.primary.getCollection<T>(name);
  }

  async getDocument<T>(collection: string, id: string) {
    return this.primary.getDocument<T>(collection, id);
  }

  async setDocument<T>(collection: string, id: string, data: T) {
    // ✍️ ESCRITURA DUAL: Guardamos en ambos motores
    const p1 = this.primary.setDocument(collection, id, data);
    const p2 = this.shadow ? this.shadow.setDocument(collection, id, data) : Promise.resolve();
    await Promise.all([p1, p2]);
  }

  async deleteDocument(collection: string, id: string) {
    const p1 = this.primary.deleteDocument(collection, id);
    const p2 = this.shadow ? this.shadow.deleteDocument(collection, id) : Promise.resolve();
    await Promise.all([p1, p2]);
  }

  subscribe<T>(collection: string, callback: (data: T[]) => void) {
    // Nos suscribimos solo al primario para evitar colisiones en la UI
    return this.primary.subscribe(collection, callback);
  }
}

// ─── CONFIGURACIÓN DE INSTANCIAS ───

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const appwriteConfig = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  project: import.meta.env.VITE_APPWRITE_PROJECT,
  database: import.meta.env.VITE_APPWRITE_DATABASE || 'main'
};

let mainDatabase: DatabaseAdapter;

const hasFirebase = !!import.meta.env.VITE_FIREBASE_API_KEY;
const hasAppwrite = !!import.meta.env.VITE_APPWRITE_ENDPOINT;

// 🛡️ REGLA DE ORO ANTIGRAVITY: Supabase es siempre la Fuente de Verdad Primaria
const supabaseAdapter = new SupabaseAdapter();

try {
  if (hasFirebase || hasAppwrite) {
    console.log("💎 MODO HÍBRIDO ACTIVADO: Supabase (Primario) + Respaldo Cloud");
    
    // Si hay Firebase, lo usamos como Shadow principal. Si no, Appwrite.
    const shadowAdapter = hasFirebase 
      ? new FirebaseAdapter(firebaseConfig)
      : new AppwriteAdapter(appwriteConfig.endpoint, appwriteConfig.project, appwriteConfig.database);

    mainDatabase = new MultiAdapter(supabaseAdapter, shadowAdapter);
  } else {
    console.log("🔌 MODO SINGLE: Usando Supabase como único motor.");
    mainDatabase = supabaseAdapter;
  }
} catch (e) {
  console.error("❌ Error inicializando adaptadores premium, cayendo a Supabase puro:", e);
  mainDatabase = supabaseAdapter;
}

mainDatabase.init();
setAdapter(mainDatabase);

export const gymDatabase = mainDatabase;
