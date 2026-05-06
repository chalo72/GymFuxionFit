import { useState } from 'react';
import { Apple, Flame, Beef, Droplets, Zap, TrendingUp, Plus, Search } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const weeklyCalories = [
  { day: 'Lun', calories: 2150, goal: 2200 },
  { day: 'Mar', calories: 1980, goal: 2200 },
  { day: 'Mié', calories: 2320, goal: 2200 },
  { day: 'Jue', calories: 2100, goal: 2200 },
  { day: 'Vie', calories: 2450, goal: 2200 },
  { day: 'Sáb', calories: 1850, goal: 2200 },
  { day: 'Dom', calories: 2200, goal: 2200 },
];

const macros = [
  { name: 'Proteína', value: 35, color: '#00FF88', grams: 182, goal: 200 },
  { name: 'Carbohidratos', value: 45, color: '#FF6B35', grams: 234, goal: 250 },
  { name: 'Grasas', value: 20, color: '#A78BFA', grams: 52, goal: 60 },
];

const meals = [
  { time: '07:30', name: 'Desayuno', calories: 520, icon: '🥣', description: 'Avena + plátano + proteína' },
  { time: '10:00', name: 'Snack Pre-Entreno', calories: 180, icon: '🍌', description: 'Fruta + BCAA' },
  { time: '13:30', name: 'Almuerzo', calories: 680, icon: '🥗', description: 'Pechuga + arroz + ensalada' },
  { time: '16:00', name: 'Post-Entreno', calories: 320, icon: '🥤', description: 'Shake proteína + creatina' },
  { time: '20:00', name: 'Cena', calories: 450, icon: '🐟', description: 'Salmón + vegetales al vapor' },
];

const topMembers = [
  { name: 'Alex Guerrero', plan: 'HYROX', compliance: 94, calories: 2450, streak: 18 },
  { name: 'María López', plan: 'Pro', compliance: 88, calories: 1850, streak: 12 },
  { name: 'Andrés Mejía', plan: 'Pro', compliance: 82, calories: 2200, streak: 7 },
  { name: 'Valentina Torres', plan: 'HYROX', compliance: 79, calories: 2100, streak: 5 },
];

