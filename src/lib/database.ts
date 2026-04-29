import { DatabaseAdapter, setAdapter } from './dbAdapter';
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

/**
 * 🏠 LOCAL FALLBACK ADAPTER
 * Se activa solo si no hay llaves de Firebase/Appwrite.
 * Evita errores de red y franjas rojas de sincronización.
 */
class LocalFallbackAdapter implements DatabaseAdapter {
  async init() { console.log("🏠 [NEXUS]: Operando en MODO LOCAL SEGURO."); }
  async getCollection<T>() { return []; }
  async getDocument<T>() { return null; }
  async setDocument() { /* Persistencia local manejada por useGymData */ }
  async deleteDocument() { }
  subscribe() { return () => {}; }
}

let mainDatabase: DatabaseAdapter;

const hasFirebase = !!import.meta.env.VITE_FIREBASE_API_KEY;
const hasAppwrite = !!import.meta.env.VITE_APPWRITE_ENDPOINT;

// 🛡️ REGLA DE ORO ANTIGRAVITY: Prioridad Total a Firebase (Primario) y Appwrite (Shadow)
const firebaseAdapter = hasFirebase ? new FirebaseAdapter(firebaseConfig) : null;
const appwriteAdapter = hasAppwrite ? new AppwriteAdapter(appwriteConfig.endpoint, appwriteConfig.project, appwriteConfig.database) : null;

try {
  if (firebaseAdapter && appwriteAdapter) {
    console.log("💎 [NEXUS]: MODO HÍBRIDO ELITE — Firebase (Primario) + Appwrite (Shadow)");
    mainDatabase = new MultiAdapter(firebaseAdapter, appwriteAdapter);
  } else if (firebaseAdapter) {
    console.log("🔥 [NEXUS]: MODO SINGLE — Usando Firebase como motor primario.");
    mainDatabase = firebaseAdapter;
  } else if (appwriteAdapter) {
    console.log("🖋️ [NEXUS]: MODO SINGLE — Usando Appwrite como motor primario.");
    mainDatabase = appwriteAdapter;
  } else {
    // 🛡️ MODO LOCAL SEGURO: Supabase ha sido DESACTIVADO por orden del usuario
    console.warn("🛡️ [NEXUS]: Supabase desactivado. Iniciando en Modo Local Seguro.");
    mainDatabase = new LocalFallbackAdapter();
  }
} catch (e) {
  console.error("❌ [NEXUS]: Error en inicialización. Usando Modo Local.", e);
  mainDatabase = new LocalFallbackAdapter();
}

mainDatabase.init();
setAdapter(mainDatabase);

export const gymDatabase = mainDatabase;
