import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useGymData } from '../../hooks/useGymData';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function RevenueOverview() {
  const { transactions } = useGymData();
  const year = new Date().getFullYear();

  const { chart, monthTotal, yearTotal } = useMemo(() => {
    const byMonth = Array(12).fill(0);
    let yearTotal = 0;
    for (const t of transactions) {
      if (t.type !== 'income' || !t.date) continue;
      const d = new Date(t.date);
      if (d.getFullYear() !== year) continue;
      byMonth[d.getMonth()] += t.amount || 0;
      yearTotal += t.amount || 0;
    }
    const chart = MESES.map((month, i) => ({ month, income: byMonth[i] }));
    return { chart, monthTotal: byMonth[new Date().getMonth()], yearTotal };
  }, [transactions, year]);

  return (
    <div className="glass-card">
      <div className="glass-card-header">
        <div>
          <div className="glass-card-title">Ingresos reales</div>
          <div className="glass-card-subtitle">Transacciones de tipo ingreso · {year}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>
            ${monthTotal.toLocaleString('es-CO')}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>este mes</div>
        </div>
      </div>
      <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
        Acumulado {year}: ${yearTotal.toLocaleString('es-CO')}
      </div>
      <div className="chart-container" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} />
            <Tooltip
              formatter={(v: number) => `$${Number(v).toLocaleString('es-CO')}`}
              contentStyle={{ background: '#111', border: '1px solid #333' }}
            />
            <Bar dataKey="income" name="Ingresos" fill="#00FF88" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