export default function Nutrition() {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'members'>('today');
  const todayTotal = meals.reduce((acc, m) => acc + m.calories, 0);
  const goalCalories = 2200;

  return (
    <div className="animate-fade-in">
      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
            Nutrición <span style={{ color: 'var(--neon-green)', fontSize: '1rem' }}>AI-Powered</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Seguimiento nutricional y planes personalizados por IA
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary">
            <Search size={16} />
            Buscar Alimento
          </button>
          <button className="btn btn-primary">
            <Plus size={16} />
            Registrar Comida
          </button>
        </div>
      </div>

      {/* ─── KPI ROW ─── */}
      <div className="kpi-row" style={{ marginBottom: 24 }}>
        <div className="kpi-card cyan animate-fade-in animate-delay-1">
          <div className="kpi-icon cyan"><Flame size={20} /></div>
          <div className="kpi-label">Calorías Hoy</div>
          <div className="kpi-value">{todayTotal.toLocaleString()}</div>
          <div className="kpi-change positive">
            <TrendingUp size={12} />
            {Math.round((todayTotal / goalCalories) * 100)}% de meta
          </div>
        </div>
        <div className="kpi-card orange animate-fade-in animate-delay-2">
          <div className="kpi-icon orange"><Beef size={20} /></div>
          <div className="kpi-label">Proteína</div>
          <div className="kpi-value">182g</div>
          <div className="kpi-change positive">
            <TrendingUp size={12} />
            91% de meta
          </div>
        </div>
        <div className="kpi-card green animate-fade-in animate-delay-3">
          <div className="kpi-icon green"><Apple size={20} /></div>
          <div className="kpi-label">Adherencia Semanal</div>
          <div className="kpi-value">86%</div>
          <div className="kpi-change positive">
            <TrendingUp size={12} />
            +4% vs semana pasada
          </div>
        </div>
        <div className="kpi-card animate-fade-in animate-delay-4">
          <div className="kpi-icon cyan"><Droplets size={20} /></div>
          <div className="kpi-label">Hidratación</div>
          <div className="kpi-value">2.4L</div>
          <div className="kpi-change positive">
            <TrendingUp size={12} />
            80% de meta (3L)
          </div>
        </div>
      </div>

      {/* ─── TABS ─── */}
      <div className="chart-tabs" style={{ marginBottom: 20, width: 'fit-content' }}>
        {(['today', 'week', 'members'] as const).map((tab) => (
          <button
            key={tab}
            className={`chart-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'today' ? 'Hoy' : tab === 'week' ? 'Esta Semana' : 'Por Miembro'}
          </button>
        ))}
      </div>

      {activeTab === 'today' && (
        <div className="dashboard-grid">
          {/* ─── CALORÍAS HOY ─── */}
          <div className="glass-card">
            <div className="glass-card-header">
              <div>
                <div className="glass-card-title">Plan Nutricional del Día</div>
                <div className="glass-card-subtitle">{todayTotal} / {goalCalories} kcal</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--neon-green)' }}>
                  {goalCalories - todayTotal}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>kcal restantes</div>
              </div>
            </div>

            {/* Progress total */}
            <div style={{ marginBottom: 24 }}>
              <div className="progress-bar" style={{ height: 10 }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.min((todayTotal / goalCalories) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Meals list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {meals.map((meal, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 0',
                  borderBottom: i < meals.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none'
                }}>
                  <span style={{ fontSize: '1.5rem', width: 40, textAlign: 'center' }}>{meal.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{meal.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{meal.description}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--neon-green)' }}>
                      {meal.calories} kcal
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{meal.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── MACROS DONUT ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-card">
              <div className="glass-card-title" style={{ marginBottom: 20 }}>Distribución de Macros</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 160, height: 160, position: 'relative', flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macros}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {macros.map((m, i) => (
                          <Cell key={i} fill={m.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>100%</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Balance</div>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {macros.map((m, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: m.color, display: 'inline-block' }} />
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{m.name}</span>
                        </div>
                        <span style={{ fontSize: 'var(--text-sm)', color: m.color, fontWeight: 700 }}>
                          {m.grams}g / {m.goal}g
                        </span>
                      </div>
                      <div className="macro-bar-track">
                        <div
                          className="macro-bar-fill"
                          style={{
                            width: `${Math.min((m.grams / m.goal) * 100, 100)}%`,
                            background: m.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── AI SUGERENCIA ─── */}
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.05), rgba(0,0,0,0))' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--green-15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={20} style={{ color: 'var(--neon-green)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--neon-green)', marginBottom: 6 }}>
                    🤖 Recomendación FitBot 2.0
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Tus niveles de proteína están al <strong style={{ color: '#fff' }}>91%</strong> de la meta.
                    Añade un batido de caseína antes de dormir para alcanzar los <strong style={{ color: 'var(--neon-green)' }}>200g diarios</strong> recomendados para tu objetivo HYROX.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'week' && (
        <div className="glass-card">
          <div className="glass-card-header">
            <div>
              <div className="glass-card-title">Calorías de la Semana</div>
              <div className="glass-card-subtitle">Ingesta real vs meta diaria (2,200 kcal)</div>
            </div>
          </div>
          <div className="chart-container" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyCalories}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FF88" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#00FF88" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="goalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(14,18,14,0.95)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number, name: string) => [`${v.toLocaleString()} kcal`, name === 'calories' ? 'Ingesta' : 'Meta']}
                />
                <Area type="monotone" dataKey="goal" name="goal" stroke="#FF6B35" strokeWidth={2} fill="url(#goalGrad)" strokeDasharray="6 3" dot={false} />
                <Area type="monotone" dataKey="calories" name="calories" stroke="#00FF88" strokeWidth={2.5} fill="url(#calGrad)" dot={{ r: 4, fill: '#00FF88', stroke: 'rgba(0,255,136,0.3)', strokeWidth: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,255,136,0.06)' }}>
            <div className="glass-card-title">Adherencia Nutricional por Miembro</div>
            <div className="glass-card-subtitle">Top miembros con seguimiento activo del plan</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Miembro</th>
                <th>Plan</th>
                <th>Calorías Hoy</th>
                <th>Adherencia</th>
                <th>Racha</th>
              </tr>
            </thead>
            <tbody>
              {topMembers.map((m, i) => (
                <tr key={i}>
                  <td>
                    <div className="member-cell">
                      <div className="member-avatar">
                        {m.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div style={{ fontWeight: 600 }}>{m.name}</div>
                    </div>
                  </td>
                  <td><span className={`plan-badge ${(m.plan || '').toLowerCase()}`}>{m.plan}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{m.calories.toLocaleString()} kcal</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, maxWidth: 100 }}>
                        <div className="progress-bar">
                          <div className="progress-bar-fill" style={{ width: `${m.compliance}%` }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: m.compliance >= 90 ? 'var(--success-green)' : m.compliance >= 75 ? 'var(--neon-green)' : 'var(--warning-yellow)' }}>
                        {m.compliance}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--energy-orange)', fontWeight: 700 }}>🔥 {m.streak} días</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
