import { useState, useEffect } from 'react';
import { gymDatabase } from '../lib/database';
import { supabase, hasSupabase } from '../lib/supabase';
import { trioSync } from '../lib/trioSync';

/* ══════════════════════════════════════════
   GLOBAL_SYNC_SERVICE V.1.0
   Persistence & Synchronization Layer
══════════════════════════════════════════ */

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

export function useGymData() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [assets, setAssets] = useState<GymAsset[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'live' | 'local' | 'syncing'>('syncing');
  const [waterConfig, setWaterConfig] = useState({
    bagPrice: 200,
    bagsPerPaca: 50,
    pacaCost: 6000
  });
  const [plansConfig, setPlansConfig] = useState(() => {
    const saved = localStorage.getItem('fuxion_plans_config');
    return saved ? JSON.parse(saved) : {
      dia: 5000,
      semana: 25000,
      mes_basico: 45000,
      mes_pro: 75000,
      mes_hyrox: 120000
    };
  });

  // ─── CARGA INICIAL Y PERSISTENCIA (HYBRID SYNC) ───
  useEffect(() => {
    const initData = async () => {
      try {
        // 1. Cargar lo que haya en Local (para velocidad instantánea)
        const savedTx = localStorage.getItem('fuxion_tx');
        const savedMembers = localStorage.getItem('fuxion_members');
        const savedProducts = localStorage.getItem('fuxion_products');

        if (savedTx) setTransactions(JSON.parse(savedTx));
        if (savedMembers) setMembers(JSON.parse(savedMembers));
        if (savedProducts) setProducts(JSON.parse(savedProducts));

        console.log("🛠️ Memoria local cargada. Iniciando sincronización cloud...");

        // 2. Cargar desde el Adaptador Activo (Firebase/Supabase/Appwrite)
        const cloudMembers = await gymDatabase.getCollection<any>('members');
        if (cloudMembers) {
           const mappedMembers = cloudMembers.map(m => ({
             ...m,
             expiryDate: m.expiry_date || m.expiry || m.expiryDate,
             biometricStatus: m.biometric_status || m.biometricStatus
           }));
           setMembers(mappedMembers);
           localStorage.setItem('fuxion_members', JSON.stringify(mappedMembers));
        }

        const cloudTx = await gymDatabase.getCollection<any>('transactions');
        if (cloudTx) {
          setTransactions(cloudTx);
          localStorage.setItem('fuxion_tx', JSON.stringify(cloudTx));
        }

        const cloudProducts = await gymDatabase.getCollection<any>('products');
        if (cloudProducts) {
          const mappedCloud = cloudProducts.map((p: any) => ({
            ...p,
            id: String(p.id || p.$id || p.ID), 
            buyPrice: p.buy_price || p.buyPrice || 0,
            sellPrice: p.sell_price || p.sellPrice || 0,
            minStock: p.min_stock || p.minStock || 0
          }));

          setProducts(prev => {
            const newProductList: Product[] = [...mappedCloud];
            prev.forEach(localItem => {
              const alreadyInCloud = mappedCloud.some(c => 
                String(c.id) === String(localItem.id) || 
                c.name.toLowerCase() === localItem.name.toLowerCase()
              );
              if (!alreadyInCloud) newProductList.push(localItem);
            });
            return newProductList;
          });
          setIsLoaded(true);
        }

        setIsLoaded(true);
      } catch (err: any) {
        console.error("❌ ERROR CRÍTICO DE SINCRONIZACIÓN:", err);
        setSyncError(`Error Inicialización: ${err.message || 'Error desconocido'}`);
        setIsLoaded(true);
      }
    };

    initData();

    // 🔗 BROADCAST CHANNEL: Sincronización inter-pestañas
    const bc = new BroadcastChannel('fuxion_sync_channel');
    bc.onmessage = (event) => {
      const { type, data } = event.data;
      // 🧠 Recibimos mensajes de otras pestañas para actualizar la UI local sin peticiones extra.
      if (type === 'MEMBERS_UPDATE') setMembers(data);
      if (type === 'PRODUCTS_UPDATE') setProducts(data);
      if (type === 'TX_UPDATE') setTransactions(data);
      if (type === 'GOALS_UPDATE') setGoals(data);
      if (type === 'OBLIGATIONS_UPDATE') setObligations(data);
      if (type === 'STAFF_UPDATE') setStaff(data);
      if (type === 'ASSETS_UPDATE') setAssets(data);
    };

    // 3. Suscripción Realtime Universal
    const unsubMembers = gymDatabase.subscribe<any>('members', (items) => {
      setSyncStatus('live');
      const mapped = items.map(m => ({
        ...m,
        expiryDate: m.expiry_date || m.expiry || m.expiryDate,
        biometricStatus: m.biometric_status || m.biometricStatus
      }));
      
      // Deduplicación inteligente: Solo actualizamos si hay cambios reales
      setMembers(prev => {
        const cloudStr = JSON.stringify(mapped);
        const prevStr = JSON.stringify(prev);
        if (cloudStr === prevStr) return prev;
        bc.postMessage({ type: 'MEMBERS_UPDATE', data: mapped });
        return mapped;
      });
    });

    const unsubProducts = gymDatabase.subscribe<any>('products', (items) => {
      setSyncStatus('live');
      const mapped = items.map(p => ({
        ...p,
        id: String(p.id || p.$id || p.ID),
        buyPrice: p.buy_price || p.buyPrice || 0,
        sellPrice: p.sell_price || p.sellPrice || 0,
        minStock: p.min_stock || p.minStock || 0
      }));
      
      setProducts(prev => {
        const cloudStr = JSON.stringify(mapped);
        const prevStr = JSON.stringify(prev);
        if (cloudStr === prevStr) return prev;
        bc.postMessage({ type: 'PRODUCTS_UPDATE', data: mapped });
        return mapped;
      });
    });

    const unsubTx = gymDatabase.subscribe<Transaction>('transactions', (items) => {
      setSyncStatus('live');
      setTransactions(prev => {
        const cloudStr = JSON.stringify(items);
        const prevStr = JSON.stringify(prev);
        if (cloudStr === prevStr) return prev;
        bc.postMessage({ type: 'TX_UPDATE', data: items });
        return items;
      });
    });

    // 🎯 SUBS: Metas Financieras (Realtime)
    // 🧠 Escucha cambios en los objetivos de ahorro y expansión.
    const unsubGoals = gymDatabase.subscribe<FinancialGoal>('goals', (items) => {
      setSyncStatus('live');
      setGoals(items);
      bc.postMessage({ type: 'GOALS_UPDATE', data: items });
    });

    // 💸 SUBS: Obligaciones (Realtime)
    // 🧠 Sincroniza facturas pendientes, nóminas y servicios.
    const unsubObligations = gymDatabase.subscribe<Obligation>('obligations', (items) => {
      setSyncStatus('live');
      setObligations(items);
      bc.postMessage({ type: 'OBLIGATIONS_UPDATE', data: items });
    });

    // 👥 SUBS: Personal/Staff (Realtime)
    // 🧠 Refleja cambios en el equipo de trabajo instantáneamente.
    const unsubStaff = gymDatabase.subscribe<Staff>('staff', (items) => {
      setSyncStatus('live');
      setStaff(items);
      bc.postMessage({ type: 'STAFF_UPDATE', data: items });
    });

    // 🔧 SUBS: Activos/Gimnasio (Realtime)
    // 🧠 Mantiene el estado de las máquinas y mantenimiento al día.
    const unsubAssets = gymDatabase.subscribe<GymAsset>('assets', (items) => {
      setSyncStatus('live');
      setAssets(items);
      bc.postMessage({ type: 'ASSETS_UPDATE', data: items });
    });

    return () => {
      unsubMembers();
      unsubProducts();
      unsubTx();
      unsubGoals();
      unsubObligations();
      unsubStaff();
      unsubAssets();
      bc.close();
    };
  }, []);

  // Guardar en LocalStorage cada vez que cambian (Snapshot preventivo)
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('fuxion_tx', JSON.stringify(transactions));
    localStorage.setItem('fuxion_members', JSON.stringify(members));
    localStorage.setItem('fuxion_products', JSON.stringify(products));
    localStorage.setItem('fuxion_goals', JSON.stringify(goals));
    localStorage.setItem('fuxion_obligations', JSON.stringify(obligations));
    localStorage.setItem('fuxion_staff', JSON.stringify(staff));
  }, [isLoaded, transactions, members, products, goals, obligations, staff]);

  const injectTransaction = async (tx: Omit<Transaction, 'id' | 'hash'>) => {
    const newTx: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
      hash: 'TX_' + Math.random().toString(16).slice(2, 6).toUpperCase()
    };
    setTransactions(prev => [newTx, ...prev]);
    await trioSync.create('transactions', newTx);
    return newTx;
  };

  const updateMemberStatus = async (id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    
    const dbUpdates: any = { ...updates };
    if (updates.expiryDate) dbUpdates.expiry_date = updates.expiryDate;
    if (updates.biometricStatus) dbUpdates.biometric_status = updates.biometricStatus;

    try {
      await trioSync.update('members', id, dbUpdates);
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
      await trioSync.update('products', productId, { stock: newStock });
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

  const updatePlansConfig = (newConfig: any) => {
    setPlansConfig(newConfig);
    localStorage.setItem('fuxion_plans_config', JSON.stringify(newConfig));
  };

  return { 
    transactions, assets, members, products, plansConfig, waterConfig,
    setAssets, setMembers, setProducts, updatePlansConfig,
    injectTransaction, updateMemberStatus, clearMemberDebt,
    registerProductSale,
    withdrawFromGoal,
    updateTransaction: async (id: string | number, t: Partial<Transaction>) => {
      setTransactions(prev => prev.map(item => item.id === id ? { ...item, ...t } : item));
      try {
        await trioSync.update('transactions', String(id), t);
      } catch (e) {
        console.warn("⚠️ Actualización de transacción local. Sync pendiente.");
      }
    },
    deleteTransaction: async (id: string | number) => {
      setTransactions(prev => prev.filter(tx => tx.id !== id));
      try {
        await trioSync.delete('transactions', String(id));
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
      const newProduct = { ...p, id: tempId };
      
      setProducts(prev => [newProduct, ...prev]);
      
      try {
        await trioSync.create('products', { ...p, id: tempId });
        setSyncError(null);
      } catch (error: any) {
        // 🛡️ Silencio de sincronización: El producto se guardó localmente, BD en background
        console.warn("⚠️ Producto creado localmente. Sync BD pendiente:", error.message);
        // No mostramos error en franja roja para no bloquear UX
      }
    },
    updateProduct: async (id: string, p: Partial<Product>) => {
      setProducts(prev => prev.map(item => item.id === id ? { ...item, ...p } : item));
      try {
        await trioSync.update('products', id, p);
      } catch (error: any) {
        console.warn("⚠️ Producto actualizado localmente. Sync BD pendiente:", error.message);
      }
    },
    deleteProduct: async (id: string) => {
      setProducts(prev => prev.filter(p => p.id !== id));
      try {
        await trioSync.delete('products', id);
      } catch (error: any) {
        console.warn("⚠️ Producto eliminado localmente. Sync BD pendiente:", error.message);
      }
    },

    goals,
    addGoal: async (g: Omit<FinancialGoal, 'id'>) => {
      const id = crypto.randomUUID();
      const newGoal = { ...g, id };
      setGoals(prev => [newGoal, ...prev]);
      try {
        await trioSync.create('goals', newGoal);
      } catch (e) {
        console.warn("⚠️ Meta guardada localmente. Sync pendiente.");
      }
    },
    updateGoal: async (id: string, g: Partial<FinancialGoal>) => {
      setGoals(prev => prev.map(item => item.id === id ? { ...item, ...g } : item));
      try {
        await trioSync.update('goals', id, g);
      } catch (e) {
        console.warn("⚠️ Actualización de meta local. Sync pendiente.");
      }
    },
    deleteGoal: async (id: string) => {
      setGoals(prev => prev.filter(g => g.id !== id));
      try {
        await trioSync.delete('goals', id);
      } catch (e) {
        console.warn("⚠️ Eliminación de meta local. Sync pendiente.");
      }
    },

    obligations,
    addObligation: async (o: Omit<Obligation, 'id'>) => {
      const id = crypto.randomUUID();
      const newOb = { ...o, id };
      setObligations(prev => [newOb, ...prev]);
      try {
        await trioSync.create('obligations', newOb);
      } catch (e) {
        console.warn("⚠️ Obligación guardada localmente.");
      }
    },
    updateObligation: async (id: string, o: Partial<Obligation>) => {
      setObligations(prev => prev.map(item => item.id === id ? { ...item, ...o } : item));
      try {
        await trioSync.update('obligations', id, o);
      } catch (e) {
        console.warn("⚠️ Actualización de obligación local.");
      }
    },
    deleteObligation: async (id: string) => {
      setObligations(prev => prev.filter(o => o.id !== id));
      try {
        await trioSync.delete('obligations', id);
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
      try {
        await trioSync.create('staff', newStaff);
      } catch (e) {
        console.warn("⚠️ Personal guardado localmente.");
      }
    },
    updateStaff: async (id: string, s: Partial<Staff>) => {
      setStaff(prev => prev.map(item => item.id === id ? { ...item, ...s } : item));
      try {
        await trioSync.update('staff', id, s);
      } catch (e) {
        console.warn("⚠️ Actualización de personal local.");
      }
    },
    deleteStaff: async (id: string) => {
      setStaff(prev => prev.filter(s => s.id !== id));
      try {
        await trioSync.delete('staff', id);
      } catch (e) {
        console.warn("⚠️ Eliminación de personal local.");
      }
    },
    generateMonthlyPayroll: () => {
      const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' }).toUpperCase();
      staff.forEach(s => {
        if (s.status === 'active') {
          setObligations(prev => [{
            id: crypto.randomUUID(),
            name: `PAGO NÓMINA: ${s.name} (${currentMonth})`,
            amount: s.salary,
            dueDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            category: 'payroll'
          }, ...prev]);
        }
      });
    },

    addMember: async (m: Omit<Member, 'id'>) => {
      const tempId = crypto.randomUUID();
      const newMember = { ...m, id: tempId };
      
      setMembers(prev => [newMember, ...prev]);
      
      try {
        await trioSync.create('members', { ...m, id: tempId });
      } catch (error) {
        console.error("Error sync members:", error);
      }
    },
    deleteMember: async (id: string) => {
      setMembers(prev => prev.filter(m => m.id !== id));
      await trioSync.delete('members', id);
    },
    
    // 🚀 NEXUS PUSH: Fuerza la subida de TODO lo local a la nube
    forceSyncAll: async () => {
      setSyncStatus('syncing');
      try {
        console.log("🚀 [NEXUS]: Iniciando empuje masivo a la nube...");
        
        // Sincronizar Miembros
        for (const m of members) {
          await trioSync.create('members', m);
        }
        
        // Sincronizar Productos
        for (const p of products) {
          await trioSync.create('products', p);
        }
        
        // Sincronizar Transacciones (últimas 50 para evitar saturación)
        for (const tx of transactions.slice(0, 50)) {
          await trioSync.create('transactions', tx);
        }

        setSyncStatus('live');
        console.log("✅ [NEXUS]: Sincronización masiva completada con éxito.");
        return true;
      } catch (error) {
        console.error("❌ [NEXUS]: Error en empuje masivo:", error);
        setSyncStatus('local');
        return false;
      }
    },

    syncStatus,
    syncError
  };
}
