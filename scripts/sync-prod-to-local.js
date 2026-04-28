/**
 * 🌉 ANTIGRAVITY SYNC BRIDGE
 * Copia datos de PRODUCCIÓN a LOCAL de forma segura.
 * Uso: node scripts/sync-prod-to-local.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' }); // Cargar producción
const PROD_URL = process.env.VITE_SUPABASE_URL;
const PROD_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necesitas la Service Role Key para leer todo

dotenv.config({ path: '.env.local', override: true }); // Cargar local
const LOCAL_URL = process.env.VITE_SUPABASE_URL;
const LOCAL_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function sync() {
  if (!PROD_KEY || !LOCAL_KEY) {
    console.error("❌ Error: Faltan las SUPABASE_SERVICE_ROLE_KEY en .env o .env.local");
    console.log("Consíguelas en Supabase -> Settings -> API -> service_role (secret)");
    return;
  }

  const prod = createClient(PROD_URL, PROD_KEY);
  const local = createClient(LOCAL_URL, LOCAL_KEY);

  const tables = ['members', 'products', 'transactions'];

  console.log("🚀 Iniciando Sincronización BRIDGE (PROD -> LOCAL)...");

  for (const table of tables) {
    console.log(`\n📦 Procesando tabla: ${table}...`);
    
    // 1. Leer de Prod
    const { data, error: readErr } = await prod.from(table).select('*');
    if (readErr) {
      console.error(`  ❌ Error leyendo ${table}:`, readErr.message);
      continue;
    }

    if (!data || data.length === 0) {
      console.log(`  ℹ️ Tabla ${table} vacía en producción.`);
      continue;
    }

    // 2. Limpiar Local (Opcional, pero recomendado para paridad total)
    // await local.from(table).delete().neq('id', 0); 

    // 3. Upsert a Local
    const { error: writeErr } = await local.from(table).upsert(data);
    if (writeErr) {
      console.error(`  ❌ Error escribiendo en ${table}:`, writeErr.message);
    } else {
      console.log(`  ✅ ${data.length} registros sincronizados en ${table}.`);
    }
  }

  console.log("\n✨ Sincronización completada con éxito.");
}

sync();
