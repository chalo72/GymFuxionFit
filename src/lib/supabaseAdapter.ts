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
    const { data, error } = await supabase.from(collection).select('*').eq('id', id).single();
    if (error) return null;
    return data as T;
  }

  async setDocument<T>(collection: string, id: string, data: T): Promise<void> {
    // Usamos upsert para simplificar set/update
    const { error } = await supabase.from(collection).upsert({ ...data, id });
    if (error) throw error;
  }

  async deleteDocument(collection: string, id: string): Promise<void> {
    const { error } = await supabase.from(collection).delete().eq('id', id);
    if (error) throw error;
  }

  subscribe<T>(name: string, callback: (data: T[]) => void): () => void {
    const channel = supabase
      .channel(`${name}-all-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: name }, async () => {
        // En Supabase, para simplificar el adapter, volvemos a pedir la colección completa 
        // o podrías implementar lógica de parcheo incremental aquí.
        const data = await this.getCollection<T>(name);
        callback(data);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
