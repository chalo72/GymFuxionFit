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
  trainingLogs?: { date: string; session: string; intensity: number; notes: string }[];
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
  const [waterConfig, setWaterConfig] = useState({
    bagPrice: 200,
    bagsPerPaca: 50,
    pacaCost: 6000
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

    // 3. Suscripción Realtime Universal
    const unsubMembers = gymDatabase.subscribe<any>('members', (items) => {
      const mapped = items.map(m => ({
        ...m,
        expiryDate: m.expiry_date || m.expiry || m.expiryDate,
        biometricStatus: m.biometric_status || m.biometricStatus
      }));
      setMembers(mapped);
    });

    const unsubProducts = gymDatabase.subscribe<any>('products', (items) => {
      const mapped = items.map(p => ({
        ...p,
        id: String(p.id || p.$id || p.ID),
        buyPrice: p.buy_price || p.buyPrice || 0,
        sellPrice: p.sell_price || p.sellPrice || 0,
        minStock: p.min_stock || p.minStock || 0
      }));
      setProducts(mapped);
    });

    const unsubTx = gymDatabase.subscribe<Transaction>('transactions', (items) => {
      setTransactions(items);
    });

    return () => {
      unsubMembers();
      unsubProducts();
      unsubTx();
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

  return { 
    transactions, assets, members, products,
    setAssets, setMembers, setProducts,
    injectTransaction, updateMemberStatus, clearMemberDebt,
    registerProductSale,
    withdrawFromGoal,
    
    waterConfig,
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
    addGoal: (g: Omit<FinancialGoal, 'id'>) => setGoals(prev => [{ ...g, id: crypto.randomUUID() }, ...prev]),
    updateGoal: (id: string, g: Partial<FinancialGoal>) => setGoals(prev => prev.map(item => item.id === id ? { ...item, ...g } : item)),
    deleteGoal: (id: string) => setGoals(prev => prev.filter(g => g.id !== id)),

    obligations,
    addObligation: (o: Omit<Obligation, 'id'>) => setObligations(prev => [{ ...o, id: crypto.randomUUID() }, ...prev]),
    updateObligation: (id: string, o: Partial<Obligation>) => setObligations(prev => prev.map(item => item.id === id ? { ...item, ...o } : item)),
    deleteObligation: (id: string) => setObligations(prev => prev.filter(o => o.id !== id)),
    payObligation: (id: string) => {
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
    addStaff: (s: Omit<Staff, 'id'>) => setStaff(prev => [{ ...s, id: crypto.randomUUID() }, ...prev]),
    updateStaff: (id: string, s: Partial<Staff>) => setStaff(prev => prev.map(item => item.id === id ? { ...item, ...s } : item)),
    deleteStaff: (id: string) => setStaff(prev => prev.filter(s => s.id !== id)),
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
    syncError
  };
}
