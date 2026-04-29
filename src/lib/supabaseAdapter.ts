import { supabase } from './supabase';
import { DatabaseAdapter } from './dbAdapter';

/**
 * 🛡️ SUPABASE ADAPTER
 * Implementación de la interfaz usando el cliente de Supabase actual.
 */
export class SupabaseAdapter implements DatabaseAdapter {
  async init(): Promise<void> {
    console.log("🔌 Supabase Adapter Initialized");
  }

  async getCollection<T>(name: string): Promise<T[]> {
    const { data, error } = await supabase.from(name).select('*');
    if (error) throw error;
    return data as T[];
  }

  async getDocument<T>(collection: string, id: string): Promise<T | null> {
    // Intentamos buscar por 'id' (minúsculas) primero
    let result = await supabase.from(collection).select('*').eq('id', id).single();
    
    // Si falla, intentamos por 'ID' (mayúsculas) por paridad de esquema
    if (result.error) {
      result = await supabase.from(collection).select('*').eq('ID', id).single();
    }
    
    if (result.error) return null;
    return result.data as T;
  }

  private normalizeName(name: string): string {
    const map: Record<string, string> = {
      'products': 'products', // Aseguramos minúsculas para Supabase/Postgres
      'members': 'members',
      'transactions': 'transactions'
    };
    return map[name.toLowerCase()] || name;
  }

  async setDocument<T>(collection: string, id: string, data: T): Promise<void> {
    const table = this.normalizeName(collection);
    
    // 🛡️ BLINDAJE TOTAL DE ID: Generamos uno si viene nulo
    const finalId = id || (data as any).id || (data as any).ID || crypto.randomUUID();

    const payload = { 
      ...data, 
      id: finalId, 
      ID: finalId,
      $id: finalId 
    };
    
    const { error } = await supabase.from(table).upsert(payload);
    if (error) {
      const detailedError = `Error Supabase (${table.toUpperCase()}): ${error.message}`;
      console.error(`❌ ${detailedError}`, error);
      throw new Error(detailedError);
    }
  }

  async deleteDocument(collection: string, id: string): Promise<void> {
    const { error } = await supabase.from(collection).delete().eq('id', id);
    if (error) throw error;
  }

  subscribe<T>(name: string, callback: (data: T[]) => void): () => void {
    // 🛡️ TRIO SYNC STEP 1: Unified Broadcast (Misma frecuencia para todos)
    const channelId = `${name}-global-sync`;
    
    // Limpieza agresiva: buscamos tanto el nombre del canal como el tópico
    const allChannels = supabase.getChannels();
    const existing = allChannels.find(c => c.topic === `realtime:${channelId}` || c.topic === channelId || (c as any).name === channelId);
    
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: name }, async () => {
        try {
          const data = await this.getCollection<T>(name);
          callback(data);
        } catch (err) {
          console.error(`❌ Error en actualización realtime (${name}):`, err);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`📡 Suscrito a Realtime: ${channelId}`);
        }
      });

    return () => {
      console.log(`🔌 Desconectando Realtime: ${channelId}`);
      supabase.removeChannel(channel);
    };
  }
}
