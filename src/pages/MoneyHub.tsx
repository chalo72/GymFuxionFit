import { useSearchParams } from 'react-router-dom';
import Finances from './Finances';
import Payments from './Payments';
import Accounting from './Accounting';
import { AiAssist } from '../components/AiAssist';

const TABS = [
  { id: 'caja', label: 'Caja y flujo' },
  { id: 'cobros', label: 'Cobros' },
  { id: 'libros', label: 'Libros' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function MoneyHub() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab: TabId = raw === 'cobros' || raw === 'libros' ? raw : 'caja';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <AiAssist
        rol="finanzas"
        texto="Caja del día primero. Mora es dinero que ya trabajaste y no cobraste: ve a Cobros y a Avisos. Libros no se inventan: cada venta de recepción debe aparecer aquí."
      />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`chart-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setParams(t.id === 'caja' ? {} : { tab: t.id })}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {tab === 'caja' && <Finances />}
        {tab === 'cobros' && <Payments />}
        {tab === 'libros' && <Accounting />}
      </div>
    </div>
  );
}
