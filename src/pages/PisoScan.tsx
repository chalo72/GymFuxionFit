import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  DISCIPLINAS, EJERCICIOS, MAQUINAS, ZONAS,
  ejerciciosDeDisciplina, ejerciciosDeMaquina, ejerciciosDeZona,
  type Disciplina,
} from '../data/pisoGym';
import { AiAssist } from '../components/AiAssist';

export default function PisoScan() {
  const { tipo, id } = useParams();
  const data = useMemo(() => {
    if (tipo === 'maquina') {
      const m = MAQUINAS.find((x) => x.id === id);
      return { titulo: m?.nombre || 'Máquina', sub: m?.sede, lista: ejerciciosDeMaquina(id || ''), ia: 'Esta máquina: elige 1–2 variantes. Técnica antes que carga. Fuxion Fit Montería / Ciénaga de Oro.' };
    }
    if (tipo === 'zona') {
      const z = ZONAS.find((x) => x.id === id);
      return { titulo: z?.nombre || 'Zona', sub: z?.detalle, lista: ejerciciosDeZona(id || ''), ia: 'Zona muscular: alto, medio y bajo si aplica. No hagas solo lo que se ve en el espejo.' };
    }
    const d = DISCIPLINAS.find((x) => x.id === id);
    return { titulo: d?.label || 'Disciplina', sub: d?.para, lista: ejerciciosDeDisciplina((id || 'hierro') as Disciplina), ia: 'No es solo hierro: funcional, HYROX y cardio también cuentan para tu objetivo.' };
  }, [tipo, id]);

  return (
    <div style={{ minHeight: '100vh', background: '#0C0F0C', color: '#fff', padding: 20, fontFamily: 'Space Grotesk, sans-serif' }}>
      <p style={{ fontSize: 11, letterSpacing: 1, color: '#00FF88', fontWeight: 800 }}>FUXION FIT · MONTERÍA / CIÉNAGA DE ORO</p>
      <h1 style={{ fontSize: 26, fontWeight: 800, margin: '8px 0' }}>{data.titulo}</h1>
      {data.sub && <p style={{ color: '#8A948A', marginBottom: 16 }}>{data.sub}</p>}
      <AiAssist rol="piso" texto={data.ia} />
      {data.lista.length === 0 && <p>No hay ejercicios ligados a este código. Pide al entrenador que lo revise.</p>}
      {data.lista.map((e) => (
        <div key={e.id} className="glass-card" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: '#00E5FF' }}>{e.disciplina} · {e.variante}</div>
          <h2 style={{ fontSize: 18, margin: '4px 0 8px' }}>{e.nombre}</h2>
          <ol style={{ paddingLeft: 18, color: '#c8c8c8', fontSize: 14, lineHeight: 1.5 }}>
            {e.como.map((c) => <li key={c}>{c}</li>)}
          </ol>
          <p style={{ fontSize: 13, color: '#00FF88', marginTop: 8 }}>{e.ia}</p>
        </div>
      ))}
      <Link to="/sala" style={{ color: '#00FF88', fontSize: 14 }}>Ir a la sala del socio</Link>
      {EJERCICIOS.length > 0 && tipo !== 'disciplina' && (
        <p style={{ marginTop: 24, fontSize: 12, color: '#666' }}>Códigos de pared: /piso/maquina/… /piso/zona/pecho /piso/disciplina/funcional</p>
      )}
    </div>
  );
}
