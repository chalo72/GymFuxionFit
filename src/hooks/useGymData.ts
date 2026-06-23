import { useState, useEffect, useRef, createContext, useContext, createElement, ReactNode } from 'react';
import { gymDatabase, dbReady } from '../lib/database';
import { supabase, hasSupabase } from '../lib/supabase';
import { trioSync } from '../lib/trioSync';
import { syncManager } from '../services/syncManager';
import { backupService } from '../lib/backupService';

/* ══════════════════════════════════════════
   GLOBAL_SYNC_SERVICE V.1.1
   Persistence & Synchronization Layer
   Rounding Protocol: COP Standard (100s)
══════════════════════════════════════════ */

/**
 * Redondea un valor al múltiplo de 100 más cercano.
 * Estándar para transacciones en pesos colombianos (COP).
 */
export const roundPrice = (val: number): number => {
  if (!val || isNaN(val)) return 0;
  return Math.round(val / 100) * 100;
};

export interface Transaction {
  id: string | number; date: string; time: string; description: string;
  category: string; type: 'income' | 'expense'; amount: number; method: string; client?: string;
  evidenceUrl?: string;
  goalId?: string;
  hash?: string;
}

export interface GymAsset {
  id: string;
  name: string;
  category: 'machine' | 'free_weight' | 'accessory' | 'tool';
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'DEFECTIVE' | 'ORDERED';
  lastMaintenance: string;
  nextMaintenance: string;
  health: number;
  specs: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'supplements' | 'drinks' | 'snacks' | 'apparel' | 'other';
  stock: number;
  minStock: number;
  buyPrice: number;
  sellPrice: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  category: 'expansion' | 'maintenance' | 'savings' | 'marketing' | 'payroll';
}

export interface Obligation {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid';
  category: 'rent' | 'utilities' | 'payroll' | 'services' | 'other';
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  salary: number;
  phone: string;
  email: string;
  tempPassword?: string;
  lastPayment?: string;
  status: 'active' | 'inactive';
  payPeriod?: 'complete' | 'q1' | 'q2';
  advances?: number; // Anticipos pendientes a descontar en próximo pago
}

export interface StaffLoan {
  id: string;
  staffId: string;
  staffName: string;
  total: number;       // Monto total del préstamo
  remaining: number;   // Saldo pendiente
  installment: number; // Cuota por período
  date: string;
  description: string;
}

export interface Member {
  id: string;
  name: string;
  status: 'active' | 'expiring' | 'expired' | 'suspended';
  expiryDate: string;
  debt: number;
  lastVisit: string;
  plan: string;
  phone?: string;
  email?: string;
  color?: string;
  height?: number;
  weight?: number;
  payMethod?: string;
  trainer?: string;
  visits?: number;
  joined?: string;
  nextPayment?: string;
  expiry?: string;
  emergency?: string;
  emergencyPhone?: string;
  address?: string;
  notes?: string;
  objective?: string;
  injuries?: string | string[];
  nutrition?: string;
  emergencyContact?: string;
  bodyFat?: number;
  streak?: number;
  alerts?: string[];
  goal?: string;
  suspendedReason?: string;
  suspendedDate?: string;
  progress?: number;
  biometricStatus?: 'pending' | 'completed';
  lastScan?: string;
  mobilityAnkle?: string;
  mobilityHip?: string;
  mobilityThoracic?: string;
  mobilityShoulders?: string;
  coreStability?: string;
  bracingAbility?: string;
  posturalCompensations?: string;
  clinicalHistory?: string;
  femurLength?: string;
  armLength?: string;
  techniqueNotes?: string;
  trainingLogs?: { date: string; session: string; intensity: number; notes: string }[];
  workoutHistory?: any[];
  nutritionHistory?: any[];
  plans?: any[];
  todaysMeals?: any[];
  activeProgram?: any;
  sessionHistory?: any[];
  weeklyMetrics?: any[];
  trainingMetrics?: any;
}

