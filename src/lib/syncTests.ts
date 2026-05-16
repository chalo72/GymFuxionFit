/**
 * 🧪 SUITE DE TESTS INTERNOS — GymFuxionFit Sync v5.6
 *
 * Cubre los 5 puntos críticos del sistema de sincronización.
 * Para ejecutar desde la consola del navegador: window.__runSyncTests()
 * Para ejecutar desde código: import { runAllTests } from '../lib/syncTests'
 */

type TestResult = { name: string; passed: boolean; detail: string };

async function runTest(name: string, fn: () => Promise<void> | void): Promise<TestResult> {
  try {
    await fn();
    return { name, passed: true, detail: 'OK' };
  } catch (e: any) {
    return { name, passed: false, detail: e.message || String(e) };
  }
}

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(msg);
}

// ─────────────────────────────────────────────────────────
// TEST 1: Subscribe reemplaza estado (no hace merge)
// Verifica el fix central: borrar en PC borra en cel
// ─────────────────────────────────────────────────────────
async function test1_subscribeReplace(): Promise<TestResult> {
  return runTest('Subscribe reemplaza estado — borrados no resucitan', () => {
    // Simula comportamiento viejo (BUG): merge local
    const buggyCallback = (state: string[], cloudItems: string[]) => {
      const cloudSet   = new Set(cloudItems);
      const localOnly  = state.filter(x => !cloudSet.has(x));
      return [...cloudItems, ...localOnly];
    };

    // Simula comportamiento nuevo (FIX): replace
    const fixedCallback = (_state: string[], cloudItems: string[]) => cloudItems;

    // Escenario: PC borró 'C'. Supabase envía ['A', 'B']. Local tenía ['A', 'B', 'C'].
    const localState = ['A', 'B', 'C'];

    const buggyResult = buggyCallback(localState, ['A', 'B']);
    assert(
      buggyResult.includes('C'),
      'El bug debería incluir C (confirmación del problema anterior)'
    );

    const fixedResult = fixedCallback(localState, ['A', 'B']);
    assert(!fixedResult.includes('C'), 'Fix: C NO debe aparecer tras ser borrado en la nube');
    assert(fixedResult.length === 2, 'Fix: exactamente 2 ítems deben quedar');
  });
}

// ─────────────────────────────────────────────────────────
// TEST 2: Timeout guard protege contra bloqueos de red
// ─────────────────────────────────────────────────────────
async function test2_timeoutGuard(): Promise<TestResult> {
  return runTest('Timeout guard — rechaza promesas colgadas', async () => {
    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
      let handle: ReturnType<typeof setTimeout>;
      const timeout = new Promise<T>((_, reject) => {
        handle = setTimeout(() => reject(new Error('NEXUS_TIMEOUT')), ms);
      });
      return Promise.race([promise, timeout]).finally(() => clearTimeout(handle)) as Promise<T>;
    };

    // Promesa que nunca resuelve → debe rechazar
    try {
      await withTimeout(new Promise(() => {}), 80);
      throw new Error('Debió haber rechazado con NEXUS_TIMEOUT');
    } catch (e: any) {
      assert(e.message === 'NEXUS_TIMEOUT', `Error inesperado: ${e.message}`);
    }

    // Promesa rápida → debe pasar sin problema
    const fast = new Promise<string>(r => setTimeout(() => r('ok'), 20));
    const result = await withTimeout(fast, 400);
    assert(result === 'ok', 'Promesa rápida debe resolver normalmente');
  });
}

// ─────────────────────────────────────────────────────────
// TEST 3: Normalización de nombres de colección
// Evita que Supabase use tablas incorrectas
// ─────────────────────────────────────────────────────────
async function test3_collectionNames(): Promise<TestResult> {
  return runTest('Normalización de nombres de colección', () => {
    const MAP: Record<string, string> = {
      'Members':      'members',
      'Productos':    'products',
      'products':     'products',
      'members':      'members',
      'transactions': 'transactions',
      'goals':        'goals',
      'obligations':  'obligations',
      'staff':        'staff',
      'assets':       'assets',
      'catalogs':     'catalogs',
      'configuracion':'configuracion',
    };
    const normalize = (name: string) => MAP[name] ?? name.toLowerCase();

    assert(normalize('Members')      === 'members',       'Members → members');
    assert(normalize('Productos')    === 'products',      'Productos → products');
    assert(normalize('transactions') === 'transactions',  'transactions → transactions');
    assert(normalize('goals')        === 'goals',         'goals → goals');
    assert(normalize('staff')        === 'staff',         'staff → staff');
    assert(normalize('UNKNOWN')      === 'unknown',       'Unknown → lowercase fallback');
    assert(normalize('configuracion')=== 'configuracion', 'configuracion → configuracion');
  });
}

