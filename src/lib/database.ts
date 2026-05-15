import { DatabaseAdapter, setAdapter } from './dbAdapter';
import { FirebaseAdapter } from './firebaseAdapter';
import { IndexedDBAdapter } from './indexedDBAdapter';

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
    // ✍️ El Capitán (Appwrite) manda. Si falla, lanzamos error para reintentar.
    await this.primary.setDocument(collection, id, data);
    
    // El Suplente (Firebase) es opcional. Si falla, solo avisamos.
    if (this.shadow) {
      try {
        await this.shadow.setDocument(collection, id, data);
      } catch (e) {
        console.warn(`⚠️ [NEXUS]: Fallo silencioso en Suplente (Firebase).`);
      }
    }
  }

  async deleteDocument(collection: string, id: string) {
    await this.primary.deleteDocument(collection, id);

    if (this.shadow) {
      try {
        await this.shadow.deleteDocument(collection, id);
      } catch (e) {
        console.warn(`⚠️ [NEXUS]: Fallo silencioso en Suplente al borrar.`);
      }
    }
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

// ─── COLECCIONES QUE SE HIDRATAN DESDE FIREBASE AL ARRANCAR ───
const COLECCIONES_PRINCIPALES = [
  'Members',
  'Productos',
  'catalogs',
  'transactions',
  'configuracion'
];

/**
 * 🌊 HYDRATE: Carga datos de Firebase → IndexedDB al arrancar.
 * Solo hidrata si la colección local está vacía.
 */
async function hydratarDesdeNube(
  localDB: IndexedDBAdapter,
  nube: FirebaseAdapter,
  colecciones: string[]
): Promise<void> {
  console.log('🌊 [NEXUS]: Iniciando hidratación Firebase → IndexedDB...');
  for (const col of colecciones) {
    try {
      const localCount = await localDB.count(col);
      if (localCount === 0) {
        const datosNube = await nube.getCollection<any>(col);
        if (datosNube.length > 0) {
          await localDB.hydrateFromCloud(col, datosNube);
        }
      } else {
        console.log(`✅ [NEXUS]: '${col}' ya tiene ${localCount} items locales. No se sobrescribe.`);
      }
    } catch (e) {
      console.warn(`⚠️ [NEXUS]: No se pudo hidratar '${col}'.`, e);
    }
  }
  console.log('✅ [NEXUS]: Hidratación completada.');
}

let mainDatabase: DatabaseAdapter;

const hasFirebase = !!import.meta.env.VITE_FIREBASE_API_KEY;

console.log("📡 [NEXUS CONFIG]:", {
  hasFirebase,
  project: import.meta.env.VITE_FIREBASE_PROJECT_ID
});

// 1️⃣ MOTOR LOCAL — IndexedDB: SIEMPRE activo, fuente de verdad offline
const localAdapter = new IndexedDBAdapter();

// 2️⃣ MOTOR NUBE — Firebase: activo solo si hay credenciales
const firebaseAdapter = hasFirebase ? new FirebaseAdapter(firebaseConfig) : null;

// 3️⃣ ORQUESTADOR — IndexedDB (primario) + Firebase (sombra)
const activeAdapter: DatabaseAdapter = firebaseAdapter
  ? new MultiAdapter(localAdapter, firebaseAdapter)
  : localAdapter;

// Inicialización con hidratación automática al arrancar
(async () => {
  try {
    await activeAdapter.init();
    if (firebaseAdapter) {
      // Cargar datos de Firebase → IndexedDB si el local está vacío
      await hydratarDesdeNube(localAdapter, firebaseAdapter, COLECCIONES_PRINCIPALES);
    } else {
      console.log('📴 [NEXUS]: Sin Firebase. Modo 100% Offline (IndexedDB).');
    }
  } catch (e) {
    console.error('❌ [NEXUS]: Error crítico al inicializar DB.', e);
  }
})();

setAdapter(activeAdapter);
export const gymDatabase = activeAdapter;

