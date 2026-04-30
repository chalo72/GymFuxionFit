import { createClient } from '@supabase/supabase-js';
import { validateDatabaseConnection, dbGuardian } from './dbGuardian';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// 🛡️ Validar aislamiento de entorno antes de inicializar
validateDatabaseConnection(supabaseUrl);

// Bandera: true solo si ambas variables están configuradas
export const hasSupabase = !!(supabaseUrl && supabaseAnonKey);

// 🛡️ CLIENTE PROTEGIDO (PROXY INTERCEPTOR)
const rawClient = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key'
);

/**
 * Envolvemos el cliente en un Proxy para interceptar las llamadas a tablas
 * y aplicar el dbGuardian en operaciones de escritura.
 */
export const supabase = new Proxy(rawClient, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    
    if (prop === 'from') {
      return (table: string) => {
        const queryBuilder = (value as Function).call(target, table);
        
        // Interceptamos los métodos de mutación
        const wrap = (op: any, name: any) => {
          return (...args: any[]) => {
            if (!dbGuardian(supabaseUrl, name)) {
              console.error(`❌ Operación ${name} en tabla ${table} bloqueada por seguridad.`);
              return Promise.resolve({ data: null, error: { message: 'Bloqueado por Antigravity Guardian' } });
            }
            return op.apply(queryBuilder, args);
          };
        };

        queryBuilder.insert = wrap(queryBuilder.insert, 'INSERT');
        queryBuilder.update = wrap(queryBuilder.update, 'UPDATE');
        queryBuilder.delete = wrap(queryBuilder.delete, 'DELETE');
        queryBuilder.upsert = wrap(queryBuilder.upsert, 'UPSERT');

        return queryBuilder;
      };
    }
    
    return value;
  }
});
