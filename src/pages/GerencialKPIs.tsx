import { useMemo } from 'react';
import { useGymData } from '../hooks/useGymData';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Activity,
  AlertTriangle, CheckCircle2, Target, Award, Zap, Package, UserCheck
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

/* ══════════════════════════════════════════
   GERENCIAL KPIs DASHBOARD v1.0
   Basado en: Sistema Operativo FuxionFit Completo
   + Guía de Gestión del Negocio FuxionFit
   SK-KPIS-001 | 2026-05-04
══════════════════════════════════════════ */

const COLORS = ['#00FF88', '#00F0FF', '#FF6B35', '#A78BFA', '#FFD600', '#FF3D57'];

export default function GerencialKPIs() {
  const { members, transactions, products, obligations, staff } = useGymData();

  const kpis = useMemo(() => {
    const now = new Date();
    const thisMonth = now.toISOString().substring(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().substring(0, 7);

    // ── Membresías ──
    const totalMembers = members.length;
    const activeMembers = members.filter((m: any) => m.status === 'active').length;
    const expiringMembers = members.filter((m: any) => m.status === 'expiring').length;
    const expiredMembers = members.filter((m: any) => m.status === 'expired').length;
    const retentionRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;
    const totalDebt = members.reduce((acc: number, m: any) => acc + (m.debt || 0), 0);

    // ── Ingresos ──
    const incomeThisMonth = transactions
      .filter((t: any) => t.type === 'income' && t.date?.startsWith(thisMonth))
      .reduce((acc: number, t: any) => acc + t.amount, 0);
    const incomeLastMonth = transactions
      .filter((t: any) => t.type === 'income' && t.date?.startsWith(lastMonth))
      .reduce((acc: number, t: any) => acc + t.amount, 0);
    const revenueGrowth = incomeLastMonth > 0
      ? Math.round(((incomeThisMonth - incomeLastMonth) / incomeLastMonth) * 100)
      : 0;

    const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + t.amount, 0);
    const totalExpenses = transactions.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + t.amount, 0);
    const arpu = activeMembers > 0 ? Math.round(totalIncome / activeMembers) : 0;
    const netProfit = totalIncome - totalExpenses;

    // ── Planes ──
    const planDist: Record<string, number> = {};
    members.forEach((m: any) => {
      const p = m.plan || 'Otro';
      planDist[p] = (planDist[p] || 0) + 1;
    });
    const planData = Object.entries(planDist).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));

    // ── Inventario en alerta ──
    const lowStockProducts = products.filter((p: any) => p.stock <= (p.minStock || 5)).length;

    // ── Obligaciones pendientes ──
    const pendingObligations = obligations ? obligations.filter((o: any) => o.status === 'pending').reduce((acc: number, o: any) => acc + o.amount, 0) : 0;

    // ── Personal activo ──
    const activeStaff = staff ? staff.filter((s: any) => s.status === 'active').length : 0;

    // ── Gráfica mensual (últimos 6 meses) ──
    const revMap: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t: any) => {
      if (!t.date) return;
      const m = t.date.substring(0, 7);
      if (!revMap[m]) revMap[m] = { income: 0, expense: 0 };
      if (t.type === 'income') revMap[m].income += t.amount;
      else revMap[m].expense += t.amount;
    });
    const monthlyChart = Object.entries(revMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, vals]) => {
        const date = new Date(month + '-02');
        return {
          mes: date.toLocaleString('es-CO', { month: 'short' }).charAt(0).toUpperCase() + date.toLocaleString('es-CO', { month: 'short' }).slice(1),
          Ingresos: vals.income,
          Egresos: vals.expense,
          Utilidad: vals.income - vals.expense,
        };
      });

    // ── Radar de salud del negocio ──
    const radarData = [
      { metric: 'Retención', value: retentionRate },
      { metric: 'Crecimiento', value: Math.min(100, Math.max(0, revenueGrowth + 50)) },
      { metric: 'Stock', value: lowStockProducts === 0 ? 100 : Math.max(0, 100 - lowStockProducts * 20) },
      { metric: 'Liquidez', value: netProfit > 0 ? Math.min(100, Math.round((netProfit / totalIncome) * 100)) : 0 },
      { metric: 'Equipo', value: activeStaff > 0 ? 90 : 30 },
      { metric: 'Cartera', value: totalDebt > 0 ? Math.max(0, 100 - Math.round(totalDebt / 10000)) : 100 },
    ];

    return {
      totalMembers, activeMembers, expiringMembers, expiredMembers, retentionRate,
      totalDebt, incomeThisMonth, incomeLastMonth, revenueGrowth,
      totalIncome, totalExpenses, netProfit, arpu,
      planData, lowStockProducts, pendingObligations, activeStaff,
      monthlyChart, radarData,
    };
  }, [members, transactions, products, obligations, staff]);

  const StatCard = ({ label, value, sub, icon: Icon, color, trend }: any) => (
    <div className="glass-card" style={{ padding: 20, border: `1px solid ${color}20`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, borderRadius: '50%', background: `${color}08` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}30` }}>
          <Icon size={20} color={color} />
        </div>
        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: trend >= 0 ? '#00FF88' : '#FF3D57' }}>
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, color, marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  );

  const healthScore = Math.round(kpis.radarData.reduce((a, r) => a + r.value, 0) / kpis.radarData.length);
  const healthColor = healthScore >= 75 ? '#00FF88' : healthScore >= 50 ? '#FFD600' : '#FF3D57';
  const healthLabel = healthScore >= 75 ? 'EXCELENTE' : healthScore >= 50 ? 'ESTABLE' : 'REQUIERE ATENCIÓN';

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: 'var(--space-dark)' }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 4 }}>Panel Gerencial — KPIs del Negocio</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Visión ejecutiva basada en el Sistema Operativo FuxionFit</p>
        </div>
        {/* Health Score Badge */}
        <div style={{ padding: '12px 20px', borderRadius: 16, background: `${healthColor}10`, border: `1px solid ${healthColor}30`, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: healthColor }}>{healthScore}</div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2 }}>SALUD DEL NEGOCIO</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: healthColor }}>{healthLabel}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row 1 — Membresías */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <StatCard label="Miembros Activos" value={kpis.activeMembers} sub={`de ${kpis.totalMembers} totales`} icon={Users} color="#00FF88" />
        <StatCard label="Tasa de Retención" value={`${kpis.retentionRate}%`} sub="Miembros activos/total" icon={UserCheck} color="#00F0FF" trend={kpis.retentionRate - 70} />
        <StatCard label="Por Vencer Pronto" value={kpis.expiringMembers} sub="Requieren contacto" icon={AlertTriangle} color="#FFD600" />
        <StatCard label="Vencidos" value={kpis.expiredMembers} sub="Sin membresía activa" icon={TrendingDown} color="#FF3D57" />
        <StatCard label="Cartera / Deudas" value={`$${kpis.totalDebt.toLocaleString()}`} sub="Deuda total pendiente" icon={AlertTriangle} color="#FF6B35" />
      </div>

      {/* KPI Cards Row 2 — Finanzas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard label="Ingresos del Mes" value={`$${kpis.incomeThisMonth.toLocaleString()}`} sub="Mes actual" icon={DollarSign} color="#00FF88" trend={kpis.revenueGrowth} />
        <StatCard label="ARPU" value={`$${kpis.arpu.toLocaleString()}`} sub="Ingreso prom. por atleta" icon={Target} color="#A78BFA" />
        <StatCard label="Utilidad Neta" value={`$${kpis.netProfit.toLocaleString()}`} sub="Ingresos - Egresos" icon={Award} color={kpis.netProfit >= 0 ? '#00FF88' : '#FF3D57'} />
        <StatCard label="Obligaciones Pend." value={`$${kpis.pendingObligations.toLocaleString()}`} sub="Por pagar" icon={AlertTriangle} color="#FFD600" />
        <StatCard label="Stock Crítico" value={kpis.lowStockProducts} sub="Productos bajo mínimo" icon={Package} color={kpis.lowStockProducts > 0 ? '#FF3D57' : '#00FF88'} />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Monthly Trend */}
        <div className="glass-card" style={{ padding: 24, border: '1px solid rgba(0,255,136,0.1)' }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, color: '#fff' }}>Tendencia Mensual de Caja</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Ingresos, Egresos y Utilidad — Últimos 6 meses</div>
          {kpis.monthlyChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={kpis.monthlyChart}>
                <defs>
                  <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00FF88" stopOpacity={0.3} /><stop offset="100%" stopColor="#00FF88" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF3D57" stopOpacity={0.2} /><stop offset="100%" stopColor="#FF3D57" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'rgba(14,14,21,0.95)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12, fontSize: 12 }} formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="Ingresos" stroke="#00FF88" strokeWidth={2} fill="url(#gInc)" dot={false} />
                <Area type="monotone" dataKey="Egresos" stroke="#FF3D57" strokeWidth={2} fill="url(#gExp)" dot={false} />
                <Area type="monotone" dataKey="Utilidad" stroke="#FFD600" strokeWidth={2} fill="none" strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Sin datos históricos aún. Los gráficos aparecerán cuando registres transacciones.
            </div>
          )}
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            {[['#00FF88', 'Ingresos'], ['#FF3D57', 'Egresos'], ['#FFD600', 'Utilidad']].map(([color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution Pie */}
        <div className="glass-card" style={{ padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, color: '#fff' }}>Distribución de Planes</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Membresías activas por tipo</div>
          {kpis.planData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={kpis.planData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {kpis.planData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(14,14,21,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {kpis.planData.map((p: any) => (
                  <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 3, background: p.color }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{p.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>
              Sin miembros registrados aún
            </div>
          )}
        </div>
      </div>

      {/* Health Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="glass-card" style={{ padding: 24, border: `1px solid ${healthColor}20` }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4, color: '#fff' }}>Radar de Salud Empresarial</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>6 dimensiones clave del negocio (0-100)</div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={kpis.radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
              <Radar name="FuxionFit" dataKey="value" stroke={healthColor} fill={healthColor} fillOpacity={0.15} strokeWidth={2} />
              <Tooltip contentStyle={{ background: 'rgba(14,14,21,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Alertas Ejecutivas */}
        <div className="glass-card" style={{ padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: '#fff' }}>⚡ Alertas Ejecutivas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { cond: kpis.expiringMembers > 0, icon: AlertTriangle, color: '#FFD600', msg: `${kpis.expiringMembers} atleta(s) vencen pronto — Contactar hoy`, action: '/members' },
              { cond: kpis.totalDebt > 50000, icon: AlertTriangle, color: '#FF6B35', msg: `Cartera alta: $${kpis.totalDebt.toLocaleString()} en deudas`, action: '/members' },
              { cond: kpis.lowStockProducts > 0, icon: Package, color: '#FF3D57', msg: `${kpis.lowStockProducts} producto(s) con stock crítico`, action: '/inventory' },
              { cond: kpis.pendingObligations > 0, icon: DollarSign, color: '#FFD600', msg: `Obligaciones pendientes: $${kpis.pendingObligations.toLocaleString()}`, action: '/finances' },
              { cond: kpis.revenueGrowth < 0, icon: TrendingDown, color: '#FF3D57', msg: `Ingresos cayeron ${Math.abs(kpis.revenueGrowth)}% vs mes anterior`, action: '/analytics' },
              { cond: kpis.retentionRate >= 80, icon: CheckCircle2, color: '#00FF88', msg: `Excelente retención: ${kpis.retentionRate}% de miembros activos`, action: null },
              { cond: kpis.revenueGrowth >= 10, icon: Zap, color: '#00FF88', msg: `Crecimiento sólido: +${kpis.revenueGrowth}% en ingresos`, action: null },
              { cond: kpis.netProfit > 0, icon: Award, color: '#00FF88', msg: `Operando con utilidad positiva este mes`, action: null },
            ].filter(a => a.cond).slice(0, 6).map((alert, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: `${alert.color}08`, border: `1px solid ${alert.color}25` }}>
                <alert.icon size={16} color={alert.color} />
                <span style={{ fontSize: 13, color: '#fff', flex: 1 }}>{alert.msg}</span>
              </div>
            ))}
            {kpis.totalMembers === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
                Sin alertas activas. ¡Todo en orden! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
