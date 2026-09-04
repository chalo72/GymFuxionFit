import { Link } from 'react-router-dom';
import { AiAssist } from '../components/AiAssist';
import { DISCIPLINAS, ZONAS } from '../data/pisoGym';

export default function TrainingDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 8, color: '#fff' }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Tu entrenamiento</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5 }}>
          Fuxion Fit Montería / Ciénaga de Oro. Elige zona o disciplina. En el gym, el QR de la pared abre lo mismo.
        </p>
      </div>
      <AiAssist
        rol="socio"
        texto="Si vienes por físico: zona muscular + 1 cardio corto. Si vienes por WOD: disciplina funcional. Si vienes por HYROX: sled, farmer y remo. No mezcles todo el mismo día la primera semana."
      />
      <h2 style={{ fontSize: 16 }}>Zonas</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {ZONAS.map((z) => (
          <Link key={z.id} to={`/piso/zona/${z.id}`} className="glass-card" style={{ padding: 16, textDecoration: 'none', color: 'inherit' }}>
            <strong>{z.nombre}</strong>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{z.detalle}</div>
          </Link>
        ))}
      </div>
      <h2 style={{ fontSize: 16 }}>Disciplinas</h2>
      {DISCIPLINAS.map((d) => (
        <Link key={d.id} to={`/piso/disciplina/${d.id}`} style={{ color: 'var(--neon-green)', padding: '8px 0' }}>
          {d.label} — {d.para}
        </Link>
      ))}
    </div>
  );
}
