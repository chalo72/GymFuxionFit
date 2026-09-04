import { useGymData } from '../hooks/useGymData';

export default function Leaderboard() {
  const { members } = useGymData();
  const ranked = [...members].sort((a, b) => (b.visits || 0) - (a.visits || 0) || (b.streak || 0) - (a.streak || 0));
  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Ranking del gym</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Por visitas y racha reales.</p>
      <div className="glass-card" style={{ padding: 8 }}>
        {ranked.length === 0 && <p style={{ padding: 16 }}>Aún no hay miembros.</p>}
        {ranked.map((m, i) => (
          <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 100px', padding: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span>#{i + 1}</span>
            <span>{m.name}</span>
            <span>{m.visits || 0} visitas</span>
          </div>
        ))}
      </div>
    </div>
  );
}
