import { useState, useEffect } from 'react';
import { supabase, hasSupabase } from '../lib/supabase';

/* ══════════════════════════════════════════
   GLOBAL_SYNC_SERVICE V.1.0
   Persistence & Synchronization Layer
══════════════════════════════════════════ */

export interface Transaction {
  id: number; date: string; time: string; description: string;
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

        // 2. Intentar cargar desde Supabase (para datos oficiales)
        const { data: cloudMembers, error: mErr } = await supabase.from('members').select('*');
        if (!mErr && cloudMembers) {
           const mappedMembers = cloudMembers.map(m => ({
             ...m,
             expiryDate: m.expiry_date,
             biometricStatus: m.biometric_status
           }));
           setMembers(mappedMembers);
           localStorage.setItem('fuxion_members', JSON.stringify(mappedMembers));
        }

        const { data: cloudTx, error: tErr } = await supabase.from('transactions').select('*').order('created_at', { ascending: false });
        if (!tErr && cloudTx) {
          setTransactions(cloudTx);
          localStorage.setItem('fuxion_tx', JSON.stringify(cloudTx));
        }

        const { data: cloudProducts, error: pErr } = await supabase.from('products').select('*');
        if (!pErr && cloudProducts && cloudProducts.length > 0) {
          // Mapeo de snake_case (DB) a CamelCase (UI)
          const mappedProducts = cloudProducts.map((p: any) => ({
            ...p,
            buyPrice: p.buy_price || p.buyPrice || 0,
            sellPrice: p.sell_price || p.sellPrice || 0,
            minStock: p.min_stock || p.minStock || 0
          }));
          setProducts(mappedProducts);
          localStorage.setItem('fuxion_products', JSON.stringify(mappedProducts));
        } else if (!pErr) {
          // Fallback a básicos si está vacío
          const base = [
            { id: 'p_agua', name: 'Agua 500ml', category: 'drinks', stock: 50, minStock: 10, buyPrice: 1000, sellPrice: 2000 },
            { id: 'p_gatorade', name: 'Gatorade', category: 'drinks', stock: 24, minStock: 6, buyPrice: 3000, sellPrice: 4500 },
            { id: 'p_proteina', name: 'Proteína shake', category: 'supplements', stock: 15, minStock: 5, buyPrice: 4000, sellPrice: 8000 }
          ] as Product[];
          setProducts(base);
          localStorage.setItem('fuxion_products', JSON.stringify(base));
        }

