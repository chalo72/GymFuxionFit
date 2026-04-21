import { useState } from 'react';
import { Trophy, Medal, Crown, TrendingUp, TrendingDown, Clock, Zap, Filter } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const divisions = ['Elite', 'Pro', 'Open', 'Femenino Elite', 'Femenino Pro'];

const leaderboardData = [
  { rank: 1, name: 'Alex Guerrero', division: 'Elite', time: '59:12', score: 9840, change: 0, streak: 12, points: 1200 },
  { rank: 2, name: 'Valentina Torres', division: 'Elite', time: '1:01:45', score: 9720, change: 2, streak: 8, points: 1150 },
  { rank: 3, name: 'Rodrigo Silva', division: 'Elite', time: '1:02:30', score: 9600, change: -1, streak: 6, points: 1100 },
  { rank: 4, name: 'Camila Restrepo', division: 'Elite', time: '1:04:18', score: 9480, change: 1, streak: 10, points: 1050 },
  { rank: 5, name: 'Diego Fernández', division: 'Pro', time: '1:06:42', score: 9350, change: 3, streak: 5, points: 980 },
  { rank: 6, name: 'Sofía Castillo', division: 'Pro', time: '1:08:15', score: 9200, change: -2, streak: 4, points: 920 },
  { rank: 7, name: 'Andrés Mejía', division: 'Pro', time: '1:09:30', score: 9050, change: 0, streak: 7, points: 875 },
  { rank: 8, name: 'María López', division: 'Pro', time: '1:11:05', score: 8900, change: 4, streak: 9, points: 830 },
  { rank: 9, name: 'Carlos Rivas', division: 'Open', time: '1:14:22', score: 8650, change: -1, streak: 3, points: 780 },
  { rank: 10, name: 'Lucía Martínez', division: 'Open', time: '1:16:48', score: 8400, change: 2, streak: 6, points: 740 },
];

const stationResults = [
  { station: 'SkiErg', avg: 3.2, best: 2.8 },
  { station: 'Sled Push', avg: 4.1, best: 3.5 },
  { station: 'Sled Pull', avg: 3.8, best: 3.2 },
  { station: 'Burpees', avg: 5.2, best: 4.6 },
  { station: 'Rowing', avg: 3.5, best: 3.0 },
  { station: 'Farmer', avg: 2.9, best: 2.4 },
  { station: 'Sandbag', avg: 4.8, best: 4.1 },
  { station: 'Wall Balls', avg: 3.1, best: 2.7 },
];

const medalColor = (rank: number) => {
  if (rank === 1) return '#FFD600';
  if (rank === 2) return '#B8C0B8';
  if (rank === 3) return '#FF6B35';
  return 'var(--text-muted)';
};

