import { DatabaseAdapter, setAdapter } from './dbAdapter';
import { FirebaseAdapter } from './firebaseAdapter';
import { IndexedDBAdapter } from './indexedDBAdapter';

const COLLECTION_MAPPING: Record<string, string> = {
  'members': 'Members',
  'products': 'Productos'
};

function mapCollectionName(name: string): string {
  return COLLECTION_MAPPING[name] || name;
}

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
    const mappedName = mapCollectionName(name);
    try {
      // 🔍 DEEP FETCH: Si el primario está vacío, probamos con el suplente
      const data = await this.withTimeout(this.primary.getCollection<T>(mappedName));
      if ((!data || data.length === 0) && this.shadow) {
        console.log(`⚠️ [NEXUS]: ${mappedName} vacío en Capitán. Intentando recuperar desde Suplente...`);
        return this.withTimeout(this.shadow.getCollection<T>(mappedName));
      }
      return data || [];
    } catch (e) {
      console.warn(`⏳ [NEXUS]: Timeout/Error en ${mappedName}. Usando memoria local.`);
      return [];
    }
  }

  async getDocument<T>(collection: string, id: string) {
    const mappedName = mapCollectionName(collection);
    try {
      const doc = await this.withTimeout(this.primary.getDocument<T>(mappedName, id));
      if (!doc && this.shadow) return this.withTimeout(this.shadow.getDocument<T>(mappedName, id));
      return doc;
    } catch (e) {
      return null;
    }
  }

  async setDocument<T>(collection: string, id: string, data: T) {
    const mappedName = mapCollectionName(collection);
    // ✍️ El Capitán manda.
    await this.primary.setDocument(mappedName, id, data);
    
    // El Suplente (Firebase) es opcional.
    if (this.shadow) {
      try {
        await this.shadow.setDocument(mappedName, id, data);
        console.log(`✅ [NEXUS]: Sincronizado con Firebase: ${mappedName}/${id}`);
      } catch (e) {
        console.warn(`⚠️ [NEXUS]: Fallo silencioso en Suplente (Firebase).`, e);
      }
    }
  }

  async deleteDocument(collection: string, id: string) {
    const mappedName = mapCollectionName(collection);
    await this.primary.deleteDocument(mappedName, id);

    if (this.shadow) {
      try {
        await this.shadow.deleteDocument(mappedName, id);
      } catch (e) {
        console.warn(`⚠️ [NEXUS]: Fallo silencioso en Suplente al borrar.`);
      }
    }
  }

  subscribe<T>(collection: string, callback: (data: T[]) => void) {
    const mappedName = mapCollectionName(collection);
    
    // Nos suscribimos al primario (IndexedDB - Polling)
    const unsubPrimary = this.primary.subscribe(mappedName, callback);
    
    // 🚀 MODO ARMAGEDON: Nos suscribimos también a Firebase (Tiempo Real)
    let unsubShadow = () => {};
    if (this.shadow) {
      unsubShadow = this.shadow.subscribe(mappedName, (data) => {
        console.log(`📡 [NEXUS]: Actualización en tiempo real desde Firebase para ${mappedName}`);
        callback(data as T[]);
      });
    }
    
    return () => {
      unsubPrimary();
      unsubShadow();
    };
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
  'members',
  'products',
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
    const firebaseCol = mapCollectionName(col);
    try {
      const localCount = await localDB.count(firebaseCol);
      if (localCount === 0) {
        const datosNube = await nube.getCollection<any>(firebaseCol);
        if (datosNube.length > 0) {
          await localDB.hydrateFromCloud(firebaseCol, datosNube);
        }
      } else {
        console.log(`✅ [NEXUS]: '${firebaseCol}' ya tiene ${localCount} items locales. No se sobrescribe.`);
      }
    } catch (e) {
      console.warn(`⚠️ [NEXUS]: No se pudo hidratar '${firebaseCol}'.`, e);
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

