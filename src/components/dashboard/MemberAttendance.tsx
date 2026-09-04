import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useGymData } from '../../hooks/useGymData';

export default function MemberAttendance() {
  const { members } = useGymData();
  const today = new Date().toISOString().slice(0, 10);

  const { visited, rest, total } = useMemo(() => {
    const visited = members.filter((m) => m.lastVisit && String(m.lastVisit).startsWith(today)).length;
    const total = members.length;
    return { visited, rest: Math.max(0, total - visited), total };
  }, [members, today]);

  const data = [
    { name: 'Visitaron hoy', value: visited, color: '#00F0FF' },
    { name: 'Sin visita hoy', value: rest || 1, color: '#1C1C28' },
  ];

  return (
    <div className="glass-card">
      <div className="glass-card-header">
        <div>
          <div className="glass-card-title">Asistencia de hoy</div>
          <div className="glass-card-subtitle">Según última visita registrada</div>
        </div>
      </div>
      {total === 0 ? (
        <p style={{ color: 'var(--text-muted)', padding: 16 }}>Sin miembros.</p>
      ) : (
        <>
          <div style={{ height: 180 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius={50} outerRadius={80}>
                  {data.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p style={{ textAlign: 'center', fontWeight: 800 }}>{visited} / {total} vinieron hoy</p>
        </>
      )}
    </div>
  );
}
