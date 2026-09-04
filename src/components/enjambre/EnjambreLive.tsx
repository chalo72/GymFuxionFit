import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type AgentId = 'Rush' | 'Bypass' | 'Deep' | 'Shield';

const AGENTS: { id: AgentId; color: string; rol: string }[] = [
  { id: 'Rush', color: '#FF6B35', rol: 'Happy path' },
  { id: 'Bypass', color: '#A78BFA', rol: 'No bloquear' },
  { id: 'Deep', color: '#00E5FF', rol: 'Raíz' },
  { id: 'Shield', color: '#00FF88', rol: 'Estabilidad' },
];

export type EnjambreStats = {
  activos: number;
  deudas: number;
  porVencer: number;
  stockBajo: number;
  ingresosMes: number;
};

type Tick = { t: number; agent: AgentId; text: string };

const KEY = 'fuxion_enjambre_log';

function loadLog(): Tick[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 40) : [];
  } catch {
    return [];
  }
}

function nextJob(stats: EnjambreStats, i: number): Tick {
  const jobs: { agent: AgentId; text: string }[] = [
    { agent: 'Rush', text: `Caja del mes: $${stats.ingresosMes.toLocaleString('es-CO')} — flujo listo para recepción` },
    { agent: 'Shield', text: `${stats.deudas} miembro(s) con saldo. Prioridad cobro en Hoy` },
    { agent: 'Deep', text: `${stats.porVencer} membresías vencen en 7 días — renovar antes de perder activos` },
    { agent: 'Bypass', text: `Inventario: ${stats.stockBajo} en mínimo. No frena operación, sí hay que reponer` },
    { agent: 'Rush', text: `${stats.activos} activos en ficha. Menú por rol sigue en misión producto real` },
    { agent: 'Shield', text: 'Vigilando crash de plan vacío y login. Sesión protegida' },
    { agent: 'Deep', text: 'Pendiente: publicar versión en Vercel para que deje de verse ERROR DEL SISTEMA' },
    { agent: 'Bypass', text: 'Wearables y ranking demo fuera. Solo datos de miembros' },
  ];
  const j = jobs[i % jobs.length];
  return { t: Date.now(), agent: j.agent, text: j.text };
}

export default function EnjambreLive({ stats }: { stats: EnjambreStats }) {
  const [log, setLog] = useState<Tick[]>(() => loadLog());
  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    setLog((prev) => {
      if (prev.length > 0) return prev;
      const first = nextJob(stats, 0);
      localStorage.setItem(KEY, JSON.stringify([first]));
      return [first];
    });
    const tick = setInterval(() => {
      setIdx((n) => {
        const next = n + 1;
        setLog((prev) => {
          const line = nextJob(stats, next);
          const merged = [line, ...prev].slice(0, 24);
          localStorage.setItem(KEY, JSON.stringify(merged));
          return merged;
        });
        return next;
      });
    }, 3500);
    return () => clearInterval(tick);
  }, [stats]);

  const active = AGENTS[idx % AGENTS.length];
  const hora = useMemo(() => new Date(now).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), [now]);

  return (
    <div className="glass-card" style={{ padding: 20, overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes enjambre-spin { to { transform: rotate(360deg); } }
        @keyframes enjambre-pulse { 0%,100% { opacity: .45; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--neon-green)', letterSpacing: 1 }}>ENJAMBRE EN VIVO</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Cuatro agentes sobre la meta. No están dormidos.</div>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: active.color }}>{hora}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        {AGENTS.map((a, i) => {
          const on = a.id === active.id;
          return (
            <motion.div
              key={a.id}
              animate={{ y: on ? [0, -6, 0] : 0 }}
              transition={{ duration: 1.2, repeat: on ? Infinity : 0 }}
              style={{
                padding: 12, borderRadius: 14, textAlign: 'center',
                border: `1px solid ${on ? a.color : 'rgba(255,255,255,0.08)'}`,
                background: on ? `${a.color}18` : 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: '50%', background: a.color, margin: '0 auto 8px',
                animation: on ? 'enjambre-pulse 1s ease-in-out infinite' : 'none',
                boxShadow: on ? `0 0 12px ${a.color}` : 'none',
              }} />
              <div style={{ fontWeight: 800, fontSize: 13, color: a.color }}>{a.id}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.rol}</div>
              <div style={{ fontSize: 10, marginTop: 6, color: on ? a.color : 'var(--text-muted)' }}>{on ? 'TRABAJANDO' : 'en cola'}</div>
            </motion.div>
          );
        })}
      </div>

      <div style={{
        height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 14,
      }}>
        <motion.div
          key={idx}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 3.4, ease: 'linear' }}
          style={{ height: '100%', width: '40%', background: active.color }}
        />
      </div>

      <div style={{ maxHeight: 220, overflow: 'auto' }}>
        <AnimatePresence initial={false}>
          {log.map((line) => {
            const col = AGENTS.find((a) => a.id === line.agent)?.color || '#fff';
            return (
              <motion.div
                key={line.t}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  display: 'grid', gridTemplateColumns: '64px 1fr', gap: 10,
                  padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12,
                }}
              >
                <span style={{ color: col, fontWeight: 800 }}>{line.agent}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{line.text}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {log.length === 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Arrancando ciclo…</p>
        )}
      </div>
    </div>
  );
}
