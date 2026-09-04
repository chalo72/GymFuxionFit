import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AiAssist } from '../components/AiAssist';
import { DISCIPLINAS, MAQUINAS, ZONAS } from '../data/pisoGym';
import { firstName } from '../lib/safeText';

export default function SalaCliente() {
  const { user } = useAuth();
  return (
    <div style={{ minHeight: '100vh', background: '#0C0F0C', color: '#fff', padding: 20, maxWidth: 560, margin: '0 auto', fontFamily: 'Space Grotesk, sans-serif' }}>
      <p style={{ fontSize: 11, letterSpacing: 1, color: '#00FF88', fontWeight: 800 }}>SALA DEL SOCIO · FUXION FIT</p>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: '8px 0 4px' }}>
        Hola{user?.name ? `, ${firstName(user.name)}` : ''}
      </h1>
      <p style={{ color: '#8A948A', marginBottom: 16, fontSize: 15, lineHeight: 1.5 }}>
        Viniste al gym por un objetivo (salud, físico, rendimiento). Escanea el QR de la máquina o de la zona. Hierro, funcional, HYROX y cardio: el piso te guía.
      </p>
      <AiAssist
        rol="socio"
        texto="Empieza por la zona de tu objetivo. Si estás perdido, pecho / pierna / WOD. Si hay mora, recepción te bloquea el ingreso: primero dejar la cuenta al día."
      />
      <h2 style={{ fontSize: 16, margin: '20px 0 10px' }}>Zonas</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {ZONAS.map((z) => (
          <Link key={z.id} to={`/piso/zona/${z.id}`} style={{ padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.04)', color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>
            <strong>{z.nombre}</strong>
            <div style={{ fontSize: 12, color: '#8A948A' }}>{z.detalle}</div>
          </Link>
        ))}
      </div>
      <h2 style={{ fontSize: 16, margin: '20px 0 10px' }}>Disciplinas</h2>
      {DISCIPLINAS.map((d) => (
        <Link key={d.id} to={`/piso/disciplina/${d.id}`} style={{ display: 'block', padding: 12, color: '#00FF88', textDecoration: 'none' }}>{d.label} — {d.para}</Link>
      ))}
      <h2 style={{ fontSize: 16, margin: '20px 0 10px' }}>Máquinas</h2>
      {MAQUINAS.map((m) => (
        <Link key={m.id} to={`/piso/maquina/${m.id}`} style={{ display: 'block', padding: '8px 0', color: '#ddd', textDecoration: 'none', fontSize: 14 }}>{m.nombre}</Link>
      ))}
      <p style={{ marginTop: 28, fontSize: 12, color: '#666' }}>Montería y Ciénaga de Oro · el único piso con QR por máquina y por zona.</p>
    </div>
  );
}
