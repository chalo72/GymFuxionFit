export function AiAssist({ rol, texto }: { rol: string; texto: string }) {
  return (
    <div className="glass-card" style={{ padding: 14, border: '1px solid rgba(0,255,136,0.2)', marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: 'var(--neon-green)' }}>GUÍA IA · {rol.toUpperCase()}</div>
      <p style={{ fontSize: 13, margin: '6px 0 0', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{texto}</p>
    </div>
  );
}
