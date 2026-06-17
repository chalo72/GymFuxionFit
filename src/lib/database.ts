import { DatabaseAdapter, setAdapter } from './dbAdapter';
import { FirebaseAdapter } from './firebaseAdapter';
import { SupabaseAdapter } from './supabaseAdapter';
import { hasSupabase } from './supabase';
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
    
    // El Suplente (Supabase) es opcional.
    if (this.shadow) {
      try {
        await this.shadow.setDocument(mappedName, id, data);
        console.log(`✅ [NEXUS]: Sincronizado con Supabase: ${mappedName}/${id}`);
      } catch (e) {
        console.warn(`⚠️ [NEXUS]: Fallo silencioso en Suplente (Supabase).`, e);
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

    if (this.shadow) {
      // Con Supabase activo: carga inicial de IndexedDB + realtime exclusivo de Supabase
      // NO hacemos polling de IndexedDB para evitar conflictos con borrados/ediciones
      this.primary.getCollection<T>(mappedName)
        .then(data => { if (data && data.length > 0) callback(data); })
        .catch(console.error);

      const unsubShadow = this.shadow.subscribe(mappedName, async (data) => {
        console.log(`📡 [NEXUS]: Realtime Supabase → ${mappedName}`);
        
        try {
          // Obtener locales para no perder registros offline o pendientes de subida
          const localData = await this.primary.getCollection<any>(mappedName);
          const cloudIds = new Set((data as any[]).map(d => String(d.id || d.$id || d.ID)));
          
          const localesFaltantes = localData.filter(d => {
             const id = String(d.id || d.$id || d.ID);
             return id && id !== 'undefined' && !cloudIds.has(id);
          });

          // Guardamos en local lo que vino de la nube
          if ((this.primary as any).hydrateFromCloud) {
             await (this.primary as any).hydrateFromCloud(mappedName, data);
          }
          
          // Entregamos a la UI la lista combinada
          const merged = [...data, ...localesFaltantes];
          callback(merged as T[]);
        } catch(e) {
          console.warn(`⚠️ [NEXUS]: Error en merge realtime para ${mappedName}`, e);
          callback(data as T[]);
        }
      });

      return unsubShadow;
    }

    // Sin Supabase: polling de IndexedDB como fallback
    return this.primary.subscribe(mappedName, callback);
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

// ─── COLECCIONES QUE SE SINCRONIZAN DESDE SUPABASE AL ARRANCAR ───
const COLECCIONES_PRINCIPALES = [
  'members',
  'products',
  'catalogs',
  'transactions',
  'configuracion',
  'goals',
  'obligations',
  'staff',
  'assets',
];

/**
 * 🌊 SYNC: Siempre descarga Supabase → IndexedDB al arrancar.
 * Garantiza que cada dispositivo tenga los datos más recientes de la nube.
 * Los items locales que no existen en la nube se preservan (merge, no overwrite).
 */
async function hydratarDesdeNube(
  localDB: IndexedDBAdapter,
  nube: DatabaseAdapter,
  colecciones: string[]
): Promise<void> {
  console.log('🌊 [NEXUS]: Sincronizando Supabase → IndexedDB...');
  for (const col of colecciones) {
    const mappedCol = mapCollectionName(col);
    try {
      const datosNube = await nube.getCollection<any>(mappedCol);
      const datosLocales = await localDB.getCollection<any>(mappedCol);
      
      if (datosNube.length > 0) {
        await localDB.hydrateFromCloud(mappedCol, datosNube);
        console.log(`✅ [NEXUS]: '${mappedCol}' sincronizado desde nube (${datosNube.length} items)`);
      }
      
      if (datosLocales.length > 0) {
        const nubeIds = new Set(datosNube.map(d => String(d.id || d.$id || d.ID)));
        const faltantes = datosLocales.filter(d => {
           const id = String(d.id || d.$id || d.ID);
           return id && id !== 'undefined' && id !== 'null' && !nubeIds.has(id);
        });
        
        if (faltantes.length > 0) {
           console.log(`🚀 [NEXUS]: '${mappedCol}' subiendo ${faltantes.length} items locales a la nube...`);
           for (const item of faltantes) {
              await nube.setDocument(mappedCol, String(item.id || item.$id || item.ID), item);
           }
           console.log(`✅ [NEXUS]: Subida completada para '${mappedCol}'`);
        }
      }
    } catch (e) {
      console.warn(`⚠️ [NEXUS]: Fallo sync bidireccional en '${mappedCol}'.`, e);
    }
  }
  console.log('✅ [NEXUS]: Sincronización inicial completada.');
}

let mainDatabase: DatabaseAdapter;

const hasFirebase = !!import.meta.env.VITE_FIREBASE_API_KEY;

console.log("📡 [NEXUS CONFIG]:", {
  hasFirebase,
  hasSupabase,
  project: import.meta.env.VITE_FIREBASE_PROJECT_ID
});

// 1️⃣ MOTOR LOCAL — IndexedDB: SIEMPRE activo, fuente de verdad offline
const localAdapter = new IndexedDBAdapter();

// 2️⃣ MOTOR NUBE — Supabase primero (WebSockets, no bloqueado por adblockers)
//    Firebase como fallback si no hay Supabase
const supabaseAdapter = hasSupabase ? new SupabaseAdapter() : null;
const firebaseAdapter = hasFirebase ? new FirebaseAdapter(firebaseConfig) : null;
const shadowAdapter = supabaseAdapter || firebaseAdapter;

// 3️⃣ ORQUESTADOR — IndexedDB (primario) + Supabase (sombra realtime)
const activeAdapter: DatabaseAdapter = shadowAdapter
  ? new MultiAdapter(localAdapter, shadowAdapter)
  : localAdapter;

// Inicialización con hidratación automática al arrancar
// dbReady se exporta para que los consumidores esperen antes de leer datos
export const dbReady = (async () => {
  try {
    await activeAdapter.init();
    const cloudSource = supabaseAdapter || firebaseAdapter;
    if (cloudSource) {
      await hydratarDesdeNube(localAdapter, cloudSource, COLECCIONES_PRINCIPALES);
    } else {
      console.log('📴 [NEXUS]: Sin nube. Modo 100% Offline (IndexedDB).');
    }
  } catch (e) {
    console.error('❌ [NEXUS]: Error crítico al inicializar DB.', e);
  }
})();

setAdapter(activeAdapter);
export const gymDatabase = activeAdapter;

