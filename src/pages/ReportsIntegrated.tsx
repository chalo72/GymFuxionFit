import React, { useState, useMemo } from 'react';
import { ComposedChart, Line, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGymData } from '../hooks/useGymData';

/* ══════════════════════════════════════════
   REPORTES INTEGRADOS v2.0 — DATOS REALES
   Conectado con useGymData (Appwrite + Firebase)
══════════════════════════════════════════ */

export default function IntegratedReports() {
  const { members, transactions, products, goals } = useGymData();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [reportView, setReportView] = useState<'summary' | 'detailed' | 'export'>('summary');

  // ── CÁLCULOS REALES ──
  const stats = useMemo(() => {
    const now = new Date();
    const activeMembers = members.filter(m => m.status === 'active').length;
    const totalMembers = members.length;
    const expiring = members.filter(m => m.status === 'expiring').length;

    // Ingresos reales por mes (últimos 4 meses)
    const monthlyRevenue = Array.from({ length: 4 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (3 - i), 1);
      const label = d.toLocaleString('es-ES', { month: 'short' });
      const income = transactions
        .filter(tx => {
          const txDate = new Date(tx.date);
          return tx.type === 'income' && txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear();
        })
        .reduce((s, tx) => s + tx.amount, 0);
      const expense = transactions
        .filter(tx => {
          const txDate = new Date(tx.date);
          return tx.type === 'expense' && txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear();
        })
        .reduce((s, tx) => s + tx.amount, 0);
      return { week: label, income, expense, net: income - expense };
    });

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const lowStock = products.filter(p => p.stock <= p.minStock).length;
    const membershipRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

    // Distribución de ingresos por categoría
    const categoryMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'income').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    const distribution = Object.entries(categoryMap).map(([name, value], i) => ({
      name, value, color: ['#00ff88','#FFD600','#A78BFA','#FF6B35','#38BDF8'][i % 5]
    }));

    return { activeMembers, totalMembers, expiring, monthlyRevenue, totalIncome, totalExpense, lowStock, membershipRate, distribution };
  }, [members, transactions, products]);

  const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  const kpis = [
    { label: 'Miembros Activos', value: stats.activeMembers, sub: `de ${stats.totalMembers} totales`, color: 'var(--neon-green)' },
    { label: 'Ingresos Totales', value: fmt(stats.totalIncome), sub: `Gastos: ${fmt(stats.totalExpense)}`, color: '#FFD600' },
    { label: 'Retención', value: `${stats.membershipRate}%`, sub: `${stats.expiring} por vencer`, color: '#A78BFA' },
    { label: 'Alerta Stock', value: stats.lowStock, sub: 'productos bajo mínimo', color: '#FF6B35' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24, backgroundColor: 'var(--space-dark)', color: '#fff', minHeight: '100vh' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Reportes Integrados</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            🟢 Datos en tiempo real · {members.length} miembros · {transactions.length} transacciones
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['week','month','quarter'] as const).map(p => (
            <button key={p} onClick={() => setSelectedPeriod(p)} style={{
              padding: '8px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: selectedPeriod === p ? 'var(--neon-green)' : 'rgba(255,255,255,0.1)',
              color: selectedPeriod === p ? '#000' : '#fff'
            }}>
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Trimestre'}
            </button>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
        {[{ id: 'summary', label: '📊 Resumen' }, { id: 'detailed', label: '📈 Detallado' }, { id: 'export', label: '📥 Exportar' }].map(tab => (
          <button key={tab.id} onClick={() => setReportView(tab.id as any)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 12,
            background: reportView === tab.id ? 'var(--neon-green)' : 'transparent',
            color: reportView === tab.id ? '#000' : '#fff'
          }}>{tab.label}</button>
        ))}
      </div>

      {/* RESUMEN */}
      {reportView === 'summary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {kpis.map((k, i) => (
              <div key={i} style={{
                padding: 20, borderRadius: 16, textAlign: 'center',
                background: 'linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: k.color, marginBottom: 6 }}>{k.value}</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* GRÁFICO DE INGRESOS vs GASTOS */}
          <div style={{ padding: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📊 Ingresos vs Gastos (últimos 4 meses)</h3>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.85)', border: '1px solid var(--neon-green)', borderRadius: 8, fontSize: 11 }} formatter={(v: any) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="income" name="Ingresos" fill="#00ff88" opacity={0.7} radius={[4,4,0,0]} />
                  <Bar dataKey="expense" name="Gastos" fill="#FF6B35" opacity={0.7} radius={[4,4,0,0]} />
                  <Line type="monotone" dataKey="net" name="Neto" stroke="#FFD600" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DISTRIBUCIÓN POR CATEGORÍA */}
          {stats.distribution.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{ padding: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>💰 Ingresos por Categoría</h3>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.distribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                        {stats.distribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ background: 'rgba(0,0,0,0.85)', borderRadius: 8, fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {stats.distribution.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, flex: 1, textTransform: 'capitalize' }}>{d.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{fmt(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ESTADO DE MEMBRESÍAS */}
              <div style={{ padding: 24, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>👥 Estado de Membresías</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Activos', count: members.filter(m => m.status === 'active').length, color: 'var(--neon-green)' },
                    { label: 'Por vencer', count: members.filter(m => m.status === 'expiring').length, color: '#FFD600' },
                    { label: 'Vencidos', count: members.filter(m => m.status === 'expired').length, color: '#FF6B35' },
                    { label: 'Suspendidos', count: members.filter(m => m.status === 'suspended').length, color: '#888' },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12 }}>{s.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.count}</span>
                      </div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${stats.totalMembers > 0 ? (s.count / stats.totalMembers) * 100 : 0}%`, background: s.color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETALLADO */}
      {reportView === 'detailed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📋 Últimas 20 Transacciones</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {transactions.slice(0, 20).map((tx, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{tx.description}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{tx.date} · {tx.category}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 900, color: tx.type === 'income' ? 'var(--neon-green)' : '#FF6B35' }}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>No hay transacciones registradas aún.</p>}
            </div>
          </div>

          {/* PRODUCTOS CON BAJO STOCK */}
          <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>⚠️ Productos Bajo Stock Mínimo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {products.filter(p => p.stock <= p.minStock).map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,61,87,0.05)', border: '1px solid rgba(255,61,87,0.2)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.category}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#FF6B35' }}>Stock: {p.stock} / Min: {p.minStock}</span>
                </div>
              ))}
              {products.filter(p => p.stock <= p.minStock).length === 0 && <p style={{ color: 'var(--neon-green)', fontSize: 12 }}>✅ Todos los productos tienen stock suficiente.</p>}
            </div>
          </div>
        </div>
      )}

      {/* EXPORTAR */}
      {reportView === 'export' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { format: 'PDF Profesional', icon: '📄', color: 'var(--neon-green)', action: () => window.print() },
            { format: 'Copiar al Portapapeles', icon: '📋', color: '#FFD600', action: () => {
              const summary = `REPORTE FUXION GYM\nMiembros Activos: ${stats.activeMembers}\nIngresos: ${fmt(stats.totalIncome)}\nGastos: ${fmt(stats.totalExpense)}\nNeto: ${fmt(stats.totalIncome - stats.totalExpense)}`;
              navigator.clipboard.writeText(summary);
              alert('📋 Reporte copiado al portapapeles');
            }},
            { format: 'Exportar JSON', icon: '📊', color: '#A78BFA', action: () => {
              const blob = new Blob([JSON.stringify({ members, transactions, products }, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `fuxion-report-${new Date().toISOString().split('T')[0]}.json`; a.click();
            }},
            { format: 'Compartir Link', icon: '🔗', color: '#FF6B35', action: () => navigator.share?.({ title: 'Reporte FuxionGym', url: window.location.href }) },
          ].map((opt, i) => (
            <button key={i} onClick={opt.action} style={{
              padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: 'all 0.2s'
            }}
              onMouseOver={e => { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
            >
              <div style={{ fontSize: 32 }}>{opt.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: opt.color }}>{opt.format}</div>
              <div style={{ padding: '5px 14px', background: opt.color, color: '#000', borderRadius: 6, fontWeight: 700, fontSize: 11 }}>Ejecutar</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
