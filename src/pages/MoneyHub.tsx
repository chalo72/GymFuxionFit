import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Banknote, Scale, Wallet, HandCoins, Archive, Users,
  ClipboardCheck, Package, BookOpen, BadgeDollarSign, Receipt,
} from 'lucide-react';
import Finances from './Finances';
import Accounting from './Accounting';
import { AsistenciaPersonal, CajaHoy, CuadreCaja, CuadresPasados, ListaCreditos, ListaPrestamos, VentasInventario } from './finanzas/PanelesCaja';

type Vista =
  | 'inicio'
  | 'caja'
  | 'cuadre'
  | 'pasados'
  | 'boveda'
  | 'creditos'
  | 'prestamos'
  | 'asistencia'
  | 'ventas'
  | 'cobros'
  | 'gastos'
  | 'nomina'
  | 'libros';

type Trabajo = { id: Vista | 'puerta'; titulo: string; icon: typeof Banknote };

const HOY: Trabajo[] = [
  { id: 'puerta', titulo: 'Cobrar a un cliente', icon: Receipt },
  { id: 'caja', titulo: 'Abrir la caja', icon: Banknote },
  { id: 'cuadre', titulo: 'Cerrar la caja', icon: Scale },
  { id: 'gastos', titulo: 'Gastos de hoy', icon: Wallet },
  { id: 'ventas', titulo: 'Ventas', icon: Package },
  { id: 'creditos', titulo: 'Créditos', icon: HandCoins },
];

const MAS: Trabajo[] = [
  { id: 'cobros', titulo: 'Otro ingreso', icon: BadgeDollarSign },
  { id: 'pasados', titulo: 'Turnos cerrados', icon: Archive },
  { id: 'nomina', titulo: 'Nómina', icon: Users },
  { id: 'prestamos', titulo: 'Préstamos', icon: Users },
  { id: 'asistencia', titulo: 'Asistencia', icon: ClipboardCheck },
  { id: 'boveda', titulo: 'Bóveda', icon: Archive },
  { id: 'libros', titulo: 'Libros', icon: BookOpen },
];

const VISTAS: Vista[] = ['caja', 'cuadre', 'pasados', 'boveda', 'creditos', 'prestamos', 'asistencia', 'ventas', 'cobros', 'gastos', 'nomina', 'libros'];

const TITULO: Record<Vista, string> = {
  inicio: 'Dinero',
  caja: 'Abrir la caja',
  cuadre: 'Cerrar la caja',
  pasados: 'Turnos cerrados',
  boveda: 'Bóveda',
  creditos: 'Créditos',
  prestamos: 'Préstamos',
  asistencia: 'Asistencia',
  ventas: 'Ventas',
  cobros: 'Otro ingreso',
  gastos: 'Gastos de hoy',
  nomina: 'Nómina',
  libros: 'Libros',
};

function vistaDeUrl(tab: string | null): Vista {
  if (!tab) return 'inicio';
  if (tab === 'personal' || tab === 'nomina') return 'nomina';
  if (tab === 'expense') return 'gastos';
  return VISTAS.includes(tab as Vista) ? (tab as Vista) : 'inicio';
}

