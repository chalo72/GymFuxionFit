import React, { useState } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { searchFoodOFF, FoodProduct } from '../../services/nutritionService';

export function PanelNutrition() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [loggedFoods, setLoggedFoods] = useState<FoodProduct[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    const data = await searchFoodOFF(query);
    setResults(data);
    setLoading(false);
  };

  const addFood = (food: FoodProduct) => {
    setLoggedFoods([...loggedFoods, food]);
  };

  const totalKcal = loggedFoods.reduce((sum, f) => sum + (f.macros.calories || 0), 0);
  const totalProtein = loggedFoods.reduce((sum, f) => sum + (f.macros.protein || 0), 0);
  const totalCarbs = loggedFoods.reduce((sum, f) => sum + (f.macros.carbs || 0), 0);
  const totalFats = loggedFoods.reduce((sum, f) => sum + (f.macros.fats || 0), 0);

  const macros = [
    { name: 'PROTEIN_CORE', val: Math.round(totalProtein), goal: 180, color: '#FF6B35', pct: Math.min((totalProtein / 180) * 100, 100) },
    { name: 'CARB_RESOURCE', val: Math.round(totalCarbs), goal: 280, color: '#00FF88', pct: Math.min((totalCarbs / 280) * 100, 100) },
    { name: 'FAT_SUPPORT', val: Math.round(totalFats),  goal: 65,  color: '#FFD700', pct: Math.min((totalFats / 65) * 100, 100) },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, height: '100%' }}>
       <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 14, fontWeight: 950, color: '#fff', marginBottom: 20 }}>GLOBAL_FOOD_DATABASE</h3>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input 
                type="text" 
                placeholder="Buscar alimentos en vivo..." 
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ 
                  width: '100%', padding: '12px 14px 12px 40px', borderRadius: 12, 
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                  color: '#fff', fontSize: 12, outline: 'none'
                }}
              />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '0 20px', borderRadius: 12, background: 'var(--neon-green)', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Buscar'}
            </button>
          </form>

          <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                <img src={r.image_url} alt={r.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.brand} · {Math.round(r.macros.calories)} kcal</div>
                </div>
                <button onClick={() => addFood(r)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
       </div>

       <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 13, fontWeight: 950, color: '#fff', marginBottom: 20 }}>NUTRI_LOG_VERIFIED</h3>
          
          <div style={{ padding: 30, borderRadius: 20, background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)', textAlign: 'center', marginBottom: 20 }}>
             <div style={{ fontSize: 48, fontWeight: 950, color: 'var(--neon-green)', letterSpacing: -2 }}>{Math.round(totalKcal)}</div>
             <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2 }}>KCAL_INGESTED / 2,200_TARGET</div>
             <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 10, marginTop: 16 }}>
                <div style={{ height: '100%', width: `${Math.min((totalKcal / 2200) * 100, 100)}%`, background: 'var(--neon-green)', borderRadius: 10, boxShadow: '0 0 10px var(--neon-green)', transition: 'width 0.5s ease-out' }} />
             </div>
          </div>
          
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom: 24 }}>
             {macros.map(m => (
               <div key={m.name}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, fontWeight:900, color:'var(--text-muted)', marginBottom:6 }}>
                     <span>{m.name}</span>
                     <span>{m.val}G / {m.goal}G</span>
                  </div>
                  <div style={{ height: 4, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
                     <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 10, transition: 'width 0.5s ease-out' }} />
                  </div>
               </div>
             ))}
          </div>

          <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loggedFoods.map((f, i) => (
               <div key={i} style={{ padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', display:'flex', justifyContent:'space-between' }}>
                  <div>
                     <div style={{ fontSize: 11, fontWeight: 950, color:'#fff' }}>{f.name}</div>
                     <div style={{ fontSize: 9, color:'var(--text-muted)', fontWeight:800 }}>{f.brand}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                     <div style={{ fontSize: 11, fontWeight: 950, color: 'var(--neon-green)' }}>{Math.round(f.macros.calories || 0)} KCAL</div>
                  </div>
               </div>
            ))}
          </div>
       </div>
    </div>
  );
}
