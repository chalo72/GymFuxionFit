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

  // 🛡️ NEXUS TIMEOUT GUARD: Evita bloqueos infinitos de la nube
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T | any> {
    let timeoutHandle: any;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error('NEXUS_TIMEOUT')), timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutHandle));
  }

  async getCollection<T>(name: string) {
    try {
      // 🔍 DEEP FETCH: Si el primario está vacío, probamos con el suplente
      const data = await this.withTimeout(this.primary.getCollection<T>(name));
      if ((!data || data.length === 0) && this.shadow) {
        console.log(`⚠️ [NEXUS]: ${name} vacío en Capitán. Intentando recuperar desde Suplente...`);
        return this.withTimeout(this.shadow.getCollection<T>(name));
      }
      return data || [];
    } catch (e) {
      console.warn(`⏳ [NEXUS]: Timeout/Error en ${name}. Usando memoria local.`);
      return [];
    }
  }

  async getDocument<T>(collection: string, id: string) {
    try {
      const doc = await this.withTimeout(this.primary.getDocument<T>(collection, id));
      if (!doc && this.shadow) return this.withTimeout(this.shadow.getDocument<T>(collection, id));
      return doc;
    } catch (e) {
      return null;
    }
  }

  async setDocument<T>(collection: string, id: string, data: T) {
    // ✍️ ESCRITURA DUAL: Guardamos en ambos motores para redundancia total
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
    // Nos suscribimos al primario
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
  project: import.meta.env.VITE_APPWRITE_PROJECT_ID || import.meta.env.VITE_APPWRITE_PROJECT,
  database: import.meta.env.VITE_APPWRITE_DATABASE_ID || import.meta.env.VITE_APPWRITE_DATABASE || 'main'
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

console.log("📡 [NEXUS CONFIG]:", {
  hasFirebase,
  hasAppwrite,
  appwriteDb: appwriteConfig.database,
  appwriteProject: appwriteConfig.project
});

// 🛡️ REGLA DE ORO ANTIGRAVITY: Prioridad Total a Appwrite (Capitán) y Firebase (Suplente)
const firebaseAdapter = hasFirebase ? new FirebaseAdapter(firebaseConfig) : null;
const appwriteAdapter = hasAppwrite ? new AppwriteAdapter(appwriteConfig.endpoint, appwriteConfig.project, appwriteConfig.database) : null;

try {
  if (appwriteAdapter && firebaseAdapter) {
    console.log("💎 [NEXUS]: MODO HÍBRIDO ELITE — Appwrite (Capitán) + Firebase (Suplente)");
    mainDatabase = new MultiAdapter(appwriteAdapter, firebaseAdapter);
  } else if (appwriteAdapter) {
    console.log("🖋️ [NEXUS]: MODO SINGLE — Usando Appwrite como Capitán principal.");
    mainDatabase = appwriteAdapter;
  } else if (firebaseAdapter) {
    console.log("🔥 [NEXUS]: MODO SINGLE — Usando Firebase de emergencia.");
    mainDatabase = firebaseAdapter;
  } else {
    // 🛡️ MODO LOCAL SEGURO: Sin bases de datos cloud
    console.warn("🛡️ [NEXUS]: Sin conexión Cloud. Iniciando en Modo Local Seguro.");
    mainDatabase = new LocalFallbackAdapter();
  }
} catch (e) {
  console.error("❌ [NEXUS]: Error en inicialización. Usando Modo Local.", e);
  mainDatabase = new LocalFallbackAdapter();
}

mainDatabase.init();
setAdapter(mainDatabase);

export const gymDatabase = mainDatabase;
