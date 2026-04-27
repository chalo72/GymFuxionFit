import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar .env desde el root
dotenv.config({ path: resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Faltan llaves de Supabase en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('📡 Probando conexión a Supabase:', supabaseUrl);
  
  // 1. Probar lectura de productos
  const { data: products, error: pError } = await supabase.from('products').select('*').limit(1);
  if (pError) {
    console.error('❌ Error al leer productos:', pError.message);
    if (pError.message.includes('relation "public.products" does not exist')) {
      console.error('💡 TIP: La tabla "products" no existe en Supabase.');
    }
  } else {
    console.log('✅ Conectado a la tabla "products". Productos encontrados:', products?.length);
  }

  // 2. Probar lectura de miembros
  const { data: members, error: mError } = await supabase.from('members').select('*').limit(1);
  if (mError) {
    console.error('❌ Error al leer miembros:', mError.message);
  } else {
    console.log('✅ Conectado a la tabla "members". Miembros encontrados:', members?.length);
  }

  // 3. Probar lectura de transacciones
  const { data: tx, error: tError } = await supabase.from('transactions').select('*').limit(1);
  if (tError) {
    console.error('❌ Error al leer transacciones:', tError.message);
  } else {
    console.log('✅ Conectado a la tabla "transactions".');
  }
}

testConnection();