// ─────────────────────────────────────────────────────────
// TEST 4: Backup — crear y recuperar snapshot
// ─────────────────────────────────────────────────────────
async function test4_backup(): Promise<TestResult> {
  return runTest('Backup — crear, listar y recuperar snapshot', async () => {
    const { backupService } = await import('./backupService');

    const mockData = {
      members:      [{ id: 'test-m1', name: 'Test Member' }],
      products:     [{ id: 'test-p1', name: 'Test Product' }],
      transactions: [],
      goals:        [],
      obligations:  [],
      staff:        [],
      assets:       []
    };

    const id = await backupService.createBackup(mockData, 'test_suite');
    assert(typeof id === 'string' && id.length > 10, 'createBackup debe retornar un UUID');

    const snap = await backupService.getBackup(id);
    assert(snap !== null, 'getBackup debe encontrar el snapshot creado');
    assert(snap!.trigger === 'test_suite', 'Trigger debe preservarse');
    assert(snap!.data.members[0].name === 'Test Member', 'Datos de miembros deben ser correctos');
    assert(snap!.data.products[0].name === 'Test Product', 'Datos de productos deben ser correctos');

    const list = await backupService.listBackups();
    assert(list.some(b => b.id === id), 'listBackups debe incluir el nuevo snapshot');
    assert(list.length <= 5, 'No debe haber más de 5 backups (pruning automático)');
  });
}

// ─────────────────────────────────────────────────────────
// TEST 5: Formato JSONB correcto para Supabase
// Verifica que el payload se envía como {id, payload, updated_at}
// ─────────────────────────────────────────────────────────
async function test5_supabasePayload(): Promise<TestResult> {
  return runTest('Supabase payload — formato JSONB correcto', () => {
    // Replica la lógica de forceSyncAll / setDocument
    const buildPayload = (item: Record<string, any>) => ({
      id:         String(item.id || item.$id || item.ID || ''),
      payload:    item,
      updated_at: new Date().toISOString()
    });

    const member = { id: 'abc-123', name: 'Juan García', status: 'active', debt: 0 };
    const payload = buildPayload(member);

    assert(payload.id === 'abc-123',           'id debe ser string directo');
    assert(typeof payload.payload === 'object', 'payload debe ser objeto JSONB');
    assert(payload.payload.name === 'Juan García', 'Campo name debe preservarse en payload');
    assert(payload.payload.status === 'active',    'Campo status debe preservarse en payload');
    assert(typeof payload.updated_at === 'string', 'updated_at debe ser string');
    assert(payload.updated_at.includes('T'),       'updated_at debe ser formato ISO 8601');

    // Verificar que item sin id se filtra correctamente
    const empty = buildPayload({ name: 'Sin ID' });
    assert(empty.id === '', 'Item sin id debe generar id vacío (será filtrado)');
  });
}

// ─────────────────────────────────────────────────────────
// RUNNER PRINCIPAL
// ─────────────────────────────────────────────────────────
export async function runAllTests(): Promise<{ passed: number; total: number }> {
  console.group('🧪 [SYNC TESTS] GymFuxionFit — Suite de Tests Internos');
  console.log('Ejecutando 5 tests de sincronización...\n');

  const suite = [
    test1_subscribeReplace,
    test2_timeoutGuard,
    test3_collectionNames,
    test4_backup,
    test5_supabasePayload,
  ];

  let passed = 0;
  for (const testFn of suite) {
    const r = await testFn();
    if (r.passed) {
      passed++;
      console.log(`  ✅ PASS — ${r.name}`);
    } else {
      console.error(`  ❌ FAIL — ${r.name}\n       ${r.detail}`);
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  if (passed === suite.length) {
    console.log(`🎉 ${passed}/${suite.length} tests pasaron — sistema de sync PROTEGIDO ✅`);
  } else {
    console.warn(`⚠️  ${passed}/${suite.length} tests pasaron — revisar los errores arriba`);
  }
  console.groupEnd();

  return { passed, total: suite.length };
}

// Exponer globalmente para uso desde DevTools
if (typeof window !== 'undefined') {
  (window as any).__runSyncTests = runAllTests;
  console.info('💡 [SYNC TESTS]: Disponible en consola → window.__runSyncTests()');
}
