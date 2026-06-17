import React, { useRef } from 'react';
import { User } from 'lucide-react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

function Badge3D({ a }: { a: any }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      className="premium-card-hover"
    >
      <div style={{
        padding: 24, 
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01))',
        borderRadius: 24, 
        display:'flex', 
        alignItems:'center', 
        gap: 16, 
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden',
        transform: 'translateZ(0px)'
      }}>
        {/* Reflejo Holográfico Animado */}
        <motion.div
           style={{
             position: 'absolute',
             inset: '-50%',
             background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
             x: useTransform(mouseXSpring, [-0.5, 0.5], ['-50%', '50%']),
             y: useTransform(mouseYSpring, [-0.5, 0.5], ['-50%', '50%']),
             pointerEvents: 'none',
             opacity: 0.6
           }}
        />
        <div style={{ fontSize: 40, transform: 'translateZ(40px)', textShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>{a.i}</div>
        <div style={{ transform: 'translateZ(30px)' }}>
           <div style={{ fontSize: 16, fontWeight: 950, color: '#fff', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>{a.t}</div>
           <div style={{ fontSize: 12, color: 'var(--neon-green)', fontWeight: 800, textShadow: '0 2px 5px rgba(0,255,136,0.3)' }}>{a.d}</div>
        </div>
      </div>
    </motion.div>
  );
}

export function PanelProfile({ user }: { user: any }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, height: '100%', animation: 'slideIn 0.5s ease-out' }}>
       <div className="glass-card" style={{ padding: 40, textAlign: 'center', borderRadius: 32 }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', border: '3px solid var(--neon-green)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,255,136,0.05)', overflow: 'hidden' }}>
             {user?.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={60} style={{ color: 'var(--neon-green)' }} />}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 950, color: '#fff' }}>{user?.name?.toUpperCase() || 'ATLETA_FUXION'}</h2>
          <div style={{ marginTop: 12, padding: '6px 12px', background: 'rgba(0,255,136,0.1)', borderRadius: 'var(--radius-full)', display: 'inline-block', fontSize: 10, fontWeight: 950, color: 'var(--neon-green)', letterSpacing: 2 }}>
             {user?.status?.toUpperCase() || 'ACTIVO'}
          </div>
       </div>
       <div className="glass-card" style={{ padding: 32, borderRadius: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 950, color: '#fff', marginBottom: 24 }}>Mis Logros</h3>
          <div style={{ display:'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
             {[ { t: 'CONSTANCIA PURA', d: '30 días seguidos', i: '🔥' }, { t: 'FUERZA BRUTA', d: 'Récord en Squat', i: '🏋️' }, { t: 'MADRUGADOR', d: '5AM Club', i: '☀️' }, { t: 'CLIENTE ELITE', d: 'Membresía Pro', i: '💎' } ].map((a, i) => (
               <Badge3D key={i} a={a} />
             ))}
          </div>
       </div>
    </div>
  );
}