export default function MoneyHub() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const vista = vistaDeUrl(params.get('tab'));
  const [busca, setBusca] = useState('');
  const [nominaModo, setNominaModo] = useState<'payroll' | 'expense'>('payroll');
  const [bovedaModo, setBovedaModo] = useState<'goals' | 'agua'>('goals');
  const q = busca.trim().toLowerCase();

  const ir = (id: Trabajo['id']) => {
    if (id === 'puerta') {
      navigate('/reception');
      return;
    }
    setParams(id === 'inicio' ? {} : { tab: id === 'nomina' ? 'personal' : id }, { replace: true });
  };

  const lista = [...HOY, ...MAS].filter((t) => !q || t.titulo.toLowerCase().includes(q));

  return (
    <div className="finanzas-hub">
      {vista === 'inicio' ? (
        <>
          <h2>Dinero</h2>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar" aria-label="Buscar en dinero" />
          <div className="fin-grid">
            {lista.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} type="button" className="fin-trabajo" onClick={() => ir(t.id)}>
                  <Icon size={28} />
                  <strong>{t.titulo}</strong>
                </button>
              );
            })}
          </div>
          {lista.length === 0 && <p>No hay nada con ese nombre.</p>}
        </>
      ) : (
        <>
          <button type="button" className="fin-volver" onClick={() => ir('inicio')}>
            <ArrowLeft size={18} /> Dinero
          </button>
          <h2>{TITULO[vista]}</h2>
          <div className="fin-cuerpo">
            {vista === 'caja' && <CajaHoy onCuadre={() => ir('cuadre')} />}
            {vista === 'cuadre' && <CuadreCaja />}
            {vista === 'pasados' && <CuadresPasados />}
            {vista === 'creditos' && <ListaCreditos />}
            {vista === 'prestamos' && <ListaPrestamos />}
            {vista === 'asistencia' && <AsistenciaPersonal />}
            {vista === 'ventas' && <VentasInventario />}
            {vista === 'cobros' && <Finances vista="income" />}
            {vista === 'gastos' && <Finances vista="expense" />}
            {vista === 'libros' && <Accounting />}
            {vista === 'boveda' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className={bovedaModo === 'goals' ? 'fin-pill on' : 'fin-pill'} onClick={() => setBovedaModo('goals')}>Ahorros</button>
                  <button type="button" className={bovedaModo === 'agua' ? 'fin-pill on' : 'fin-pill'} onClick={() => setBovedaModo('agua')}>Agua</button>
                </div>
                <Finances vista={bovedaModo} />
              </div>
            )}
            {vista === 'nomina' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className={nominaModo === 'payroll' ? 'fin-pill on' : 'fin-pill'} onClick={() => setNominaModo('payroll')}>Nómina</button>
                  <button type="button" className={nominaModo === 'expense' ? 'fin-pill on' : 'fin-pill'} onClick={() => setNominaModo('expense')}>Gastos fijos</button>
                </div>
                <Finances vista={nominaModo} />
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        .finanzas-hub { display: flex; flex-direction: column; gap: 14px; min-height: 0; color: #fff; }
        .finanzas-hub h2 { margin: 0; font-size: 34px; font-weight: 900; }
        .finanzas-hub > input {
          width: 100%; min-height: 58px; border-radius: 12px; border: 2px dashed rgba(197,209,204,.7);
          background: #070b08; color: #fff; padding: 12px 14px; font-size: 20px;
        }
        .fin-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .fin-trabajo {
          display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-end; gap: 16px;
          min-height: 148px; padding: 18px; border: 2px solid #C8F542; border-radius: 12px; cursor: pointer;
          background: #0e140f; color: #fff; text-align: left;
        }
        .fin-trabajo svg { color: #C8F542; }
        .fin-trabajo strong { font-size: 22px; line-height: 1.15; }
        .fin-volver {
          display: inline-flex; align-items: center; gap: 8px; width: fit-content;
          min-height: 44px; padding: 0 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,.12);
          background: transparent; color: #fff; font-weight: 800; cursor: pointer;
        }
        .fin-pill {
          display: inline-flex; align-items: center; gap: 8px;
          min-height: 52px; padding: 12px 16px; border-radius: 12px; cursor: pointer;
          background: rgba(255,255,255,0.03); border: 2px solid rgba(200,245,66,.45);
          color: #ddd; font-weight: 800; font-size: 17px;
        }
        .fin-pill.on { border-color: #C8F542; color: #111; background: #C8F542; }
        .fin-cuerpo { min-height: 0; }
        @media (min-width: 900px) {
          .fin-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
      `}</style>
    </div>
  );
}
