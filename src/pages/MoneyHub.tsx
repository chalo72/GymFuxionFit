import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Banknote, Scale, Wallet, HandCoins, Archive, Users, ClipboardCheck, Package, BookOpen, BadgeDollarSign } from 'lucide-react';
import Finances from './Finances';
import Accounting from './Accounting';
import { AiAssist } from '../components/AiAssist';
import { AsistenciaPersonal, CajaHoy, CuadreCaja, CuadresPasados, ListaCreditos, ListaPrestamos, VentasInventario } from './finanzas/PanelesCaja';

type Vista =
  | 'caja'
  | 'cuadre'
  | 'pasados'
  | 'boveda'
  | 'creditos'
  | 'prestamos'
  | 'asistencia'
  | 'ventas'
  | 'cobros'
  | 'nomina'
  | 'libros';

const ATAJOS: { id: Vista; label: string; hint: string; icon: typeof Banknote }[] = [
  { id: 'caja', label: 'Caja principal', hint: 'Lo que entró y salió hoy', icon: Banknote },
  { id: 'cuadre', label: 'Cuadre de caja', hint: 'Contar efectivo y cerrar', icon: Scale },
  { id: 'creditos', label: 'Créditos', hint: 'Lo que los socios deben', icon: HandCoins },
  { id: 'cobros', label: 'Cobros', hint: 'Registrar un pago', icon: Wallet },
];

const RESTO: { id: Vista; label: string; icon: typeof Banknote }[] = [
  { id: 'pasados', label: 'Cuadres del pasado', icon: Archive },
  { id: 'boveda', label: 'Bóveda', icon: Archive },
  { id: 'prestamos', label: 'Préstamos del personal', icon: Users },
  { id: 'asistencia', label: 'Asistencia del personal', icon: ClipboardCheck },
  { id: 'ventas', label: 'Ventas e inventario', icon: Package },
  { id: 'nomina', label: 'Nómina y gastos', icon: BadgeDollarSign },
  { id: 'libros', label: 'Libros', icon: BookOpen },
];

export default function MoneyHub() {
  const [params] = useSearchParams();
  const desdeUrl = params.get('tab');
  const inicial: Vista = desdeUrl === 'cobros' || desdeUrl === 'libros' ? desdeUrl : 'caja';
  const [vista, setVista] = useState<Vista>(inicial);
  const [nominaModo, setNominaModo] = useState<'payroll' | 'expense'>('payroll');
  const [bovedaModo, setBovedaModo] = useState<'goals' | 'agua'>('goals');

  return (
    <div className="finanzas-hub">
      <AiAssist
        rol="finanzas"
        texto="Empieza por Caja o Cuadre. El efectivo del cajón y Nequi van separados. Créditos es lo que deben; Cobros es cuando pagan. Nómina descuenta préstamos del personal."
      />

      <div className="fin-atajos">
        {ATAJOS.map((t) => {
          const Icon = t.icon;
          const on = vista === t.id;
          return (
            <button key={t.id} type="button" className={on ? 'fin-atajo on' : 'fin-atajo'} onClick={() => setVista(t.id)}>
              <Icon size={22} />
              <span>
                <strong>{t.label}</strong>
                <small>{t.hint}</small>
              </span>
            </button>
          );
        })}
      </div>

      <div className="fin-resto">
        {RESTO.map((t) => {
          const Icon = t.icon;
          const on = vista === t.id;
          return (
            <button key={t.id} type="button" className={on ? 'fin-pill on' : 'fin-pill'} onClick={() => setVista(t.id)}>
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="fin-cuerpo">
        {vista === 'caja' && <CajaHoy />}
        {vista === 'cuadre' && <CuadreCaja />}
        {vista === 'pasados' && <CuadresPasados />}
        {vista === 'creditos' && <ListaCreditos />}
        {vista === 'prestamos' && <ListaPrestamos />}
        {vista === 'asistencia' && <AsistenciaPersonal />}
        {vista === 'ventas' && <VentasInventario />}
        {vista === 'cobros' && <Finances vista="income" />}
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

      <style>{`
        .finanzas-hub { display: flex; flex-direction: column; gap: 14px; min-height: 0; }
        .fin-atajos { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .fin-atajo {
          display: flex; align-items: center; gap: 12px; text-align: left;
          min-height: 84px; padding: 16px 18px; border-radius: 20px; cursor: pointer;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #fff;
        }
        .fin-atajo strong { display: block; font-size: 16px; font-weight: 900; }
        .fin-atajo small { display: block; margin-top: 2px; color: var(--text-muted); font-size: 12px; }
        .fin-atajo.on { border-color: var(--neon-green); background: rgba(0,255,136,0.1); color: var(--neon-green); }
        .fin-resto { display: flex; flex-wrap: wrap; gap: 8px; }
        .fin-pill {
          display: inline-flex; align-items: center; gap: 8px;
          min-height: 46px; padding: 10px 16px; border-radius: 14px; cursor: pointer;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          color: #ddd; font-weight: 800; font-size: 14px;
        }
        .fin-pill.on { border-color: var(--neon-green); color: #04140c; background: var(--neon-green); }
        .fin-cuerpo { min-height: 0; }
        .fin-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        @media (max-width: 980px) {
          .fin-atajos, .fin-kpis { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .fin-atajos, .fin-kpis { grid-template-columns: 1fr; }
          .fin-atajo { min-height: 72px; }
        }
      `}</style>
    </div>
  );
}
