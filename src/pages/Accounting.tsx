import { useState, useMemo } from 'react';
import { useGymData } from '../hooks/useGymData';
import { TrendingUp, TrendingDown, Activity, Target, Shield, Eye, Settings, Calculator } from 'lucide-react';

export default function Accounting() {
  const { transactions, members, obligations, staff, plans, plansConfig } = useGymData();

  // Estados para simulación
  const [workingDays, setWorkingDays] = useState(20);
  const [conversionRate, setConversionRate] = useState(0); // % de inactivos que pasan a activos
  const [simulatedPayroll, setSimulatedPayroll] = useState<number | null>(null);
  const [simulatedOtherExpenses, setSimulatedOtherExpenses] = useState<number | null>(null);

  const { 
    totalActive, 
    dailyActive, 
    monthlyActive, 
    inactiveCount,
    realIncome,
    realExpenses,
    realPayroll,
    realObligations,
    realNet,
    simulatedIncomeVisits,
    simulatedIncomePlans,
    totalSimulatedIncome,
    totalSimulatedExpenses,
    simulatedNet,
    priceDia,
    priceMes,
    convertedInactives
  } = useMemo(() => {
    // 1. Conteo de Clientes
    const activeMembers = members ? members.filter(m => m.status === 'active' || m.status === 'expiring') : [];
    const totalActive = activeMembers.length;
    
    // Separar visitas (diarios) de mensualidades/quincenas y calcular ingresos reales esperados
    let dailyActive = 0;
    let monthlyActive = 0;
    let actualPlansIncome = 0;
    let validPlanCount = 0;
    
    activeMembers.forEach(m => {
      const planObj = plans ? plans.find((p: any) => p.id === m.plan) : null;
      const pLow = (planObj?.name || m.plan || '').toLowerCase();
      if (pLow.includes('día') || pLow === 'dia' || pLow.includes('diario')) {
        dailyActive += 1;
      } else {
        monthlyActive += 1;
        if (planObj && planObj.price) {
          actualPlansIncome += Number(planObj.price);
          validPlanCount += 1;
        }
      }
    });

    const inactiveCount = members ? members.filter(m => (!m.visits || m.visits === 0) && m.status !== 'suspended').length : 0;
    
    // Simulación de conversión de inactivos
    const convertedInactives = Math.round(inactiveCount * (conversionRate / 100));

    // 2. Datos Reales
    const realIncome = transactions ? transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) : 0;
    const realExpenses = transactions ? transactions.filter(t => t.type === 'expense' && t.amount !== 70000).reduce((acc, t) => acc + t.amount, 0) : 0;
    
    const realPayroll = staff ? staff.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.salary || 0), 0) : 0;
    const realObligations = obligations ? obligations.filter(o => o.status === 'pending' && o.category !== 'payroll').reduce((acc, o) => acc + o.amount, 0) : 0;
    
    const realNet = realIncome - realExpenses - realPayroll - realObligations;

    // 3. Datos Simulados
    const priceDia = plansConfig?.dia || 5000;
    
    // El usuario quiere ver la multiplicación directa. Usaremos el plan mensual más básico o principal.
    // Si mes_basico es igual a 45000 y mes_pro fue modificado, a lo mejor querían usar mes_pro.
    // Pero como ya habilitamos mes_basico en Settings, leeremos mes_basico por defecto, y si no, mes_pro.
    let priceMes = plansConfig?.mes_basico;
    if (!priceMes) priceMes = plansConfig?.mes_pro || 45000;

    const simulatedIncomeVisits = dailyActive * priceDia * workingDays;
    const simulatedIncomePlans = (monthlyActive + convertedInactives) * priceMes;
    const totalSimulatedIncome = simulatedIncomeVisits + simulatedIncomePlans;

    const totalSimulatedExpenses = (simulatedPayroll ?? realPayroll) + (simulatedOtherExpenses ?? realObligations) + realExpenses;
    const simulatedNet = totalSimulatedIncome - totalSimulatedExpenses;

    return {
      totalActive,
      dailyActive,
      monthlyActive,
      inactiveCount,
      realIncome,
      realExpenses,
      realPayroll,
      realObligations,
      realNet,
      simulatedIncomeVisits,
      simulatedIncomePlans,
      totalSimulatedIncome,
      totalSimulatedExpenses,
      simulatedNet,
      priceDia,
      priceMes,
      convertedInactives
    };
  }, [members, transactions, staff, obligations, plans, plansConfig, workingDays, conversionRate, simulatedPayroll, simulatedOtherExpenses]);

  return (
    <div style={{ color: 'var(--text-main)' }}>
      {/* ─── HEADER ─── */}
      <div style={{ marginBottom: 24, background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: '#fff' }}>Contabilidad</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Resumen Ejecutivo</p>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Clientes Activos</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: '#00F0FF' }}>{totalActive} <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>({dailyActive} vis. + {monthlyActive} planes)</span></div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Clientes Inactivos</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: '#FFB300' }}>{inactiveCount}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Neto Real del Mes</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: realNet >= 0 ? '#00FF88' : '#FF4B4B' }}>
                ${realNet.toLocaleString('es-CO')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Neto Simulado</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: simulatedNet >= 0 ? '#00FF88' : '#FF4B4B' }}>
                ${simulatedNet.toLocaleString('es-CO')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MÓDULOS SEPARADOS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* 📍 MÓDULO REAL */}
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '2px solid rgba(0, 255, 136, 0.2)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00FF88' }}></div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: '#fff' }}>Módulo Real</h3>
            <span style={{ fontSize: 'var(--text-xs)', color: '#00FF88', marginLeft: 'auto' }}>Datos Contables Verdaderos</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Ingresos reales (entradas)</span>
              <span style={{ fontWeight: 600, color: '#00FF88' }}>${realIncome.toLocaleString('es-CO')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Gastos reales (salidas)</span>
              <span style={{ fontWeight: 600, color: '#FF4B4B' }}>-${realExpenses.toLocaleString('es-CO')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Nómina real pagada</span>
              <span style={{ fontWeight: 600, color: '#FF4B4B' }}>-${realPayroll.toLocaleString('es-CO')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Otros compromisos (servicios, etc)</span>
              <span style={{ fontWeight: 600, color: '#FF4B4B' }}>-${realObligations.toLocaleString('es-CO')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 'auto' }}>
              <span style={{ fontWeight: 700, color: '#fff' }}>Balance Real</span>
              <span style={{ fontWeight: 700, color: realNet >= 0 ? '#00FF88' : '#FF4B4B', fontSize: 'var(--text-lg)' }}>
                ${realNet.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>

        {/* 📍 MÓDULO SIMULADOR */}
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '2px solid rgba(0, 240, 255, 0.2)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Eye size={16} color="#00F0FF" />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: '#fff' }}>Módulo Simulador</h3>
            <span style={{ fontSize: 'var(--text-xs)', color: '#00F0FF', marginLeft: 'auto' }}>Proyecciones</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Simulación Día */}
            <div style={{ background: 'rgba(0, 240, 255, 0.02)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Simulación por DÍA (Visitas)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span>{dailyActive} clientes × ${priceDia.toLocaleString('es-CO')} × {workingDays}d</span>
                <span style={{ fontWeight: 600, color: '#00F0FF' }}>${simulatedIncomeVisits.toLocaleString('es-CO')}</span>
              </div>
            </div>

            {/* Simulación Mes */}
            <div style={{ background: 'rgba(0, 240, 255, 0.02)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Simulación por MES (Planes)</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span>{monthlyActive} clientes {convertedInactives > 0 ? `+ ${convertedInactives} proy. ` : ''}× ${priceMes.toLocaleString('es-CO')}</span>
                <span style={{ fontWeight: 600, color: '#00F0FF' }}>${simulatedIncomePlans.toLocaleString('es-CO')}</span>
              </div>
            </div>

            {/* Totales Simulación */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total ingresos simulados</span>
              <span style={{ fontWeight: 600, color: '#00FF88' }}>${totalSimulatedIncome.toLocaleString('es-CO')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total gastos proyectados</span>
              <span style={{ fontWeight: 600, color: '#FF4B4B' }}>-${totalSimulatedExpenses.toLocaleString('es-CO')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 'auto' }}>
              <span style={{ fontWeight: 700, color: '#fff' }}>Balance Simulado</span>
              <span style={{ fontWeight: 700, color: simulatedNet >= 0 ? '#00FF88' : '#FF4B4B', fontSize: 'var(--text-lg)' }}>
                ${simulatedNet.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CONTROLES DE SIMULACIÓN ─── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Settings size={16} color="var(--text-muted)" />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: '#fff' }}>Controles de Simulación (Modo Experto)</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {/* Días Hábiles */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Días hábiles (Visitas)</label>
            <input 
              type="number" 
              value={workingDays} 
              onChange={(e) => setWorkingDays(Number(e.target.value))}
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px', color: '#fff' }}
            />
          </div>

          {/* Conversión de Inactivos */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Conversión Inactivos → Activos (%)</label>
            <input 
              type="range" 
              min="0" max="100" 
              value={conversionRate} 
              onChange={(e) => setConversionRate(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'right' }}>{conversionRate}%</div>
          </div>

          {/* Nómina Simulada */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Modificar Nómina (Simulador)</label>
            <input 
              type="number" 
              placeholder={realPayroll.toString()}
              onChange={(e) => setSimulatedPayroll(e.target.value ? Number(e.target.value) : null)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px', color: '#fff' }}
            />
          </div>

          {/* Otros Gastos Simulados */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Modificar Compromisos (Simulador)</label>
            <input 
              type="number" 
              placeholder={realObligations.toString()}
              onChange={(e) => setSimulatedOtherExpenses(e.target.value ? Number(e.target.value) : null)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '8px', color: '#fff' }}
            />
          </div>
        </div>
      </div>

      {/* ─── VISUALIZACIÓN COMPARATIVA ─── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Calculator size={16} color="var(--text-muted)" />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: '#fff' }}>Comparativa: Real vs Simulado</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Barra Real */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
              <span>Balance Real</span>
              <span style={{ color: realNet >= 0 ? '#00FF88' : '#FF4B4B' }}>${realNet.toLocaleString('es-CO')}</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(Math.max(0, (realNet + 5000000) / 10000000 * 100), 100)}%`, 
                height: '100%', 
                background: realNet >= 0 ? '#00FF88' : '#FF4B4B',
                borderRadius: '6px'
              }}></div>
            </div>
          </div>

          {/* Barra Simulado */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
              <span>Balance Simulado (Proyección)</span>
              <span style={{ color: simulatedNet >= 0 ? '#00FF88' : '#FF4B4B' }}>${simulatedNet.toLocaleString('es-CO')}</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(Math.max(0, (simulatedNet + 5000000) / 10000000 * 100), 100)}%`, 
                height: '100%', 
                background: simulatedNet >= 0 ? '#00FF88' : '#FF4B4B',
                borderRadius: '6px'
              }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
