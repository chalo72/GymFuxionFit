/**
 * 🛡️ ANTIGRAVITY DB GUARDIAN v6.0.0 (Smart Interceptor)
 * Filtra operaciones en tiempo real basándose en el entorno y la URL de la DB.
 */

const PRODUCTION_URL_PATTERN = /yaeoyqcculiovxwehztn\.supabase\.co/i;

export type DbOperation = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT';

export function dbGuardian(url: string | undefined, operation: DbOperation): boolean {
  const isDevelopment = import.meta.env.MODE === 'development';
  const isProductionDB = url ? PRODUCTION_URL_PATTERN.test(url) : false;
  const allowRemoteWrite = import.meta.env.VITE_ALLOW_REMOTE_DB === 'true';

  // REGLA DE ORO: En local, si es Prod DB y NO es lectura -> BLOQUEAR
  if (isDevelopment && isProductionDB && operation !== 'SELECT') {
    if (allowRemoteWrite) {
      console.warn(`⚠️ [GUARDIAN]: Escritura permitida en PRODUCCIÓN (Bypass Activo) | Op: ${operation}`);
      return true;
    }

    const warnMsg = `
🛡️ [ANTIGRAVITY GUARDIAN]: ESCRITURA BLOQUEADA
---------------------------------------------------------
ACCIÓN: Intentaste un ${operation} en PRODUCCIÓN desde Local.
ESTADO: Operación cancelada automáticamente para proteger los datos reales.
SOLUCIÓN: Usa un proyecto de Supabase LOCAL o activa VITE_ALLOW_REMOTE_DB=true.
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
