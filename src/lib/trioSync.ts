import { gymDatabase } from './database';

/**
 * 🏎️ TRIO-SYNC ENGINE v2.0 (The Offline-First Auto-Healer)
 * Garantiza integridad de datos, previene duplicados y sincroniza 
 * automáticamente entre LocalStorage, Appwrite y Firebase.
 */

interface SyncTask {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  data?: any;
  timestamp: number;
}

const SYNC_QUEUE_KEY = 'nexus_sync_queue';

class TrioSyncEngine {
  private queue: SyncTask[] = [];
  private isProcessing = false;
  private isOnline = navigator.onLine;

  constructor() {
    this.loadQueue();
    
    // Escuchar cambios de red para auto-curación
    window.addEventListener('online', () => {
      console.log("🌐 [TRIO-SYNC]: Conexión restaurada. Procesando cola pendiente...");
      this.isOnline = true;
      this.processQueue();
    });
    
    window.addEventListener('offline', () => {
      console.warn("⚠️ [TRIO-SYNC]: Conexión perdida. Activando modo Offline Seguro.");
      this.isOnline = false;
    });

    // Procesar la cola inicialmente si hay internet
    if (this.isOnline) {
      setTimeout(() => this.processQueue(), 2000);
    }
  }

  private loadQueue() {
    try {
      const saved = localStorage.getItem(SYNC_QUEUE_KEY);
      if (saved) {
        this.queue = JSON.parse(saved);
        console.log(`📦 [TRIO-SYNC]: ${this.queue.length} tareas cargadas en cola.`);
      }
    } catch (e) {
      console.error("Error cargando cola de sincronización", e);
    }
  }

  private saveQueue() {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.queue));
  }

  private addTask(task: Omit<SyncTask, 'id' | 'timestamp'>) {
    const fullTask: SyncTask = {
      ...task,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };
    
    // Anti-duplicación y compresión de la cola:
    // Si hay una actualización de un documento que ya estaba en la cola para actualizarse,
    // podemos fusionarlos para no saturar la red cuando vuelva.
    if (task.action === 'UPDATE') {
      const existingIdx = this.queue.findIndex(t => t.table === task.table && t.data?.id === task.data?.id && t.action === 'UPDATE');
      if (existingIdx >= 0) {
        this.queue[existingIdx].data = { ...this.queue[existingIdx].data, ...task.data };
        this.queue[existingIdx].timestamp = Date.now();
        this.saveQueue();
        this.processQueue();
        return;
      }
    }

    this.queue.push(fullTask);
    this.saveQueue();
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || !this.isOnline || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0 && this.isOnline) {
      const task = this.queue[0];
      try {
        if (task.action === 'CREATE' || task.action === 'UPDATE') {
          await gymDatabase.setDocument(task.table, task.data.id, task.data);
        } else if (task.action === 'DELETE') {
          await gymDatabase.deleteDocument(task.table, task.data.id);
        }
        
        // Tarea exitosa, remover de la cola
        this.queue.shift();
        this.saveQueue();
      } catch (error) {
        console.error(`❌ [TRIO-SYNC]: Fallo procesando tarea ${task.action} en ${task.table}. Reintentando luego.`, error);
        break; // Detener el procesamiento si hay un error persistente (ej. fallo de red)
      }
    }

    this.isProcessing = false;
  }

  // --- API PUBLICA ---

  async create(table: string, data: any) {
    const id = data.id || crypto.randomUUID();
    const enriched = {
      ...data,
      id,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_layer: 'trio-engine'
    };

    // 1. Guardado en background via Cola (Garantiza que nunca se pierda)
    this.addTask({ action: 'CREATE', table, data: enriched });
    return enriched;
  }

  async update(table: string, id: string, changes: any) {
    const enriched = {
      ...changes,
      id,
      updated_at: new Date().toISOString()
    };

    // 1. Añadir a la cola para sincronización cloud
    this.addTask({ action: 'UPDATE', table, data: enriched });
    return enriched;
  }

  async delete(table: string, id: string) {
    this.addTask({ action: 'DELETE', table, data: { id } });
  }
}

export const trioSync = new TrioSyncEngine();
