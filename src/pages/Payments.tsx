import { useState } from 'react';
import {
  CreditCard, DollarSign, TrendingUp, AlertCircle,
  CheckCircle2, Clock, Download, Filter, Plus,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import { useGymData, Transaction } from '../hooks/useGymData';

const revenueByPlan = [
  { month: 'Ene', basic: 8200, pro: 11250, hyrox: 9040 },
  { month: 'Feb', basic: 8400, pro: 12000, hyrox: 9800 },
  { month: 'Mar', basic: 7800, pro: 11000, hyrox: 9000 },
  { month: 'Abr', basic: 8600, pro: 12500, hyrox: 11650 },
];


const statusIcon = (status: string) => {
  if (status === 'paid') return <CheckCircle2 size={14} />;
  if (status === 'pending') return <Clock size={14} />;
  return <AlertCircle size={14} />;
};

const statusClass = (status: string) => {
  if (status === 'paid') return 'active';
  if (status === 'pending') return 'pending';
  return 'inactive';
};

const statusLabel = (status: string) => {
  if (status === 'paid') return 'Pagado';
  if (status === 'pending') return 'Pendiente';
  return 'Vencido';
};

const mapCategoryToPlan = (category: string) => {
  if (category === 'membership') return 'Mensualidad';
  if (category === 'daypass') return 'Día (Rutina)';
  if (category === 'product') return 'Producto';
  return category.toUpperCase();
};

export default function Payments() {
  const { transactions, updateTransaction, deleteTransaction, members } = useGymData();
  const [activeTab, setActiveTab] = useState<'transactions' | 'revenue' | 'plans'>('transactions');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});

  const incomeTxs = transactions.filter(t => t.type === 'income');
  
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const todayStr = new Date().toISOString().split('T')[0];
  const totalMonth = incomeTxs.filter(t => t.date.startsWith(currentMonthStr)).reduce((a, t) => a + t.amount, 0);
  const totalToday = incomeTxs.filter(t => t.date === todayStr).reduce((a, t) => a + t.amount, 0);
  const pendingDebt = members.reduce((a, m) => a + (m.debt || 0), 0);
  const totalIncome = incomeTxs.reduce((a, t) => a + t.amount, 0);

  const filtered = filterStatus === 'all'
    ? incomeTxs
    : incomeTxs.filter(t => t.category === filterStatus);

  const handleSaveEdit = () => {
    if (editingTx && editForm) {
      updateTransaction(editingTx.id, editForm);
      setEditingTx(null);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
            Pagos <span style={{ color: 'var(--neon-green)', fontSize: '1rem', marginLeft: 8 }}>& Facturación</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Control financiero · Stripe · Nequi · PSE · Efectivo
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary">
            <Download size={16} /> Exportar
          </button>
          <button className="btn btn-primary">
            <Plus size={16} /> Registrar Pago
          </button>
        </div>
      </div>

      {/* ─── KPIs ─── */}
      <div className="kpi-row" style={{ marginBottom: 24 }}>
        <div className="kpi-card cyan animate-fade-in animate-delay-1">
          <div className="kpi-icon cyan"><DollarSign size={20} /></div>
          <div className="kpi-label">Recaudado este Mes</div>
          <div className="kpi-value">${totalMonth.toLocaleString()}</div>
          <div className="kpi-change positive"><TrendingUp size={12} /> Actualizado</div>
        </div>
        <div className="kpi-card orange animate-fade-in animate-delay-2">
          <div className="kpi-icon orange"><Clock size={20} /></div>
          <div className="kpi-label">Deuda Acumulada Clientes</div>
          <div className="kpi-value">${pendingDebt.toLocaleString()}</div>
          <div className="kpi-change positive" style={{ background: 'rgba(255,214,0,0.1)', color: 'var(--warning-yellow)' }}>
            Pendiente de Cobro
          </div>
        </div>
        <div className="kpi-card animate-fade-in animate-delay-3" style={{ borderColor: 'rgba(255,61,87,0.2)' }}>
          <div className="kpi-icon red"><AlertCircle size={20} /></div>
          <div className="kpi-label">Ingreso Total Histórico</div>
          <div className="kpi-value" style={{ color: 'var(--neon-green)' }}>${totalIncome.toLocaleString()}</div>
          <div className="kpi-change positive">
            {incomeTxs.length} cobros registrados
          </div>
        </div>
        <div className="kpi-card green animate-fade-in animate-delay-4" style={{ borderColor: 'rgba(0,255,136,0.3)', boxShadow: '0 0 20px rgba(0,255,136,0.1)' }}>
          <div className="kpi-icon green"><DollarSign size={20} /></div>
          <div className="kpi-label" style={{ color: '#fff', fontWeight: 700 }}>RECAUDO DE HOY</div>
          <div className="kpi-value" style={{ color: 'var(--neon-green)', fontSize: '2rem' }}>${totalToday.toLocaleString()}</div>
          <div className="kpi-change positive" style={{ background: 'var(--neon-green)', color: '#000', fontWeight: 900 }}>
            <TrendingUp size={12} /> Cierre Diario
          </div>
        </div>
      </div>

      {/* ─── TABS ─── */}
      <div className="chart-tabs" style={{ marginBottom: 20, width: 'fit-content' }}>
        {(['transactions', 'revenue', 'plans'] as const).map((tab) => (
          <button
            key={tab}
            className={`chart-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'transactions' ? 'Transacciones' : tab === 'revenue' ? 'Ingresos' : 'Por Plan'}
          </button>
        ))}
      </div>

      {activeTab === 'transactions' && (
        <>
          {/* ─── FILTERS ─── */}
          <div className="glass-card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            {['all', 'membership', 'daypass', 'product'].map((f) => (
              <button
                key={f}
                className={`chart-tab ${filterStatus === f ? 'active' : ''}`}
                onClick={() => setFilterStatus(f)}
                style={{ padding: '4px 12px' }}
              >
                {f === 'all' ? 'Todos los Cobros' : f === 'membership' ? 'Mensualidades / Semanas' : f === 'daypass' ? 'Días de Rutina' : 'Productos'}
              </button>
            ))}
          </div>

          <div className="data-table-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
            <table className="data-table" style={{ minWidth: 800 }}>
              <thead>
                <tr>
                  <th>Concepto / Descripción</th>
                  <th>Cliente</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.sort((a,b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime()).map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>
                      {t.description}
                    </td>
                    <td>
                      <div className="member-cell">
                        <span style={{ fontWeight: 600 }}>{t.client || 'General'}</span>
                      </div>
                    </td>
                    <td><span className={`plan-badge`} style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)' }}>{mapCategoryToPlan(t.category)}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--neon-green)' }}>${t.amount.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{t.method}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{t.date} {t.time}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setEditingTx(t); setEditForm(t); }} style={{ padding: '6px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Editar</button>
                        <button onClick={() => { if(confirm('¿Eliminar este cobro?')) deleteTransaction(t.id); }} style={{ padding: '6px', background: 'rgba(255,61,87,0.1)', border: 'none', borderRadius: 8, color: 'var(--danger-red)', cursor: 'pointer' }}>Borrar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'revenue' && (
        <div className="glass-card">
          <div className="glass-card-header">
            <div>
              <div className="glass-card-title">Ingresos por Mes</div>
              <div className="glass-card-subtitle">Desglosado por tipo de plan</div>
            </div>
          </div>
          <div className="chart-container" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByPlan}>
                <defs>
                  <linearGradient id="basicGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00FF88" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#00FF88" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="proGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B35" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="hyroxRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(14,18,14,0.95)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name]}
                />
                <Area type="monotone" dataKey="basic" name="Básico" stroke="#00FF88" strokeWidth={2} fill="url(#basicGrad)" dot={false} />
                <Area type="monotone" dataKey="pro" name="Pro" stroke="#FF6B35" strokeWidth={2} fill="url(#proGrad)" dot={false} />
                <Area type="monotone" dataKey="hyrox" name="HYROX" stroke="#A78BFA" strokeWidth={2} fill="url(#hyroxRevGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="dashboard-grid" style={{ gap: 20 }}>
          {[
            { name: 'Plan Básico', price: 40, members: 520, color: '#00FF88', features: ['Acceso sala principal', 'Vestuarios', 'App básica'] },
            { name: 'Plan Pro', price: 75, members: 450, color: '#FF6B35', features: ['Todo Plan Básico', 'Clases grupales', 'AI Coach básico', 'Nutrición básica'] },
            { name: 'Plan HYROX Pro', price: 120, members: 277, color: '#A78BFA', features: ['Todo Plan Pro', 'Entrenamiento HYROX', 'Genesis Scan', 'AI Coach Elite', 'Wearables sync'] },
          ].map((plan) => (
            <div key={plan.name} className="glass-card" style={{ borderColor: `${plan.color}25` }}>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: plan.color, marginBottom: 4 }}>
                {plan.name}
              </div>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 4 }}>
                ${plan.price}
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--text-muted)' }}>/mes</span>
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 20 }}>
                {plan.members} miembros activos
              </div>
              <div className="progress-bar" style={{ marginBottom: 20 }}>
                <div className="progress-bar-fill" style={{ width: `${(plan.members / 520) * 100}%`, background: plan.color }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={14} style={{ color: plan.color, flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20, padding: '12px', background: 'var(--space-medium)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: 'var(--neon-green)' }}>
                  ${(plan.price * plan.members).toLocaleString()}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>Ingreso mensual</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* ── MODAL DE EDICIÓN ── */}
      {editingTx && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
           <div className="glass-card" style={{ width: '100%', maxWidth: 400, maxHeight: '90vh', overflowY: 'auto', padding: 24, border: '1px solid var(--neon-green)30' }}>
              <h3 style={{ fontSize: 18, fontWeight: 950, marginBottom: 24, color: '#fff' }}>EDITAR COBRO / ABONO</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                 <div>
                    <label style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>DESCRIPCIÓN (EJE: Abono rutina diaria)</label>
                    <input className="input-field" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ width: '100%', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                 </div>
                 <div>
                    <label style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>CLIENTE</label>
                    <input className="input-field" value={editForm.client || ''} onChange={e => setEditForm({...editForm, client: e.target.value})} style={{ width: '100%', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                       <label style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>MONTO PAGADO ($)</label>
                       <input type="number" className="input-field" value={editForm.amount || 0} onChange={e => setEditForm({...editForm, amount: Number(e.target.value)})} style={{ width: '100%', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--neon-green)', fontWeight: 950 }} />
                    </div>
                    <div>
                       <label style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>MÉTODO</label>
                       <select value={editForm.method || 'Efectivo'} onChange={e => setEditForm({...editForm, method: e.target.value})} style={{ width: '100%', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                          <option value="Efectivo">Efectivo</option>
                          <option value="Nequi">Nequi</option>
                          <option value="Bancolombia">Bancolombia</option>
                          <option value="Transferencia">Transferencia</option>
                       </select>
                    </div>
                 </div>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                       <label style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>FECHA</label>
                       <input type="date" className="input-field" value={editForm.date || ''} onChange={e => setEditForm({...editForm, date: e.target.value})} style={{ width: '100%', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    </div>
                    <div>
                       <label style={{ fontSize: 9, fontWeight: 950, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>CATEGORÍA</label>
                       <select value={editForm.category || 'daypass'} onChange={e => setEditForm({...editForm, category: e.target.value})} style={{ width: '100%', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                          <option value="daypass">Día de Rutina</option>
                          <option value="membership">Mensualidad / Semanal</option>
                          <option value="product">Producto</option>
                          <option value="other">Abono General</option>
                       </select>
                    </div>
                 </div>
                 <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button onClick={() => setEditingTx(null)} style={{ flex: 1, padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontWeight: 950, cursor: 'pointer' }}>CANCELAR</button>
                    <button onClick={handleSaveEdit} style={{ flex: 1, padding: 14, borderRadius: 12, background: 'var(--neon-green)', border: 'none', color: '#000', fontWeight: 950, cursor: 'pointer' }}>GUARDAR CAMBIOS</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
