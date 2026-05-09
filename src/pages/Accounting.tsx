import { useMemo } from 'react';
import { useGymData } from '../hooks/useGymData';
import { TrendingUp, TrendingDown, Activity, Target, Shield } from 'lucide-react';

export default function Accounting() {
  const { transactions, members, obligations, staff, plans } = useGymData();

  const { metrics, dailyPayers, monthlyPayers, totalRevenue, totalExpenses, netProfit, totalStaffPayroll, pendingCommitments, projectedRealNet, projectedSimulatedNet, simulatedProjection } = useMemo(() => {
    const planCounts: Record<string, number> = {};
    members.forEach(m => {
      const p = m.plan || 'Sin Plan';
      planCounts[p] = (planCounts[p] || 0) + 1;
    });
    
    let dailyPayers = 0;
    let monthlyPayers = 0;
    
    Object.entries(planCounts).forEach(([planId, count]) => {
      const planObj = plans ? plans.find((p: any) => p.id === planId) : null;
      const pLow = (planObj?.name || planId).toLowerCase();
      if (pLow.includes('día') || pLow === 'dia' || pLow.includes('diario')) {
        dailyPayers += count;
      } else if (pLow.includes('mes') || pLow.includes('básico') || pLow.includes('basico') || pLow.includes('pro') || pLow.includes('hyrox')) {
        monthlyPayers += count;
      }
    });

    let moneyDaily = 0;
    let moneyMonthly = 0;
    
    transactions.filter(t => t.type === 'income').forEach(t => {
      const amount = t.amount;
      const desc = (t.description || '').toLowerCase();
      
      if (desc.includes('día') || desc.includes('dia') || desc.includes('visita')) {
        moneyDaily += amount;
      } else if (desc.includes('mes') || desc.includes('mensual') || desc.includes('básico') || desc.includes('pro')) {
        moneyMonthly += amount;
      } else if (amount === 3000) {
        moneyDaily += amount;
      } else if (amount >= 45000) {
        moneyMonthly += amount;
      }
    });

    const totalRevenue = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    // Filtrar los 70000 de prueba
    const totalExpenses = transactions.filter(t => t.type === 'expense' && t.amount !== 70000).reduce((acc, t) => acc + t.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const inactiveCount = members.filter(m => (!m.visits || m.visits === 0) && m.status !== 'suspended').length;
    const suspendedCount = members.filter(m => m.status === 'suspended').length;

    const computedMetrics = [
      { icon: Activity, label: 'Dinero por Día (Visitas)', value: `$${moneyDaily.toLocaleString('es-CO')}`, change: `${dailyPayers} Clientes`, up: true },
      { icon: Activity, label: 'Dinero por Mes (Planes)', value: `$${moneyMonthly.toLocaleString('es-CO')}`, change: `${monthlyPayers} Clientes`, up: true },
      { icon: Activity, label: 'Total Recaudado (Ambos)', value: `$${(moneyDaily + moneyMonthly).toLocaleString('es-CO')}`, change: 'Suma de ambos', up: true },
      { icon: Target, label: 'Inactivos (0 Visitas)', value: `${inactiveCount}`, change: 'Sin asistencia', up: false },
      { icon: Shield, label: 'Suspendidos', value: `${suspendedCount}`, change: 'Pausados', up: false },
    ];

    const totalStaffPayroll = staff ? staff.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.salary || 0), 0) : 0;
    const pendingCommitments = obligations ? obligations.filter(o => o.status === 'pending' && o.category !== 'payroll').reduce((acc, o) => acc + o.amount, 0) : 0;

    const simulatedProjection = (dailyPayers * 3000 * 20) + (monthlyPayers * 45000);
    const projectedRealNet = totalRevenue - totalExpenses - totalStaffPayroll - pendingCommitments;
    const projectedSimulatedNet = simulatedProjection - totalExpenses - totalStaffPayroll - pendingCommitments;

    return { 
      metrics: computedMetrics,
      dailyPayers,
      monthlyPayers,
      totalRevenue,
      totalExpenses,
      netProfit,
      totalStaffPayroll,
      pendingCommitments,
      projectedRealNet,
      projectedSimulatedNet,
      simulatedProjection
    };
  }, [transactions, members, obligations, staff, plans]);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Contabilidad</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
          Gestión financiera y proyecciones
        </p>
      </div>

      {/* ─── METRICS ROW ─── */}
      <div className="kpi-row">
        {metrics.map((m, i) => (
          <div key={m.label} className={`kpi-card cyan animate-fade-in animate-delay-${i + 1}`}>
            <div className="kpi-icon cyan">
              <m.icon size={20} />
            </div>
            <div className="kpi-label">{m.label}</div>
            <div className="kpi-value" style={{ 
              fontSize: 'var(--text-2xl)', 
              background: 'rgba(0, 240, 255, 0.05)', 
              border: '1px solid rgba(0, 240, 255, 0.2)', 
              borderRadius: '6px', 
              padding: '4px 12px', 
              display: 'inline-block',
              marginTop: '6px',
              fontWeight: 700,
              color: '#00F0FF'
            }}>{m.value}</div>
            <div className={`kpi-change ${m.up ? 'positive' : 'negative'}`}>
              {m.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {m.change}
            </div>
          </div>
        ))}
      </div>

      {/* ─── SIMULATION ROW ─── */}
      <div style={{ marginBottom: 12, marginTop: 24 }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-muted)' }}>Simulación de Ingresos (Basado en Clientes Activos)</h3>
      </div>
      <div className="kpi-row" style={{ marginBottom: 24 }}>
        <div className="kpi-card cyan">
          <div className="kpi-label">Simulación Día (al Mes)</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: 'rgba(0, 255, 136, 0.05)', 
            border: '1px solid rgba(0, 255, 136, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: '#00FF88'
          }}>${(dailyPayers * 3000 * 20).toLocaleString('es-CO')}</div>
          <div className="kpi-change positive">${(dailyPayers * 3000).toLocaleString('es-CO')} por día</div>
        </div>
        <div className="kpi-card cyan">
          <div className="kpi-label">Simulación Mes (Planes)</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: 'rgba(0, 255, 136, 0.05)', 
            border: '1px solid rgba(0, 255, 136, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: '#00FF88'
          }}>${(monthlyPayers * 45000).toLocaleString('es-CO')}</div>
          <div className="kpi-change positive">Mensualidades fijas</div>
        </div>
        <div className="kpi-card cyan">
          <div className="kpi-label">Proyección Total Mes</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: 'rgba(0, 255, 136, 0.05)', 
            border: '1px solid rgba(0, 255, 136, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: '#00FF88'
          }}>${((dailyPayers * 3000 * 20) + (monthlyPayers * 45000)).toLocaleString('es-CO')}</div>
          <div className="kpi-change positive">Suma de ambos (20 días)</div>
        </div>
      </div>

      {/* ─── ACCOUNTING ROW ─── */}
      <div style={{ marginBottom: 12, marginTop: 24 }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-muted)' }}>Contabilidad Real (Movimientos de Caja)</h3>
      </div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div className="kpi-card cyan" style={{ flex: '1 1 250px' }}>
          <div className="kpi-label">Entradas (Ingresos)</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: 'rgba(0, 255, 136, 0.05)', 
            border: '1px solid rgba(0, 255, 136, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: '#00FF88'
          }}>${totalRevenue.toLocaleString('es-CO')}</div>
          <div className="kpi-change positive">Dinero ingresado</div>
        </div>
        <div className="kpi-card cyan" style={{ flex: '1 1 250px' }}>
          <div className="kpi-label">Salidas (Gastos)</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: 'rgba(255, 75, 75, 0.05)', 
            border: '1px solid rgba(255, 75, 75, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: '#FF4B4B'
          }}>${totalExpenses.toLocaleString('es-CO')}</div>
          <div className="kpi-change negative">Dinero gastado</div>
        </div>
        <div className="kpi-card cyan" style={{ flex: '1 1 250px' }}>
          <div className="kpi-label">Lo que queda (Neto)</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: netProfit >= 0 ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 75, 75, 0.05)', 
            border: netProfit >= 0 ? '1px solid rgba(0, 255, 136, 0.2)' : '1px solid rgba(255, 75, 75, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: netProfit >= 0 ? '#00FF88' : '#FF4B4B'
          }}>${netProfit.toLocaleString('es-CO')}</div>
          <div className={`kpi-change ${netProfit >= 0 ? 'positive' : 'negative'}`}>Balance final</div>
        </div>
        <div className="kpi-card cyan" style={{ flex: '1 1 250px' }}>
          <div className="kpi-label">Nómina (Suma de Sueldos)</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: 'rgba(255, 75, 75, 0.05)', 
            border: '1px solid rgba(255, 75, 75, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: '#FF4B4B'
          }}>${totalStaffPayroll.toLocaleString('es-CO')}</div>
          <div className="kpi-change negative">Total mensual activo</div>
        </div>
        <div className="kpi-card cyan" style={{ flex: '1 1 250px' }}>
          <div className="kpi-label">Otros Compromisos</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: 'rgba(255, 75, 75, 0.05)', 
            border: '1px solid rgba(255, 75, 75, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: '#FF4B4B'
          }}>${pendingCommitments.toLocaleString('es-CO')}</div>
          <div className="kpi-change negative">Servicios, arriendo, etc.</div>
        </div>
        <div className="kpi-card cyan" style={{ flex: '1 1 250px' }}>
          <div className="kpi-label">Balance Proyectado (Real)</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: projectedRealNet >= 0 ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 75, 75, 0.05)', 
            border: projectedRealNet >= 0 ? '1px solid rgba(0, 255, 136, 0.2)' : '1px solid rgba(255, 75, 75, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: projectedRealNet >= 0 ? '#00FF88' : '#FF4B4B'
          }}>${projectedRealNet.toLocaleString('es-CO')}</div>
          <div className={`kpi-change ${projectedRealNet >= 0 ? 'positive' : 'negative'}`}>Caja real - Cuentas</div>
        </div>
        <div className="kpi-card cyan" style={{ flex: '1 1 250px' }}>
          <div className="kpi-label">Balance Proyectado (Simulado)</div>
          <div className="kpi-value" style={{ 
            fontSize: 'var(--text-2xl)', 
            background: projectedSimulatedNet >= 0 ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 75, 75, 0.05)', 
            border: projectedSimulatedNet >= 0 ? '1px solid rgba(0, 255, 136, 0.2)' : '1px solid rgba(255, 75, 75, 0.2)', 
            borderRadius: '6px', 
            padding: '4px 12px', 
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 700,
            color: projectedSimulatedNet >= 0 ? '#00FF88' : '#FF4B4B'
          }}>${projectedSimulatedNet.toLocaleString('es-CO')}</div>
          <div className={`kpi-change ${projectedSimulatedNet >= 0 ? 'positive' : 'negative'}`}>Ingresos teóricos - Cuentas</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
            Op: {simulatedProjection.toLocaleString('es-CO')} - {totalExpenses.toLocaleString('es-CO')} - {totalStaffPayroll.toLocaleString('es-CO')} - {pendingCommitments.toLocaleString('es-CO')}
          </div>
        </div>
      </div>
    </div>
  );
}