export default function Leaderboard() {
  const [activeDivision, setActiveDivision] = useState('Elite');
  const [activeView, setActiveView] = useState<'ranking' | 'stations' | 'history'>('ranking');

  const filtered = leaderboardData.filter(
    (m) => activeDivision === 'Todos' || m.division === activeDivision || activeDivision === 'Elite'
  );

  return (
    <div className="animate-fade-in">
      {/* ─── HEADER ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>
            HYROX Leaderboard <span style={{ color: '#FFD600', fontSize: '1rem', marginLeft: 8 }}>🏆 Elite Division</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Rankings en tiempo real · Temporada 2026 · Cinega de Oro
          </p>
        </div>
        <button className="btn btn-secondary"><Filter size={16} /> Filtrar</button>
      </div>

      {/* ─── TOP 3 PODIUM ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* 2do lugar */}
        <div
          className="glass-card animate-fade-in animate-delay-2"
          style={{ textAlign: 'center', borderColor: 'rgba(184,192,184,0.3)', padding: '24px 20px', alignSelf: 'flex-end' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🥈</div>
          <div className="member-avatar" style={{ margin: '0 auto 12px', width: 52, height: 52, fontSize: 'var(--text-lg)' }}>
            VT
          </div>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Valentina Torres</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 2 }}>Elite Division</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#B8C0B8', marginTop: 12 }}>
            1:01:45
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Tiempo final</div>
          <div style={{ marginTop: 10, fontSize: 'var(--text-sm)', fontWeight: 700, color: '#B8C0B8' }}>
            9,720 pts
          </div>
        </div>

        {/* 1er lugar */}
        <div
          className="glass-card animate-fade-in animate-delay-1"
          style={{
            textAlign: 'center',
            borderColor: 'rgba(255,214,0,0.4)',
            background: 'rgba(255,214,0,0.03)',
            padding: '32px 20px',
          }}
        >
          <Crown size={28} style={{ color: '#FFD600', margin: '0 auto 8px' }} />
          <div className="member-avatar" style={{ margin: '0 auto 12px', width: 60, height: 60, fontSize: 'var(--text-xl)', border: '2px solid #FFD600' }}>
            AG
          </div>
          <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)' }}>Alex Guerrero</div>
          <div style={{ color: '#FFD600', fontSize: 'var(--text-xs)', marginTop: 2, fontWeight: 600 }}>CAMPEÓN — Elite</div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: '#FFD600', marginTop: 12 }}>
            59:12
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Tiempo final</div>
          <div style={{ marginTop: 10, fontSize: 'var(--text-base)', fontWeight: 700, color: '#FFD600' }}>
            9,840 pts
          </div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Zap size={12} style={{ color: 'var(--energy-orange)' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--energy-orange)', fontWeight: 600 }}>Racha 12 semanas</span>
          </div>
        </div>

        {/* 3er lugar */}
        <div
          className="glass-card animate-fade-in animate-delay-3"
          style={{ textAlign: 'center', borderColor: 'rgba(255,107,53,0.3)', background: 'rgba(255,107,53,0.02)', padding: '24px 20px', alignSelf: 'flex-end' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🥉</div>
          <div className="member-avatar" style={{ margin: '0 auto 12px', width: 52, height: 52, fontSize: 'var(--text-lg)' }}>
            RS
          </div>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Rodrigo Silva</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 2 }}>Elite Division</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: '#FF6B35', marginTop: 12 }}>
            1:02:30
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Tiempo final</div>
          <div style={{ marginTop: 10, fontSize: 'var(--text-sm)', fontWeight: 700, color: '#FF6B35' }}>
            9,600 pts
          </div>
        </div>
      </div>

      {/* ─── DIVISION TABS ─── */}
      <div className="chart-tabs" style={{ marginBottom: 16, width: 'fit-content' }}>
        {divisions.map((d) => (
          <button
            key={d}
            className={`chart-tab ${activeDivision === d ? 'active' : ''}`}
            onClick={() => setActiveDivision(d)}
          >
            {d}
          </button>
        ))}
      </div>

      {/* ─── VIEW TABS ─── */}
      <div className="chart-tabs" style={{ marginBottom: 20, width: 'fit-content' }}>
        {(['ranking', 'stations', 'history'] as const).map((v) => (
          <button
            key={v}
            className={`chart-tab ${activeView === v ? 'active' : ''}`}
            onClick={() => setActiveView(v)}
          >
            {v === 'ranking' ? 'Ranking' : v === 'stations' ? 'Por Estación' : 'Historial'}
          </button>
        ))}
      </div>

      {activeView === 'ranking' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Pos.</th>
                <th>Atleta</th>
                <th>División</th>
                <th>Tiempo</th>
                <th>Puntos</th>
                <th>Cambio</th>
                <th>Racha</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((m) => (
                <tr key={m.rank}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {m.rank <= 3 ? (
                        <Medal size={20} style={{ color: medalColor(m.rank) }} />
                      ) : (
                        <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 'var(--text-lg)' }}>
                          {m.rank}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="member-cell">
                      <div className="member-avatar">
                        {m.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontWeight: 600 }}>{m.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 'var(--text-xs)', fontWeight: 600,
                      padding: '3px 8px', borderRadius: 'var(--radius-full)',
                      background: m.division === 'Elite' ? 'rgba(255,214,0,0.1)' : 'var(--green-10)',
                      color: m.division === 'Elite' ? '#FFD600' : 'var(--neon-green)',
                    }}>
                      {m.division}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                      {m.time}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--neon-green)' }}>
                      {m.points.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    {m.change === 0 ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>—</span>
                    ) : m.change > 0 ? (
                      <span style={{ color: 'var(--success-green)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                        <TrendingUp size={12} /> +{m.change}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--danger-red)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                        <TrendingDown size={12} /> {m.change}
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ color: 'var(--energy-orange)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                      🔥 {m.streak}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeView === 'stations' && (
        <div className="glass-card">
          <div className="glass-card-header">
            <div>
              <div className="glass-card-title">Rendimiento por Estación HYROX</div>
              <div className="glass-card-subtitle">Tiempo promedio vs mejor tiempo (minutos)</div>
            </div>
          </div>
          <div className="chart-container" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stationResults} barGap={6} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="station" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.38)', fontSize: 11 }} tickFormatter={(v) => `${v} min`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(14,18,14,0.95)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number, name: string) => [`${v} min`, name === 'avg' ? 'Promedio' : 'Mejor Tiempo']}
                />
                <Bar dataKey="avg" name="avg" fill="#FF6B35" radius={[4, 4, 0, 0]} opacity={0.7} />
                <Bar dataKey="best" name="best" fill="#00FF88" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: '#FF6B35', display: 'inline-block' }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Promedio del Gym</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: '#00FF88', display: 'inline-block' }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Mejor Marca Personal</span>
            </div>
          </div>
        </div>
      )}

      {activeView === 'history' && (
        <div className="glass-card">
          <div className="glass-card-title" style={{ marginBottom: 20 }}>Historial de Competencias</div>
          {[
            { date: 'Abr 2026', event: 'HYROX Cinega Oro — Temporada 3', winner: 'Alex Guerrero', time: '59:12' },
            { date: 'Mar 2026', event: 'HYROX Cinega Oro — Temporada 2', winner: 'Rodrigo Silva', time: '1:01:30' },
            { date: 'Feb 2026', event: 'HYROX Cinega Oro — Temporada 1', winner: 'Valentina Torres', time: '1:03:45' },
            { date: 'Ene 2026', event: 'HYROX Open Challenge', winner: 'Alex Guerrero', time: '1:05:20' },
          ].map((event, i) => (
            <div key={i} className="stat-row">
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{event.event}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{event.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>🥇 {event.winner}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neon-green)', marginTop: 2 }}>{event.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
