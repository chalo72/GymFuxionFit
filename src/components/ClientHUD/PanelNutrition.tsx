import { useState } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { searchFoodOFF, FoodProduct } from '../../services/nutritionService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AiAssist } from '../AiAssist';
import type { Member } from '../../hooks/useGymData';

const RAPIDOS = [
  { name: 'Agua 500 ml', calories: 0, protein: 0, carbs: 0, fats: 0 },
  { name: 'Arepa con huevo', calories: 320, protein: 14, carbs: 36, fats: 12 },
  { name: 'Arroz con pollo (plato)', calories: 480, protein: 32, carbs: 52, fats: 12 },
  { name: 'Jugo de mango natural', calories: 140, protein: 1, carbs: 34, fats: 0 },
  { name: 'Patacón (2)', calories: 220, protein: 2, carbs: 30, fats: 10 },
];

export function PanelNutrition({ athlete, updateMemberStatus }: { athlete?: Member | null; updateMemberStatus?: (id: string, u: Partial<Member>) => Promise<void> }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const loggedFoods = (athlete?.todaysMeals || []) as { name: string; calories: number; protein?: number; carbs?: number; fats?: number }[];

  const persist = async (meal: { name: string; calories: number; protein?: number; carbs?: number; fats?: number }) => {
    if (!athlete?.id || !updateMemberStatus) return;
    await updateMemberStatus(athlete.id, {
      todaysMeals: [...loggedFoods, { ...meal, time: new Date().toLocaleTimeString().slice(0, 5), date: new Date().toISOString() }],
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setResults(await searchFoodOFF(query));
    setLoading(false);
  };

  const totalKcal = loggedFoods.reduce((sum, f) => sum + (Number(f.calories) || 0), 0);
  const totalProtein = loggedFoods.reduce((sum, f) => sum + (Number(f.protein) || 0), 0);
  const totalCarbs = loggedFoods.reduce((sum, f) => sum + (Number(f.carbs) || 0), 0);
  const totalFats = loggedFoods.reduce((sum, f) => sum + (Number(f.fats) || 0), 0);

  const pieData = [
    { name: 'Proteína', value: totalProtein, color: '#FF6B35' },
    { name: 'Carbohidratos', value: totalCarbs, color: '#00FF88' },
    { name: 'Grasas', value: totalFats, color: '#FFD700' },
  ].filter((d) => d.value > 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, height: '100%' }}>
       <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 16, fontWeight: 950, color: '#fff', marginBottom: 8 }}>Qué comiste hoy</h3>
          <AiAssist rol="nutrición" texto="Costa: hidratación primero. Atajos locales (arepa, arroz con pollo, jugo). El buscador es extra. Lo que sumas queda en tu ficha para el entrenador." />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {RAPIDOS.map((r) => (
              <button key={r.name} type="button" onClick={() => persist(r)} style={{ padding: '8px 12px', borderRadius: 12, border: '1px solid rgba(0,255,136,0.3)', background: 'transparent', color: '#fff', fontSize: 12, cursor: 'pointer' }}>{r.name}</button>
            ))}
          </div>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12 }} />
              <input type="text" placeholder="Buscar otro alimento..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12 }} />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '0 20px', borderRadius: 12, background: 'var(--neon-green)', color: '#000', border: 'none', fontWeight: 'bold' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Buscar'}
            </button>
          </form>
          <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                {r.image_url ? <img src={r.image_url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} /> : null}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{r.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{Math.round(r.macros.calories)} kcal</div>
                </div>
                <button type="button" onClick={() => persist({ name: r.name, calories: r.macros.calories, protein: r.macros.protein, carbs: r.macros.carbs, fats: r.macros.fats })} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', border: 'none', cursor: 'pointer' }}>
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
       </div>
       <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ fontSize: 42, fontWeight: 950, color: 'var(--neon-green)' }}>{Math.round(totalKcal)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>kcal hoy (tu registro, no un demo)</div>
          {pieData.length > 0 && (
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={40} outerRadius={60} paddingAngle={4} stroke="none">
                    {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {loggedFoods.map((f, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8 }}>
              <span>{f.name}</span>
              <span>{Math.round(Number(f.calories) || 0)} kcal</span>
            </div>
          ))}
       </div>
    </div>
  );
}
