import { AiAssist } from '../components/AiAssist';
import { DISCIPLINAS, MAQUINAS, ZONAS, qrPisoUrl } from '../data/pisoGym';

function QrCard({ label, url }: { label: string; url: string }) {
  return (
    <div className="glass-card" style={{ padding: 14, textAlign: 'center' }}>
      <img alt={label} width={120} height={120} src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`} style={{ background: '#fff', borderRadius: 8 }} />
      <div style={{ fontWeight: 800, fontSize: 13, marginTop: 8 }}>{label}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{url}</div>
    </div>
  );
}

export default function PisoHub() {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gym-fuxion-fit-82ka.vercel.app';
  return (
    <div className="animate-fade-in" style={{ paddingBottom: 40 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800 }}>Piso QR · imprimir y pegar</h2>
      <p style={{ color: 'var(--text-muted)', margin: '8px 0 16px', fontSize: 14 }}>
        Montería y Ciénaga de Oro: cada máquina y cada zona (pecho, WOD, HYROX) con su código. El socio escanea sin pedir turno.
      </p>
      <AiAssist rol="entrenador / gerencia" texto="Imprime estos QR a tamaño de tarjeta. Un código por máquina y uno por zona muscular. Así el socio no se pierde y tú no repites la misma explicación 20 veces." />
      <h3 style={{ margin: '20px 0 10px' }}>Máquinas</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {MAQUINAS.map((m) => <QrCard key={m.id} label={m.nombre} url={qrPisoUrl(origin, 'maquina', m.id)} />)}
      </div>
      <h3 style={{ margin: '20px 0 10px' }}>Zonas (pecho alto/bajo, etc.)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {ZONAS.map((z) => <QrCard key={z.id} label={z.nombre} url={qrPisoUrl(origin, 'zona', z.id)} />)}
      </div>
      <h3 style={{ margin: '20px 0 10px' }}>Disciplinas</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {DISCIPLINAS.map((d) => <QrCard key={d.id} label={d.label} url={qrPisoUrl(origin, 'disciplina', d.id)} />)}
      </div>
    </div>
  );
}