        setIsLoaded(true);
      } catch (err) {
        console.error("Critical sync error:", err);
        setIsLoaded(true);
      }
    };

    initData();

    // 3. Suscripción Realtime — solo si Supabase está configurado
    let membersSub: ReturnType<typeof supabase.channel> | null = null;
    if (hasSupabase) {
      try {
        membersSub = supabase
          .channel('schema-db-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              const m = payload.new as any;
              setMembers(prev => [{ ...m, expiryDate: m.expiry_date, biometricStatus: m.biometric_status }, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              const m = payload.new as any;
              setMembers(prev => prev.map(old => old.id === m.id ? { ...m, expiryDate: m.expiry_date, biometricStatus: m.biometric_status } : old));
            }
          })
          .subscribe();
      } catch (subErr) {
        console.warn('Realtime subscription no disponible:', subErr);
      }
    }

    return () => {
      if (membersSub) supabase.removeChannel(membersSub);
    };
  }, []);

  // Guardar cada vez que cambian (SOLO si ya se cargó)
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('fuxion_tx', JSON.stringify(transactions));
    localStorage.setItem('fuxion_assets', JSON.stringify(assets));
    localStorage.setItem('fuxion_members', JSON.stringify(members));
    localStorage.setItem('fuxion_products', JSON.stringify(products));
    localStorage.setItem('fuxion_goals', JSON.stringify(goals));
    localStorage.setItem('fuxion_obligations', JSON.stringify(obligations));
    localStorage.setItem('fuxion_staff', JSON.stringify(staff));
  }, [isLoaded, transactions, assets, members, products, goals, obligations, staff]);

  const injectTransaction = async (tx: Omit<Transaction, 'id' | 'hash'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Date.now(),
      hash: 'TX_' + Math.random().toString(16).slice(2, 6).toUpperCase()
    };
    setTransactions(prev => [newTx, ...prev]);
    
    // Cloud Sync
    await supabase.from('transactions').insert([{
      date: newTx.date,
      time: newTx.time,
      description: newTx.description,
      category: newTx.category,
      type: newTx.type,
      amount: newTx.amount,
      method: newTx.method,
      client: newTx.client,
      hash: newTx.hash
    }]);

    return newTx;
  };

  const updateMemberStatus = async (id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    
    // Cloud Sync (Mapping fields)
    const cloudUpdates: any = { ...updates };
    if (updates.expiryDate) {
      cloudUpdates.expiry_date = updates.expiryDate;
      delete cloudUpdates.expiryDate;
    }
    if (updates.biometricStatus) {
      cloudUpdates.biometric_status = updates.biometricStatus;
      delete cloudUpdates.biometricStatus;
    }

    await supabase.from('members').update(cloudUpdates).eq('id', id);
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
    
    // Cloud Sync Stock
    await supabase.from('products').update({ stock: newStock }).eq('id', productId);

    await injectTransaction({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString().slice(0, 5),
      description: `VENTA: ${qty}x ${product.name}`,
      category: 'product',
      type: 'income',
      amount: product.sellPrice * qty,
      method: method,
      client: clientName
    });
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
    
    // Configuración Agua
    waterConfig,
    updateWaterConfig: (cfg: Partial<typeof waterConfig>) => {
       const newCfg = { ...waterConfig, ...cfg };
       setWaterConfig(newCfg);
       localStorage.setItem('gym_water_config', JSON.stringify(newCfg));
    },
    
    // CRUD Productos con Sincronización Cloud y Mapeo SnakeCase
    addProduct: async (p: Omit<Product, 'id'>) => {
      // 1. Crear producto temporal para respuesta instantánea (Offline-First)
      const tempId = 'temp_' + Date.now();
      const newProduct: Product = { ...p, id: tempId };
      
      // Actualización optimista del estado local
      setProducts(prev => [newProduct, ...prev]);
      
      // Mapeo UI -> DB
      const dbProduct = {
        name: p.name,
        category: p.category,
        stock: p.stock,
        min_stock: p.minStock,
        buy_price: p.buyPrice,
        sell_price: p.sellPrice
      };

      try {
        const { data, error } = await supabase.from('products').insert([dbProduct]).select();
        
        if (error) {
          console.warn("Sync warning (Guardado localmente):", error.message);
          // No retornamos aquí, el producto ya está en el estado local
          return;
        }

        if (data && data[0]) {
          const cloudProduct = {
            ...data[0],
            buyPrice: data[0].buy_price,
            sellPrice: data[0].sell_price,
            minStock: data[0].min_stock
          } as Product;
          
          // Reemplazar el temporal con el oficial de la nube para mantener coherencia de IDs
          setProducts(prev => prev.map(item => item.id === tempId ? cloudProduct : item));
        }
      } catch (err) {
        console.error("Error crítico de red, producto queda solo en local:", err);
      }
    },
    updateProduct: async (id: string, p: Partial<Product>) => {
      // Mapeo UI -> DB
      const dbUpdates: any = { ...p };
      if (p.minStock !== undefined) dbUpdates.min_stock = p.minStock;
      if (p.buyPrice !== undefined) dbUpdates.buy_price = p.buyPrice;
      if (p.sellPrice !== undefined) dbUpdates.sell_price = p.sellPrice;
      
      // Eliminar las versiones camelCase para evitar errores de columna no encontrada
      delete dbUpdates.minStock;
      delete dbUpdates.buyPrice;
      delete dbUpdates.sellPrice;

      setProducts(prev => prev.map(item => item.id === id ? { ...item, ...p } : item));
      
      const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
      if (error) {
        console.error("Error al actualizar producto en Supabase:", error);
        alert(`Error de actualización: ${error.message}`);
      }
    },
    deleteProduct: async (id: string) => {
      const originalProducts = [...products];
      // Actualización Optimista
      setProducts(prev => prev.filter(p => p.id !== id));
      
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error("Error al eliminar producto en Supabase:", error);
        alert(`Error al eliminar: ${error.message}`);
        setProducts(originalProducts);
      } else {
        localStorage.setItem('fuxion_products', JSON.stringify(originalProducts.filter(p => p.id !== id)));
      }
    },

    // CRUD Metas
    goals,
    addGoal: (g: Omit<FinancialGoal, 'id'>) => setGoals(prev => [{ ...g, id: 'g_' + Date.now() }, ...prev]),
    updateGoal: (id: string, g: Partial<FinancialGoal>) => setGoals(prev => prev.map(item => item.id === id ? { ...item, ...g } : item)),
    deleteGoal: (id: string) => setGoals(prev => prev.filter(g => g.id !== id)),

    // CRUD Obligaciones
    obligations,
    addObligation: (o: Omit<Obligation, 'id'>) => setObligations(prev => [{ ...o, id: 'ob_' + Date.now() }, ...prev]),
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
        category: ob.category === 'utilities' ? 'utilities' : ob.category === 'rent' ? 'rent' : 'other',
        type: 'expense',
        amount: ob.amount,
        method: 'Efectivo'
      });
    },

    // CRUD Staff & Nómina
    staff,
    addStaff: (s: Omit<Staff, 'id'>) => setStaff(prev => [{ ...s, id: 's_' + Date.now() }, ...prev]),
    updateStaff: (id: string, s: Partial<Staff>) => setStaff(prev => prev.map(item => item.id === id ? { ...item, ...s } : item)),
    deleteStaff: (id: string) => setStaff(prev => prev.filter(s => s.id !== id)),
    generateMonthlyPayroll: () => {
      const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' }).toUpperCase();
      staff.forEach(s => {
        if (s.status === 'active') {
          setObligations(prev => [{
            id: `p_${s.id}_${Date.now()}`,
            name: `PAGO NÓMINA: ${s.name} (${currentMonth})`,
            amount: s.salary,
            dueDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            category: 'payroll'
          }, ...prev]);
        }
      });
    }
  };
}

