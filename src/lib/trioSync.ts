import { gymDatabase } from './database';

const QUEUE_STORAGE_KEY = 'nexus_sync_queue';

interface SyncTask {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  timestamp: number;
  retries?: number;
}

class TrioSync {
  private queue: SyncTask[] = [];
  private isProcessing = false;
  private listeners: ((count: number) => void)[] = [];

  constructor() {
    const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (saved) {
      try {
        this.queue = JSON.parse(saved);
      } catch (e) {
        this.queue = [];
      }
    }
    
    // Iniciar procesamiento si hay tareas
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 2000);
    }
  }

  subscribe(callback: (count: number) => void) {
    this.listeners.push(callback);
    callback(this.queue.length);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.queue.length));
  }

  private saveQueue() {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    this.notify();
  }

  async create(table: string, data: any) {
    const enriched = { 
      ...data, 
      syncStatus: 'pending',
      lastUpdate: new Date().toISOString() 
    };
    this.addTask({ action: 'CREATE', table, data: enriched, timestamp: Date.now() });
    return enriched;
  }

  async update(table: string, id: string, data: any) {
    this.addTask({ action: 'UPDATE', table, data: { ...data, id }, timestamp: Date.now() });
  }

  async delete(table: string, id: string) {
    this.addTask({ action: 'DELETE', table, data: { id }, timestamp: Date.now() });
  }

  private addTask(task: SyncTask) {
    this.queue.push(task);
    this.saveQueue();
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;
    
    const task = this.queue[0];
    try {
      if (!task.retries) task.retries = 0;
      
      console.log(`📡 [TRIO-SYNC]: Procesando ${task.action} en ${task.table} (Intento ${task.retries + 1})...`);
      
      if (task.action === 'CREATE' || task.action === 'UPDATE') {
        await gymDatabase.setDocument(task.table, task.data.id, task.data);
      } else if (task.action === 'DELETE') {
        await gymDatabase.deleteDocument(task.table, task.data.id);
      }
      
      this.queue.shift();
      this.saveQueue();
      this.isProcessing = false;
      this.processQueue();
    } catch (e) {
      task.retries = (task.retries || 0) + 1;
      if (task.retries >= 3) {
        console.error('⚠️ [TRIO-SYNC]: Tarea fallida tras 3 intentos. Saltando para desbloquear cola.', task);
        this.queue.shift(); // Saltamos la tarea problemática
        this.saveQueue();
      } else {
        console.error('❌ [TRIO-SYNC]: Error en intento. Reintentando en breve...', e);
      }
      
      this.isProcessing = false;
      const delay = Math.min(5000 * (this.queue.length > 5 ? 2 : 1), 30000);
      setTimeout(() => this.processQueue(), delay);
    }
  }

  getPendingCount() {
    return this.queue.length;
  }

  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
}

export const trioSync = new TrioSync();
