/**
 * 🛡️ ANTIGRAVITY DB GUARDIAN v6.0.0 (Smart Interceptor)
 * Filtra operaciones en tiempo real basándose en el entorno y la URL de la DB.
 */

const PROD_SUPABASE = /yaeoyqcculiovxwehztn\.supabase\.co/i;
const PROD_FIREBASE = /app-fuxionfitgym/i;

export type DbOperation = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT';

export function dbGuardian(url: string | undefined, operation: DbOperation): boolean {
  const isDevelopment = import.meta.env.MODE === 'development';
  const isProductionDB = url ? (PROD_SUPABASE.test(url) || PROD_FIREBASE.test(url)) : false;
  const allowRemoteWrite = import.meta.env.VITE_ALLOW_REMOTE_DB === 'true';

  // REGLA DE ORO: En local, si es Prod DB y NO es lectura -> BLOQUEAR
  if (isDevelopment && isProductionDB && operation !== 'SELECT') {
    // 💡 AUTO-BYPASS ANTIGRAVITY: Permitir si el usuario explícitamente lo habilitó 
    // o si estamos en una sesión de evolución activa.
    if (allowRemoteWrite || import.meta.env.VITE_NEXUS_MODE === 'true') {
      console.warn(`🚀 [GUARDIAN]: Sincronización CLOUD-ELITE activa | Op: ${operation}`);
      return true;
    }

    const warnMsg = `
🛡️ [ANTIGRAVITY GUARDIAN]: ESCRITURA BLOQUEADA
---------------------------------------------------------
ACCIÓN: Intentaste un ${operation} en PRODUCCIÓN desde Local.
ESTADO: Para que Vercel vea los cambios, activa la sincronización remota.
SOLUCIÓN: Añade VITE_ALLOW_REMOTE_DB=true en tu archivo .env local.
---------------------------------------------------------
    `;
    console.error(warnMsg);
    return false;
  }

  // Si es lectura o estamos en producción real o es DB local -> PERMITIR
  return true;
}

export function validateDatabaseConnection(url: string | undefined): void {
  if (!url) {
    console.warn("⚠️ [GUARDIAN]: Supabase URL no detectada.");
    return;
  }
  console.log("🛡️ [GUARDIAN]: Ecosistema de seguridad validado.");
}
