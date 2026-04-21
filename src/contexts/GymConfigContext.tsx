import { createContext, useContext, useState, ReactNode } from 'react';

export interface GymProduct {
  id: string; name: string; price: number; emoji: string; active: boolean;
}

export interface GymPlan {
  id: string; label: string; color: string; desc: string;
  dailyPrice: number; monthlyPrice: number;
}

interface GymConfigCtx {
  products: GymProduct[];
  plans: GymPlan[];
  setProducts: (p: GymProduct[]) => void;
  setPlans: (p: GymPlan[]) => void;
}

export const DEFAULT_PRODUCTS: GymProduct[] = [
  { id:'agua',    name:'Agua 500ml',    price:2000,  emoji:'💧', active:true },
  { id:'gaseosa', name:'Gaseosa',       price:3000,  emoji:'🥤', active:true },
  { id:'gatorade',name:'Gatorade',      price:4500,  emoji:'⚡', active:true },
  { id:'mekato',  name:'Mekato',        price:3500,  emoji:'🍿', active:true },
  { id:'proteina',name:'Proteína shake',price:8000,  emoji:'💪', active:true },
  { id:'barra',   name:'Barra energía', price:5000,  emoji:'🍫', active:true },
  { id:'cafe',    name:'Café',          price:2500,  emoji:'☕', active:true },
  { id:'jugo',    name:'Jugo natural',  price:4000,  emoji:'🍊', active:true },
];

export const DEFAULT_PLANS: GymPlan[] = [
  { id:'basic', label:'Básico',    color:'#8A948A', desc:'Acceso gimnasio · L-V · Sin clases', dailyPrice:3000,  monthlyPrice:45000  },
  { id:'pro',   label:'Pro',       color:'#00FF88', desc:'Acceso completo · Clases incluidas', dailyPrice:5000,  monthlyPrice:75000  },
  { id:'hyrox', label:'HYROX Pro', color:'#FF6B35', desc:'Elite · HYROX · Trainer asignado',  dailyPrice:8000,  monthlyPrice:120000 },
];

const GymConfigContext = createContext<GymConfigCtx>({
  products: DEFAULT_PRODUCTS,
  plans:    DEFAULT_PLANS,
  setProducts: () => {},
  setPlans:    () => {},
});

const load = <T,>(key: string, def: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : def;
  } catch { return def; }
};

export function GymConfigProvider({ children }: { children: ReactNode }) {
  const [products, setProductsState] = useState<GymProduct[]>(() => load('gym_products', DEFAULT_PRODUCTS));
  const [plans,    setPlansState]    = useState<GymPlan[]>(() => load('gym_plans',    DEFAULT_PLANS));

  const setProducts = (p: GymProduct[]) => {
    setProductsState(p);
    localStorage.setItem('gym_products', JSON.stringify(p));
  };
  const setPlans = (p: GymPlan[]) => {
    setPlansState(p);
    localStorage.setItem('gym_plans', JSON.stringify(p));
  };

  return (
    <GymConfigContext.Provider value={{ products, plans, setProducts, setPlans }}>
      {children}
    </GymConfigContext.Provider>
  );
}

export const useGymConfig = () => useContext(GymConfigContext);
