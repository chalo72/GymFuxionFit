import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Bandera: true solo si ambas variables están configuradas
export const hasSupabase = !!(supabaseUrl && supabaseAnonKey);

if (!hasSupabase) {
  console.warn(
    '⚠️ GYMFUXIONFIT: Faltan variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
    'Modo OFFLINE activado — datos solo desde localStorage.'
  );
}

// Si no hay credenciales se usa un cliente dummy que no lanza errores de red
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key'
);
