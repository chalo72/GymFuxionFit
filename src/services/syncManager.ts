import { trioSync } from '../lib/trioSync';
import { gymDatabase } from '../lib/database';

class SyncManagerService {
  private bc: BroadcastChannel;
  
  constructor() {
    this.bc = new BroadcastChannel('fuxion_sync_channel');
  }

  // 📡 Realtime Subscriptions
  subscribeToCollection<T>(collection: string, callback: (items: T[]) => void) {
    return gymDatabase.subscribe<T>(collection, callback);
  }

  // 🔗 Cross-tab Broadcast
  broadcast(type: string, data: any) {
    this.bc.postMessage({ type, data });
  }

  onBroadcast(callback: (type: string, data: any) => void) {
    this.bc.onmessage = (event) => {
      callback(event.data.type, event.data.data);
    };
  }

  // ☁️ Hybrid Persistence (TrioSync)
  async create(collection: string, data: any) { 
    return trioSync.create(collection, data); 
  }
  
  async update(collection: string, id: string, data: any) { 
    return trioSync.update(collection, id, data); 
  }
  
  async delete(collection: string, id: string) { 
    return trioSync.delete(collection, id); 
  }
  
  clearQueue() { 
    trioSync.clearQueue(); 
  }
  
  subscribeQueue(callback: (count: number) => void) { 
    return trioSync.subscribe(callback); 
  }
}

export const syncManager = new SyncManagerService();
