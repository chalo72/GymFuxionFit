import { useState } from 'react';
import {
  CreditCard, DollarSign, TrendingUp, AlertCircle,
  CheckCircle2, Clock, Download, Filter, Plus,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const transactions = [
  { id: 'TXN-001', member: 'Alex Guerrero', plan: 'hyrox', amount: 120, date: '2026-04-18', status: 'paid', method: 'Visa *4521' },
  { id: 'TXN-002', member: 'María López', plan: 'pro', amount: 75, date: '2026-04-17', status: 'paid', method: 'Mastercard *8834' },
  { id: 'TXN-003', member: 'Diego Fernández', plan: 'hyrox', amount: 120, date: '2026-04-16', status: 'pending', method: 'Transferencia' },
  { id: 'TXN-004', member: 'Sofía Castillo', plan: 'basic', amount: 40, date: '2026-04-15', status: 'overdue', method: 'Efectivo' },
  { id: 'TXN-005', member: 'Andrés Mejía', plan: 'pro', amount: 75, date: '2026-04-15', status: 'paid', method: 'Nequi' },
  { id: 'TXN-006', member: 'Valentina Torres', plan: 'hyrox', amount: 120, date: '2026-04-14', status: 'paid', method: 'Visa *7723' },
  { id: 'TXN-007', member: 'Carlos Rivas', plan: 'basic', amount: 40, date: '2026-04-13', status: 'paid', method: 'Efectivo' },
  { id: 'TXN-008', member: 'Lucía Martínez', plan: 'pro', amount: 75, date: '2026-04-12', status: 'pending', method: 'PSE' },
];

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

export default function Payments() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'revenue' | 'plans'>('transactions');
  const [filterStatus, setFilterStatus] = useState('all');

  const totalMonth = transactions.filter(t => t.status === 'paid').reduce((a, t) => a + t.amount, 0);
  const pending = transactions.filter(t => t.status === 'pending').reduce((a, t) => a + t.amount, 0);
  const overdue = transactions.filter(t => t.status === 'overdue').reduce((a, t) => a + t.amount, 0);

  const filtered = filterStatus === 'all'
    ? transactions
    : transactions.filter(t => t.status === filterStatus);

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
          <div className="kpi-change positive"><TrendingUp size={12} /> +15.8%</div>
        </div>
        <div className="kpi-card orange animate-fade-in animate-delay-2">
          <div className="kpi-icon orange"><Clock size={20} /></div>
          <div className="kpi-label">Pagos Pendientes</div>
          <div className="kpi-value">${pending}</div>
          <div className="kpi-change positive" style={{ background: 'rgba(255,214,0,0.1)', color: 'var(--warning-yellow)' }}>
            {transactions.filter(t => t.status === 'pending').length} transacciones
          </div>
        </div>
        <div className="kpi-card animate-fade-in animate-delay-3" style={{ borderColor: 'rgba(255,61,87,0.2)' }}>
          <div className="kpi-icon red"><AlertCircle size={20} /></div>
          <div className="kpi-label">Pagos Vencidos</div>
          <div className="kpi-value" style={{ color: 'var(--danger-red)' }}>${overdue}</div>
          <div className="kpi-change negative">
            {transactions.filter(t => t.status === 'overdue').length} membresía(s)
          </div>
        </div>
        <div className="kpi-card green animate-fade-in animate-delay-4">
          <div className="kpi-icon green"><CreditCard size={20} /></div>
          <div className="kpi-label">Proyectado Mes</div>
          <div className="kpi-value">$38,750</div>
          <div className="kpi-change positive"><TrendingUp size={12} /> meta 94%</div>
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
            {['all', 'paid', 'pending', 'overdue'].map((f) => (
              <button
                key={f}
                className={`chart-tab ${filterStatus === f ? 'active' : ''}`}
                onClick={() => setFilterStatus(f)}
                style={{ padding: '4px 12px' }}
              >
                {f === 'all' ? 'Todos' : f === 'paid' ? 'Pagados' : f === 'pending' ? 'Pendientes' : 'Vencidos'}
              </button>
            ))}
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Miembro</th>
                  <th>Plan</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {t.id}
                    </td>
                    <td>
                      <div className="member-cell">
                        <div className="member-avatar">
                          {t.member.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontWeight: 600 }}>{t.member}</span>
                      </div>
                    </td>
                    <td><span className={`plan-badge ${t.plan}`}>{t.plan === 'basic' ? 'Básico' : t.plan === 'pro' ? 'Pro' : 'HYROX'}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--neon-green)' }}>${t.amount}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{t.method}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{t.date}</td>
                    <td>
                      <span className={`status-badge ${statusClass(t.status)}`}>
                        {statusIcon(t.status)}
                        {statusLabel(t.status)}
                      </span>
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
    </div>
  );
}
