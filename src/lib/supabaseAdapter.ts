import { supabase } from './supabase';
import { DatabaseAdapter } from './dbAdapter';

/**
 * 🛡️ SUPABASE ADAPTER — Schema JSONB Universal
 * Todas las tablas usan la misma estructura:
 *   id TEXT PRIMARY KEY
 *   payload JSONB   ← aquí van todos los campos del documento
 *   updated_at TIMESTAMPTZ
 *
 * Ventaja: cualquier módulo nuevo solo necesita crear la tabla en Supabase,
 * sin cambiar código.
 */
export class SupabaseAdapter implements DatabaseAdapter {
  async init(): Promise<void> {
    console.log("🔌 Supabase Adapter Initialized (JSONB schema)");
  }

  private normalizeName(name: string): string {
    const map: Record<string, string> = {
      'Members': 'members',
      'Productos': 'products',
      'products': 'products',
      'members': 'members',
      'transactions': 'transactions',
      'goals': 'goals',
      'obligations': 'obligations',
      'staff': 'staff',
      'assets': 'assets',
      'catalogs': 'catalogs',
      'configuracion': 'configuracion',
    };
    return map[name] ?? String(name || '').toLowerCase();
  }

  async getCollection<T>(name: string): Promise<T[]> {
    const table = this.normalizeName(name);
    const { data, error } = await supabase.from(table).select('id, payload').limit(50000);
    if (error) throw error;
    return (data || []).map(row => ({ ...(row.payload || {}), id: row.id })) as T[];
  }

  async getDocument<T>(collection: string, id: string): Promise<T | null> {
    const table = this.normalizeName(collection);
    const { data, error } = await supabase
      .from(table)
      .select('id, payload')
      .eq('id', id)
      .single();
    if (error) return null;
    return { ...(data.payload || {}), id: data.id } as T;
  }

  async setDocument<T>(collection: string, id: string, data: T): Promise<void> {
    const table = this.normalizeName(collection);
    const finalId = id || (data as any).id || crypto.randomUUID();
    const { error } = await supabase.from(table).upsert({
      id: finalId,
      payload: data,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error(`❌ Supabase (${table}): ${error.message}`, error);
      throw new Error(`Error Supabase (${table}): ${error.message}`);
    }
  }

  async deleteDocument(collection: string, id: string): Promise<void> {
    const table = this.normalizeName(collection);
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  }

  subscribe<T>(name: string, callback: (data: T[]) => void): () => void {
    const tableName = this.normalizeName(name);
    const channelId = `${tableName}-realtime`;

    // Limpia canal previo si existe
    const existing = supabase.getChannels().find(
      c => c.topic === `realtime:${channelId}` || (c as any).name === channelId
    );
    if (existing) supabase.removeChannel(existing);

    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, async () => {
        try {
          const data = await this.getCollection<T>(name);
          callback(data);
        } catch (err) {
          console.error(`❌ Realtime error (${tableName}):`, err);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`📡 [Supabase Realtime]: Suscrito a '${tableName}'`);
        }
      });

    // 🛡️ GUARDIAN FALLBACK: Polling silencioso por si WebSockets/Realtime fallan
    let lastUpdate = '';
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.from(tableName).select('updated_at').order('updated_at', { ascending: false }).limit(1);
        if (data && data.length > 0) {
          const latest = data[0].updated_at;
          if (lastUpdate && latest !== lastUpdate) {
            console.log(`🔄 [Supabase Fallback]: Cambio detectado en '${tableName}'. Sincronizando...`);
            const freshData = await this.getCollection<T>(name);
            callback(freshData);
          }
          lastUpdate = latest;
        }
      } catch (e) {
        // Ignorar errores de red
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }
}
