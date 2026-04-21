import { useState, useEffect } from 'react';

/* ══════════════════════════════════════════
   GLOBAL_SYNC_SERVICE V.1.0
   Persistence & Synchronization Layer
══════════════════════════════════════════ */

export interface Transaction {
  id: number; date: string; time: string; description: string;
  category: string; type: 'income' | 'expense'; amount: number; method: string; client?: string;
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
  objective?: string;
  injuries?: string;
  nutrition?: string;
  emergencyContact?: string;
  weight?: number;
  bodyFat?: number;
  streak?: number;
  alerts?: string[];
  goal?: string;
  progress?: number;
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

  // Carregar datos iniciales y persistencia
  useEffect(() => {
    const savedTx = localStorage.getItem('fuxion_tx');
    const savedAssets = localStorage.getItem('fuxion_assets');
    const savedMembers = localStorage.getItem('fuxion_members');
    const savedProducts = localStorage.getItem('fuxion_products');
    const savedGoals = localStorage.getItem('fuxion_goals');
    const savedObligations = localStorage.getItem('fuxion_obligations');
    const savedStaff = localStorage.getItem('fuxion_staff');

    try {
      if (savedTx) setTransactions(JSON.parse(savedTx));
      if (savedAssets) setAssets(JSON.parse(savedAssets));
      if (savedMembers) setMembers(JSON.parse(savedMembers));
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedGoals) setGoals(JSON.parse(savedGoals));
      if (savedObligations) setObligations(JSON.parse(savedObligations));
      if (savedStaff) setStaff(JSON.parse(savedStaff));
      else throw new Error("No initial data");
    } catch (err) {
      // Fallback a Mock
      setMembers([
        { 
          id: '1', name: 'Alex Guerrero', status: 'active', expiryDate: '2026-05-30', debt: 0, lastVisit: '2026-04-18', plan: 'Hyrox Pro',
          objective: 'HYROX Elite', weight: 78.5, bodyFat: 11.2, streak: 18, injuries: 'Ninguna', alerts: [],
          trainingLogs: [{ date: '2026-04-18', session: 'SkiErg - Sled - Row', intensity: 92, notes: 'Récord en Sled' }]
        },
        { 
          id: '2', name: 'Valentina Torres', status: 'active', expiryDate: '2026-06-15', debt: 0, lastVisit: '2026-04-19', plan: 'Gimnasio',
          objective: 'Tonificación', weight: 58.3, bodyFat: 17.8, streak: 12, injuries: 'Molestia hombro', alerts: ['Revisar hombro']
        },
      ]);
      setProducts([
         { id: 'p1', name: 'Proteína Shake', category: 'supplements', stock: 25, minStock: 5, buyPrice: 4500, sellPrice: 8000 },
         { id: 'p2', name: 'Creatina 300g', category: 'supplements', stock: 12, minStock: 3, buyPrice: 45000, sellPrice: 85000 },
         { id: 'p3', name: 'Gatorade 500ml', category: 'drinks', stock: 48, minStock: 10, buyPrice: 2800, sellPrice: 4500 },
         { id: 'p4', name: 'Agua 600ml', category: 'drinks', stock: 60, minStock: 12, buyPrice: 1000, sellPrice: 2000 },
      ]);
      setGoals([
        { id: 'g1', name: 'FONDO EXPANSIÓN', current: 15200000, target: 50000000, category: 'expansion' },
        { id: 'g2', name: 'RENOVACIÓN MÁQUINAS', current: 4500000, target: 12000000, category: 'maintenance' },
        { id: 'g3', name: 'NÓMINA DICIEMBRE', current: 1200000, target: 8000000, category: 'payroll' },
      ]);
      setObligations([
        { id: 'ob1', name: 'Arriendo Local', amount: 2500000, dueDate: '2026-04-05', status: 'paid', category: 'rent' },
        { id: 'ob2', name: 'Luz (ElectroCaribe)', amount: 450000, dueDate: '2026-04-25', status: 'pending', category: 'utilities' },
        { id: 'ob3', name: 'Nómina General', amount: 3200000, dueDate: '2026-04-30', status: 'pending', category: 'payroll' },
      ]);
      setStaff([
        { id: 's1', name: 'Carlos Entrenador', role: 'Coach Senior', salary: 1200000, status: 'active' },
        { id: 's2', name: 'Maria Recepción', role: 'Administrativo', salary: 950000, status: 'active' },
        { id: 's3', name: 'Pedro Limpieza', role: 'Mantenimiento', salary: 850000, status: 'active' },
      ]);
    }
  }, []);

  // Guardar cada vez que cambian
  useEffect(() => {
    localStorage.setItem('fuxion_tx', JSON.stringify(transactions));
    localStorage.setItem('fuxion_assets', JSON.stringify(assets));
    localStorage.setItem('fuxion_members', JSON.stringify(members));
    localStorage.setItem('fuxion_products', JSON.stringify(products));
    localStorage.setItem('fuxion_goals', JSON.stringify(goals));
    localStorage.setItem('fuxion_obligations', JSON.stringify(obligations));
    localStorage.setItem('fuxion_staff', JSON.stringify(staff));
  }, [transactions, assets, members, products, goals, obligations, staff]);

  const injectTransaction = (tx: Omit<Transaction, 'id' | 'hash'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Date.now(),
      hash: 'TX_' + Math.random().toString(16).slice(2, 6).toUpperCase()
    };
    setTransactions(prev => [newTx, ...prev]);
    return newTx;
  };

  const updateMemberStatus = (id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const clearMemberDebt = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member || member.debt <= 0) return;
    const debt = member.debt;
    updateMemberStatus(memberId, { debt: 0 });
    injectTransaction({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString().slice(0, 5),
      description: `PAGO_DEUDA: ${member.name}`,
      category: 'membership',
      type: 'income',
      amount: debt,
      method: 'Efectivo'
    });
  };

  const registerProductSale = (productId: string, qty: number, clientName: string, method: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock < qty) return false;

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: p.stock - qty } : p));
    
    injectTransaction({
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

  const updateProductStock = (id: string, newStock: number) => {
     setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
  };

  return { 
    transactions, assets, members, products,
    setAssets, setMembers, setProducts,
    injectTransaction, updateMemberStatus, clearMemberDebt,
    registerProductSale, updateProductStock,
    
    // CRUD Productos
    addProduct: (p: Omit<Product, 'id'>) => setProducts(prev => [{ ...p, id: 'p_' + Date.now() }, ...prev]),
    updateProduct: (id: string, p: Partial<Product>) => setProducts(prev => prev.map(item => item.id === id ? { ...item, ...p } : item)),
    deleteProduct: (id: string) => setProducts(prev => prev.filter(p => p.id !== id)),

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