function useGymDataInternal() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<GymAsset[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [staffLoans, setStaffLoans] = useState<StaffLoan[]>(() => {
    const saved = localStorage.getItem('fuxion_staff_loans');
    return saved ? JSON.parse(saved) : [];
  });
  const [syncStatus, setSyncStatus] = useState<'live' | 'local' | 'syncing'>('local');

  // ── BACKUP: ref siempre actualizado con el estado más reciente ──
  const latestDataRef = useRef({
    members: [] as any[], products: [] as any[], transactions: [] as any[],
    goals: [] as any[], obligations: [] as any[], staff: [] as any[], assets: [] as any[]
  });

  // ── BACKUP: trigger para debounce (500ms tras la última operación) ──
  const [backupPending, setBackupPending] = useState<{ ts: number; trigger: string } | null>(null);
  const [pendingTasks, setPendingTasks] = useState(0);

  // 🔄 Suscripción a la cola de sincronización
  useEffect(() => {
    return syncManager.subscribeQueue(count => setPendingTasks(count));
  }, []);

  // Mantiene el ref actualizado con el estado más reciente
  useEffect(() => {
    latestDataRef.current = { members, products, transactions, goals, obligations, staff, assets };
  }, [members, products, transactions, goals, obligations, staff, assets]);

  // Ejecuta el backup con debounce de 600ms tras la última operación de escritura
  useEffect(() => {
    if (!backupPending) return;
    const timer = setTimeout(() => {
      backupService.createBackup(latestDataRef.current, backupPending.trigger).catch(console.error);
    }, 600);
    return () => clearTimeout(timer);
  }, [backupPending]);

  const triggerBackup = (trigger: string) =>
    setBackupPending({ ts: Date.now(), trigger });

  const [isLoaded, setIsLoaded] = useState(false);
  const [waterConfig, setWaterConfig] = useState({
    bagPrice: 200,
    bagsPerPaca: 50,
    pacaCost: 6000
  });
  const [plans, setPlans] = useState<any[]>(() => {
    const saved = localStorage.getItem('fuxion_custom_plans');
    return saved ? JSON.parse(saved) : [
      { id: 'dia',        label: 'Día',       price: 5000,   desc: 'Acceso por un día',                  color: '#FFD600', duration: 'dia'    },
      { id: 'semana',     label: 'Semanal',   price: 25000,  desc: 'Acceso por 7 días',                  color: '#00E5FF', duration: 'semana' },
      { id: 'mes_basico', label: 'Básico',    price: 45000,  desc: 'Acceso gimnasio · L-V · Sin clases', color: '#8A948A', duration: 'mes'    },
      { id: 'mes_pro',    label: 'Pro',       price: 75000,  desc: 'Acceso completo · Clases incluidas', color: '#00FF88', duration: 'mes'    },
      { id: 'mes_hyrox',  label: 'HYROX Pro', price: 120000, desc: 'Elite · HYROX · Trainer asignado',   color: '#FF6B35', duration: 'mes'    },
    ];
  });
  const [plansConfig, setPlansConfig] = useState(() => {
    const saved = localStorage.getItem('fuxion_plans_config');
    if (saved) return JSON.parse(saved);
    const cfg: any = {};
    plans.forEach(p => { cfg[p.id] = p.price; });
    return cfg;
  });

  // ─── CARGA INICIAL Y PERSISTENCIA (HYBRID SYNC) ───
  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Cargar lo que haya en Local (para velocidad instantánea)
        const savedTx = localStorage.getItem('fuxion_tx');
        const savedMembers = localStorage.getItem('fuxion_members');
        const savedProducts = localStorage.getItem('fuxion_products');
        const savedObligations = localStorage.getItem('fuxion_obligations');
        const savedStaff = localStorage.getItem('fuxion_staff');
        const savedGoals = localStorage.getItem('fuxion_goals');

        let currentMembers: Member[] = savedMembers ? JSON.parse(savedMembers) : [];
        let currentTx: Transaction[] = savedTx ? JSON.parse(savedTx) : [];
        let currentProducts: Product[] = savedProducts ? JSON.parse(savedProducts) : [];
        let currentObligations: Obligation[] = savedObligations ? JSON.parse(savedObligations) : [];
        let currentStaff: Staff[] = savedStaff ? JSON.parse(savedStaff) : [];
        let currentGoals: FinancialGoal[] = savedGoals ? JSON.parse(savedGoals) : [];

        // Establecer estado inicial rápido (Offline First)
        if (currentTx.length > 0) setTransactions(currentTx);
        if (currentMembers.length > 0) setMembers(currentMembers);
        if (currentProducts.length > 0) setProducts(currentProducts);
        if (currentObligations.length > 0) setObligations(currentObligations);
        if (currentStaff.length > 0) setStaff(currentStaff);
        if (currentGoals.length > 0) setGoals(currentGoals);

        console.log(`🛠️ [BOOT]: Memoria local cargada (${currentMembers.length} miembros). Esperando DB...`);

        // Esperar a que IndexedDB esté lista Y Supabase haya hidratado
        await dbReady;

        console.log(`☁️ [BOOT]: DB lista. Leyendo datos de la nube...`);

        // 2. Sincronización de Miembros (Supabase es fuente de verdad — no merge)
        try {
          const cloudMembers = await gymDatabase.getCollection<any>('members');
          if (cloudMembers && cloudMembers.length > 0) {
            currentMembers = cloudMembers.map(m => ({
              ...m,
              expiryDate: m.expiry_date || m.expiry || m.expiryDate,
              biometricStatus: m.biometric_status || m.biometricStatus
            }));
            setMembers(currentMembers);
            localStorage.setItem('fuxion_members', JSON.stringify(currentMembers));
          }
        } catch (e) {
          console.warn("⚠️ Fallo sync cloud miembros:", e);
        }

        // 3. Sincronización de Transacciones
        try {
          const cloudTx = await gymDatabase.getCollection<any>('transactions');
          if (cloudTx && cloudTx.length > 0) {
            currentTx = cloudTx;
            setTransactions(currentTx);
            localStorage.setItem('fuxion_tx', JSON.stringify(currentTx));
          }
        } catch (e) {
          console.warn("⚠️ Fallo sync cloud transacciones:", e);
        }

        // 4. Sincronización de Productos
        try {
          const cloudProducts = await gymDatabase.getCollection<any>('products');
          if (cloudProducts && cloudProducts.length > 0) {
            currentProducts = cloudProducts.map((p: any) => ({
              ...p,
              id: String(p.id || p.$id || p.ID),
              buyPrice: p.buy_price || p.buyPrice || 0,
              sellPrice: p.sell_price || p.sellPrice || 0,
              minStock: p.min_stock || p.minStock || 0
            }));
            setProducts(currentProducts);
            localStorage.setItem('fuxion_products', JSON.stringify(currentProducts));
          }
        } catch (e) {
          console.warn("⚠️ Fallo sync cloud productos:", e);
        }

        // Finalizar carga
        setIsLoaded(true);
      } catch (err: any) {
        console.error("❌ ERROR CRÍTICO DE SINCRONIZACIÓN:", err);
        setSyncError(`Error Inicialización: ${err.message || 'Error desconocido'}`);
        setIsLoaded(true);
      }
    };

    initData();

    // 🔗 BROADCAST CHANNEL: Sincronización inter-pestañas
    syncManager.onBroadcast((type, data) => {
      // 🧠 Recibimos mensajes de otras pestañas para actualizar la UI local sin peticiones extra.
      if (type === 'MEMBERS_UPDATE') setMembers(data);
      if (type === 'PRODUCTS_UPDATE') setProducts(data);
      if (type === 'TX_UPDATE') setTransactions(data);
      if (type === 'GOALS_UPDATE') setGoals(data);
      if (type === 'OBLIGATIONS_UPDATE') setObligations(data);
      if (type === 'STAFF_UPDATE') setStaff(data);
      if (type === 'ASSETS_UPDATE') setAssets(data);
      if (type === 'PLANS_UPDATE') {
        setPlans(data);
        const cfg: any = {};
        data.forEach((p: any) => { cfg[p.id] = p.price; });
        setPlansConfig(cfg);
      }
    });

    // 📡 SINCRONIZACIÓN DE DISCO DURO ENTRE PESTAÑAS (Evita Amnesia de Datos)
    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === 'fuxion_members' && e.newValue) setMembers(JSON.parse(e.newValue));
        if (e.key === 'fuxion_tx' && e.newValue) setTransactions(JSON.parse(e.newValue));
        if (e.key === 'fuxion_products' && e.newValue) setProducts(JSON.parse(e.newValue));
        if (e.key === 'fuxion_custom_plans' && e.newValue) {
          const nextPlans = JSON.parse(e.newValue);
          setPlans(nextPlans);
          const cfg: any = {};
          nextPlans.forEach((p: any) => { cfg[p.id] = p.price; });
          setPlansConfig(cfg);
        }
      } catch (err) {
        console.error("Error al sincronizar desde localStorage:", err);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Suscripción Realtime Universal
    // ⚠️ IMPORTANTE: callbacks reemplazan estado directamente (sin merge local).
    // Supabase es la fuente de verdad — si un ítem se borró en la nube, no reaparece.
    const unsubMembers = syncManager.subscribeToCollection<any>('members', (items) => {
      setSyncStatus('live');
      const mapped = items.map(m => ({
        ...m,
        expiryDate: m.expiry_date || m.expiry || m.expiryDate,
        biometricStatus: m.biometric_status || m.biometricStatus
      }));
      setMembers(mapped);
      syncManager.broadcast('MEMBERS_UPDATE', mapped);
    });

    const unsubProducts = syncManager.subscribeToCollection<any>('products', (items) => {
      setSyncStatus('live');
      const mapped = items.map(p => ({
        ...p,
        id: String(p.id || p.$id || p.ID),
        buyPrice: p.buy_price || p.buyPrice || 0,
        sellPrice: p.sell_price || p.sellPrice || 0,
        minStock: p.min_stock || p.minStock || 0
      }));
      setProducts(mapped);
      syncManager.broadcast('PRODUCTS_UPDATE', mapped);
    });

    const unsubTx = syncManager.subscribeToCollection<Transaction>('transactions', (items) => {
      setSyncStatus('live');
      setTransactions(items);
      syncManager.broadcast('TX_UPDATE', items);
    });

    // 🎯 SUBS: Metas Financieras (Realtime)
    const unsubGoals = syncManager.subscribeToCollection<FinancialGoal>('goals', (items) => {
      setSyncStatus('live');
      setGoals(items);
      syncManager.broadcast('GOALS_UPDATE', items);
    });

    // 💸 SUBS: Obligaciones (Realtime)
    const unsubObligations = syncManager.subscribeToCollection<Obligation>('obligations', (items) => {
      setSyncStatus('live');
      setObligations(items);
      syncManager.broadcast('OBLIGATIONS_UPDATE', items);
    });

    // 👥 SUBS: Personal/Staff (Realtime)
    const unsubStaff = syncManager.subscribeToCollection<Staff>('staff', (items) => {
      setSyncStatus('live');
      setStaff(items);
      syncManager.broadcast('STAFF_UPDATE', items);
    });

    // 🔧 SUBS: Activos/Gimnasio (Realtime)
    // 🧠 Mantiene el estado de las máquinas y mantenimiento al día.
    const unsubAssets = syncManager.subscribeToCollection<GymAsset>('assets', (items) => {
      setSyncStatus('live');
      setAssets(items);
      syncManager.broadcast('ASSETS_UPDATE', items);
    });

    return () => {
      unsubMembers();
      unsubProducts();
      unsubTx();
      unsubGoals();
      unsubObligations();
      unsubStaff();
      unsubAssets();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 💾 PERSISTENCIA INDIVIDUAL: Evita que el cambio en un módulo sobreescriba todo el disco
  useEffect(() => { if (isLoaded) localStorage.setItem('fuxion_tx', JSON.stringify(transactions)); }, [isLoaded, transactions]);
  useEffect(() => { if (isLoaded) localStorage.setItem('fuxion_members', JSON.stringify(members)); }, [isLoaded, members]);
  useEffect(() => { if (isLoaded) localStorage.setItem('fuxion_products', JSON.stringify(products)); }, [isLoaded, products]);
  useEffect(() => { if (isLoaded) localStorage.setItem('fuxion_goals', JSON.stringify(goals)); }, [isLoaded, goals]);
  useEffect(() => { if (isLoaded) localStorage.setItem('fuxion_obligations', JSON.stringify(obligations)); }, [isLoaded, obligations]);
  useEffect(() => { if (isLoaded) localStorage.setItem('fuxion_staff', JSON.stringify(staff)); }, [isLoaded, staff]);
  useEffect(() => { localStorage.setItem('fuxion_staff_loans', JSON.stringify(staffLoans)); }, [staffLoans]);

  const injectTransaction = async (tx: Omit<Transaction, 'id' | 'hash'>) => {
    const newTx: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
      hash: 'TX_' + Math.random().toString(16).slice(2, 6).toUpperCase()
    };
    setTransactions(prev => [newTx, ...prev]);
    try {
      await syncManager.create('transactions', newTx);
    } catch (e) {
      console.warn("⚠️ Transacción guardada localmente. Sync pendiente:", e);
    }
    return newTx;
  };

  const updateMemberStatus = async (id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    
    const dbUpdates: any = { ...updates };
    if (updates.expiryDate) dbUpdates.expiry_date = updates.expiryDate;
    if (updates.biometricStatus) dbUpdates.biometric_status = updates.biometricStatus;

    try {
      await syncManager.update('members', id, dbUpdates);
      setSyncError(null);
    } catch (error: any) {
      setSyncError(`Error Miembros: ${error.message}`);
    }
  };

  const clearMemberDebt = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member || member.debt <= 0) return;
    const debt = member.debt;
    await updateMemberStatus(memberId, { debt: 0 });
    await injectTransaction({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString().slice(0, 5),
      description: `PAGO_DEUDA: ${member.name}`,
      category: 'membership',
      type: 'income',
      amount: debt,
      method: 'Efectivo'
    });
  };

  const registerProductSale = async (productId: string, qty: number, clientName: string, method: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock < qty) return false;

    const newStock = product.stock - qty;
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    
    try {
      await syncManager.update('products', productId, { stock: newStock });
      setSyncError(null);
    } catch (error: any) {
      setSyncError(`Error Venta: ${error.message}`);
    }
    return true;
  };

  const withdrawFromGoal = (goalId: string, amount: number, reason: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || goal.current < amount) return null;
    const newCurrent = goal.current - amount;
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current: newCurrent } : g));
    return injectTransaction({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString().slice(0, 5),
      description: `RETIRO: ${reason}`,
      category: 'other',
      type: 'expense',
      amount,
      method: 'Efectivo',
      goalId
    });
  };

  const updatePlans = (nextPlans: any[]) => {
    setPlans(nextPlans);
    localStorage.setItem('fuxion_custom_plans', JSON.stringify(nextPlans));
    
    const cfg: any = {};
    nextPlans.forEach(p => { cfg[p.id] = p.price; });
    setPlansConfig(cfg);
    localStorage.setItem('fuxion_plans_config', JSON.stringify(cfg));

    
    syncManager.broadcast('PLANS_UPDATE', nextPlans);
  };

  // 🆘 SHADOW RECOVERY: Intenta recuperar datos desde el Suplente (Firebase)
  const forceSyncFromShadow = async () => {
    try {
      setSyncStatus('syncing');
      console.log("🆘 [RECOVERY]: Iniciando Búsqueda Profunda en el Suplente...");
      
      const cloudMembers = await gymDatabase.getCollection<any>('members');
      const cloudTx = await gymDatabase.getCollection<any>('transactions');
      
      if (cloudMembers.length > 0) {
        setMembers(cloudMembers);
        localStorage.setItem('fuxion_members', JSON.stringify(cloudMembers));
      }
      
      if (cloudTx.length > 0) {
        setTransactions(cloudTx);
        localStorage.setItem('fuxion_tx', JSON.stringify(cloudTx));
      }
      
      setSyncStatus('live');
      alert(`✅ RECUPERACIÓN EXITOSA: Se han restaurado ${cloudMembers.length} miembros y ${cloudTx.length} transacciones.`);
    } catch (e: any) {
      console.error("❌ Fallo en recuperación:", e);
      alert("❌ Error en recuperación profunda: " + e.message);
    }
  };

  // 🚀 NEXUS PUSH: Escribe directo a Supabase (sin cola, sin intermediarios)
  const forceSyncAll = async () => {
    setSyncStatus('syncing');
    try {
      if (!hasSupabase) { console.warn('Sin Supabase configurado'); return false; }

      // Limpiar cola de sync para evitar ítems fallidos bloqueando
      syncManager.clearQueue();

      const push = async (table: string, items: any[]) => {
        let ok = 0, fail = 0;
        for (const item of items) {
          const id = String(item.id || item.$id || item.ID || '');
          if (!id) continue;
          const { error } = await supabase.from(table).upsert({ id, payload: item, updated_at: new Date().toISOString() });
          if (error) { console.warn(`⚠️ [SYNC] ${table}/${id}:`, error.message); fail++; }
          else ok++;
        }
        console.log(`✅ [SYNC] ${table}: ${ok} ok, ${fail} fallidos`);
      };

      await push('members',      members);
      await push('products',     products);
      await push('transactions', transactions);
      await push('goals',        goals);
      await push('obligations',  obligations);
      await push('staff',        staff);
      await push('assets',       assets);

      setSyncStatus('live');
      return true;
    } catch (error) {
      console.error("❌ [NEXUS]: Error en empuje masivo:", error);
      setSyncStatus('local');
      return false;
    }
  };

  // 🚀 ESCUCHADOR GLOBAL DE SINCRONIZACIÓN
  useEffect(() => {
    const handleForceSync = async () => {
      console.log("⚡ [NEXUS]: Señal de Sincronización Forzada recibida.");
      const success = await forceSyncAll();
      if (success) {
        alert("✅ Sincronización completada. Los datos locales fueron empujados a la nube.");
      } else {
        alert("❌ Error en sincronización. Revisa la consola o asegúrate de tener conexión.");
      }
    };
    window.addEventListener('FORCE_NEXUS_SYNC', handleForceSync);
    return () => window.removeEventListener('FORCE_NEXUS_SYNC', handleForceSync);
  }, [members, products, transactions]);

  return { 
    transactions, assets, members, products, plans, plansConfig, waterConfig,
    syncError, syncStatus, pendingTasks,
    setAssets, setMembers, setProducts, updatePlans,
    updatePlansConfig: (cfg: Record<string, number>) => {
      setPlansConfig(cfg);
      localStorage.setItem('fuxion_plans_config', JSON.stringify(cfg));
      setPlans(prev => {
        const updated = prev.map(p => cfg[p.id] !== undefined ? { ...p, price: cfg[p.id] } : p);
        localStorage.setItem('fuxion_custom_plans', JSON.stringify(updated));
        return updated;
      });
    },
    injectTransaction, updateMemberStatus, clearMemberDebt,
    registerProductSale,
    withdrawFromGoal,
    forceSyncAll,
    forceSyncFromShadow,
    updateTransaction: async (id: string | number, t: Partial<Transaction>) => {
      setTransactions(prev => prev.map(item => item.id === id ? { ...item, ...t } : item));
      try {
        await syncManager.update('transactions', String(id), t);
      } catch (e) {
        console.warn("⚠️ Actualización de transacción local. Sync pendiente.");
      }
    },
    deleteTransaction: async (id: string | number) => {
      setTransactions(prev => prev.filter(tx => tx.id !== id));
      try {
        await syncManager.delete('transactions', String(id));
      } catch (e) {
        console.warn("⚠️ Eliminación de transacción local. Sync pendiente.");
      }
    },
    updateWaterConfig: (cfg: Partial<typeof waterConfig>) => {
       const newCfg = { ...waterConfig, ...cfg };
       setWaterConfig(newCfg);
       localStorage.setItem('gym_water_config', JSON.stringify(newCfg));
    },
    
    addProduct: async (p: Omit<Product, 'id'>) => {
      const tempId = crypto.randomUUID();
      const buyPrice = roundPrice(p.buyPrice);
      const sellPrice = roundPrice(p.sellPrice);
      const newProduct = { ...p, id: tempId, buyPrice, sellPrice };

      setProducts(prev => [newProduct, ...prev]);
      triggerBackup('add_product');

      try {
        const cloudData = {
          ...p, id: tempId,
          buy_price: buyPrice,
          sell_price: sellPrice,
          min_stock: p.minStock
        };
        await syncManager.create('products', cloudData);
        setSyncError(null);
      } catch (error: any) {
        console.warn("⚠️ Producto creado localmente. Sync BD pendiente:", error.message);
      }
    },
    updateProduct: async (id: string, p: Partial<Product>) => {
      const buyPrice = p.buyPrice !== undefined ? roundPrice(p.buyPrice) : undefined;
      const sellPrice = p.sellPrice !== undefined ? roundPrice(p.sellPrice) : undefined;
      
      const updates = { ...p };
      if (buyPrice !== undefined) updates.buyPrice = buyPrice;
      if (sellPrice !== undefined) updates.sellPrice = sellPrice;

      setProducts(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      try {
        const cloudData: any = { ...updates };
        if (buyPrice !== undefined) cloudData.buy_price = buyPrice;
        if (sellPrice !== undefined) cloudData.sell_price = sellPrice;
        if (p.minStock !== undefined) cloudData.min_stock = p.minStock;
        await syncManager.update('products', id, cloudData);
      } catch (error: any) {
        console.warn("⚠️ Producto actualizado localmente. Sync BD pendiente:", error.message);
      }
    },
    deleteProduct: async (id: string) => {
      setProducts(prev => prev.filter(p => p.id !== id));
      triggerBackup('delete_product');
      try {
        await syncManager.delete('products', id);
      } catch (error: any) {
        console.warn("⚠️ Producto eliminado localmente. Sync BD pendiente:", error.message);
      }
    },

    goals,
    addGoal: async (g: Omit<FinancialGoal, 'id'>) => {
      const id = crypto.randomUUID();
      const newGoal = { ...g, id };
      setGoals(prev => [newGoal, ...prev]);
      triggerBackup('add_goal');
      try {
        await syncManager.create('goals', newGoal);
      } catch (e) {
        console.warn("⚠️ Meta guardada localmente. Sync pendiente.");
      }
    },
    updateGoal: async (id: string, g: Partial<FinancialGoal>) => {
      setGoals(prev => prev.map(item => item.id === id ? { ...item, ...g } : item));
      try {
        await syncManager.update('goals', id, g);
      } catch (e) {
        console.warn("⚠️ Actualización de meta local. Sync pendiente.");
      }
    },
    deleteGoal: async (id: string) => {
      setGoals(prev => prev.filter(g => g.id !== id));
      triggerBackup('delete_goal');
      try {
        await syncManager.delete('goals', id);
      } catch (e) {
        console.warn("⚠️ Eliminación de meta local. Sync pendiente.");
      }
    },

    obligations,
    addObligation: async (o: Omit<Obligation, 'id'>) => {
      const id = crypto.randomUUID();
      const newOb = { ...o, id };
      setObligations(prev => [newOb, ...prev]);
      triggerBackup('add_obligation');
      try {
        await syncManager.create('obligations', newOb);
      } catch (e) {
        console.warn("⚠️ Obligación guardada localmente.");
      }
    },
    updateObligation: async (id: string, o: Partial<Obligation>) => {
      setObligations(prev => prev.map(item => item.id === id ? { ...item, ...o } : item));
      try {
        await syncManager.update('obligations', id, o);
      } catch (e) {
        console.warn("⚠️ Actualización de obligación local.");
      }
    },
    deleteObligation: async (id: string) => {
      setObligations(prev => prev.filter(o => o.id !== id));
      triggerBackup('delete_obligation');
      try {
        await syncManager.delete('obligations', id);
      } catch (e) {
        console.warn("⚠️ Eliminación de obligación local.");
      }
    },
    payObligation: async (id: string) => {
      const ob = obligations.find(o => o.id === id);
      if (!ob || ob.status === 'paid') return;
      setObligations(prev => prev.map(o => o.id === id ? { ...o, status: 'paid' } : o));
      injectTransaction({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString().slice(0, 5),
        description: `PAGO_OBLIGACION: ${ob.name}`,
        category: 'other',
        type: 'expense',
        amount: ob.amount,
        method: 'Efectivo'
      });
    },

    staff,
    addStaff: async (s: Omit<Staff, 'id'>) => {
      const id = crypto.randomUUID();
      const newStaff = { ...s, id };
      setStaff(prev => [newStaff, ...prev]);
      triggerBackup('add_staff');
      try {
        await syncManager.create('staff', newStaff);
      } catch (e) {
        console.warn("⚠️ Personal guardado localmente.");
      }
    },
    updateStaff: async (id: string, s: Partial<Staff>) => {
      setStaff(prev => prev.map(item => item.id === id ? { ...item, ...s } : item));
      try {
        await syncManager.update('staff', id, s);
      } catch (e) {
        console.warn("⚠️ Actualización de personal local.");
      }
    },
    deleteStaff: async (id: string) => {
      setStaff(prev => prev.filter(s => s.id !== id));
      triggerBackup('delete_staff');
      try {
        await syncManager.delete('staff', id);
      } catch (e) {
        console.warn("⚠️ Eliminación de personal local.");
      }
    },
    generateMonthlyPayroll: async (overridePeriod?: 'complete' | 'q1' | 'q2') => {
      const today = new Date();
      const day = today.getDate();
      // Auto-detectar quincena por fecha si no se pasa override
      const autoPeriod: 'complete' | 'q1' | 'q2' = day <= 15 ? 'q1' : 'q2';
      const currentMonth = today.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
      const todayStr = today.toISOString().split('T')[0];

      const newObligations: Obligation[] = [];
      const staffAdvanceResets: string[] = [];   // IDs de staff a los que se les resetea el anticipo
      const loanDeductions: { id: string; newRemaining: number }[] = [];

      for (const s of staff) {
        if (s.status !== 'active') continue;

        // Período: override > propio del empleado > auto por fecha
        const period = overridePeriod || s.payPeriod || autoPeriod;

        let periodLabel = '';
        let baseSalary = s.salary;
        if (period === 'q1') {
          periodLabel = `1ra Q ${currentMonth}`;
          baseSalary = s.salary / 2;
        } else if (period === 'q2') {
          periodLabel = `2da Q ${currentMonth}`;
          baseSalary = s.salary / 2;
        } else {
          periodLabel = currentMonth;
        }

        const obKey = `NÓMINA: ${s.name} (${periodLabel})`;
        if (obligations.some(o => o.name.startsWith(obKey))) continue;

        // ── Calcular deducciones ──
        const advance = s.advances || 0;
        const activeLoans = staffLoans.filter(l => l.staffId === s.id && l.remaining > 0);
        const loanDeduction = activeLoans.reduce((sum, l) => sum + Math.min(l.installment, l.remaining), 0);
        const netPay = Math.max(0, baseSalary - advance - loanDeduction);

        // ── Construir descripción con desglose ──
        let name = obKey;
        const parts: string[] = [`Base: $${baseSalary.toLocaleString()}`];
        if (advance > 0) parts.push(`Anticipo: -$${advance.toLocaleString()}`);
        if (loanDeduction > 0) parts.push(`Préstamo: -$${loanDeduction.toLocaleString()}`);
        if (advance > 0 || loanDeduction > 0) parts.push(`NETO: $${netPay.toLocaleString()}`);
        name = `${obKey} [${parts.join(' | ')}]`;

        const newOb: Obligation = {
          id: crypto.randomUUID(),
          name,
          amount: netPay,
          dueDate: todayStr,
          status: 'pending',
          category: 'payroll'
        };
        newObligations.push(newOb);

        // Marcar anticipos a resetear
        if (advance > 0) staffAdvanceResets.push(s.id);

        // Marcar cuotas de préstamos a descontar
        activeLoans.forEach(l => {
          loanDeductions.push({ id: l.id, newRemaining: Math.max(0, l.remaining - l.installment) });
        });

        try { await syncManager.create('obligations', newOb); }
        catch (e) { console.warn(`⚠️ Sync nómina ${s.name}:`, e); }
      }

      if (newObligations.length === 0) {
        alert('ℹ️ No se generaron nóminas (ya existen o no hay staff activo).');
        return;
      }

      setObligations(prev => [...newObligations, ...prev]);

      // Resetear anticipos usados
      if (staffAdvanceResets.length > 0) {
        setStaff(prev => prev.map(s =>
          staffAdvanceResets.includes(s.id) ? { ...s, advances: 0 } : s
        ));
      }

      // Descontar cuotas de préstamos
      if (loanDeductions.length > 0) {
        setStaffLoans(prev => prev.map(l => {
          const upd = loanDeductions.find(d => d.id === l.id);
          return upd ? { ...l, remaining: upd.newRemaining } : l;
        }));
      }

      
      syncManager.broadcast('OBLIGATIONS_UPDATE', [...newObligations]);
      alert(`✅ ${newObligations.length} nómina(s) generada(s). Anticipos y préstamos descontados automáticamente.`);
    },

    // ── ANTICIPOS Y PRÉSTAMOS ──
    staffLoans,
    addStaffAdvance: (staffId: string, amount: number) => {
      setStaff(prev => prev.map(s =>
        s.id === staffId ? { ...s, advances: (s.advances || 0) + amount } : s
      ));
    },
    addStaffLoan: (loan: Omit<StaffLoan, 'id'>) => {
      const newLoan: StaffLoan = { ...loan, id: crypto.randomUUID() };
      setStaffLoans(prev => [newLoan, ...prev]);
    },
    deleteStaffLoan: (loanId: string) => {
      setStaffLoans(prev => prev.filter(l => l.id !== loanId));
    },

    addMember: async (m: Omit<Member, 'id'>) => {
      const tempId = crypto.randomUUID();
      const newMember = {
        ...m,
        id: tempId,
        biometricStatus: m.biometricStatus || 'pending',
        joined: m.joined || new Date().toISOString().split('T')[0],
        visits: 0,
        debt: m.debt || 0,
        streak: 0
      };

      setMembers(prev => [newMember as Member, ...prev]);
      triggerBackup('add_member');

      try {
        const cloudData = {
          ...newMember,
          expiry_date: newMember.expiryDate,
          biometric_status: newMember.biometricStatus
        };
        await syncManager.create('members', cloudData);
      } catch (error) {
        console.error("Error sync members:", error);
      }
      return newMember;
    },
    deleteMember: async (id: string) => {
      setMembers(prev => prev.filter(m => m.id !== id));
      triggerBackup('delete_member');
      await syncManager.delete('members', id);
    },

    // ── BACKUP ──
    downloadBackup: (id?: string) => backupService.downloadBackup(id),
    listBackups:    ()             => backupService.listBackups(),
    createManualBackup: () => {
      const data = latestDataRef.current;
      return backupService.createBackup(data, 'manual');
    }
  };
}

const GymDataContext = createContext<ReturnType<typeof useGymDataInternal> | null>(null);

export function GymDataProvider({ children }: { children: ReactNode }) {
  const data = useGymDataInternal();
  return createElement(GymDataContext.Provider, { value: data }, children);
}

export function useGymData() {
  const ctx = useContext(GymDataContext);
  if (!ctx) throw new Error('useGymData debe usarse dentro de GymDataProvider');
  return ctx;
}
