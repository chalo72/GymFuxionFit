import { supabase } from './supabase';
import { gymDatabase } from './database';
import { dbGuardian } from './dbGuardian';

/**
 * 🏎️ TRIO SYNC ENGINE v1.0.0
 * Capa de abstracción superior para operaciones en 3 capas.
 */

export const trioSync = {
  /**
   * Crear un documento en Supabase (Primario) y Firebase (Shadow)
   */
  create: async (table: string, data: any, user?: any) => {
    // 1. Guardian: ¿Tiene permiso?
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!dbGuardian(url, 'INSERT')) {
      throw new Error('🛡️ Guardian: Inserción bloqueada en este entorno.');
    }

    // 2. Enriquecer datos
    const enriched = {
      ...data,
      created_at: new Date().toISOString(),
      sync_layer: 'trio-engine'
    };

    // 3. Ejecutar via database adapter (que ya hace el dual write)
    const id = data.id || crypto.randomUUID();
    await gymDatabase.setDocument(table, id, enriched);
    
    return { ...enriched, id };
  },

  /**
   * Actualizar documento en todas las capas
   */
  update: async (table: string, id: string, changes: any) => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!dbGuardian(url, 'UPDATE')) {
      throw new Error('🛡️ Guardian: Actualización bloqueada.');
    }

    const enriched = {
      ...changes,
      updated_at: new Date().toISOString()
    };

    await gymDatabase.setDocument(table, id, enriched);
    return enriched;
  },

  /**
   * Eliminar documento en todas las capas
   */
  delete: async (table: string, id: string) => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!dbGuardian(url, 'DELETE')) {
      throw new Error('🛡️ Guardian: Eliminación bloqueada.');
    }

    await gymDatabase.deleteDocument(table, id);
  }
};
