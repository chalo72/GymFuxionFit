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
  { id: 'caja', label: 'Caja principal', hint: 'Abrir turno y ver el cajón', icon: Banknote },
  { id: 'cuadre', label: 'Cuadre de caja', hint: 'Contar billetes y cerrar', icon: Scale },
  { id: 'nomina', label: 'Personal', hint: 'Empleados, nómina y préstamos', icon: Users },
  { id: 'cobros', label: 'Cobros', hint: 'Registrar un pago', icon: Wallet },
];

const RESTO: { id: Vista; label: string; icon: typeof Banknote }[] = [
  { id: 'pasados', label: 'Turnos cerrados', icon: Archive },
  { id: 'boveda', label: 'Bóveda', icon: Archive },
  { id: 'prestamos', label: 'Préstamos del personal', icon: Users },
  { id: 'asistencia', label: 'Asistencia del personal', icon: ClipboardCheck },
  { id: 'ventas', label: 'Ventas e inventario', icon: Package },
  { id: 'nomina', label: 'Nómina y gastos', icon: BadgeDollarSign },
  { id: 'creditos', label: 'Créditos de socios', icon: HandCoins },
  { id: 'libros', label: 'Libros', icon: BookOpen },
];

const VISTAS: Vista[] = ['caja', 'cuadre', 'pasados', 'boveda', 'creditos', 'prestamos', 'asistencia', 'ventas', 'cobros', 'nomina', 'libros'];

function vistaDeUrl(tab: string | null): Vista {
  if (tab === 'personal' || tab === 'nomina') return 'nomina';
  return VISTAS.includes(tab as Vista) ? (tab as Vista) : 'caja';
}

const PASOS: { id: Vista; n: string; label: string; hint: string }[] = [
  { id: 'caja', n: '1', label: 'Esta es la caja', hint: 'El cajón de efectivo. Abres el turno y ves qué debe haber.' },
  { id: 'cuadre', n: '2', label: 'Así se cierra', hint: 'Ves el día y cuentas los billetes que quedaron en el cajón.' },
  { id: 'pasados', n: '3', label: 'Turnos ya cerrados', hint: 'Lo que quedó ayer o en el turno anterior. No se vuelve a contar.' },
];

export default function MoneyHub() {
  const [params, setParams] = useSearchParams();
  const vista = vistaDeUrl(params.get('tab'));
  const ir = (v: Vista) => setParams(v === 'caja' ? {} : { tab: v === 'nomina' ? 'personal' : v }, { replace: true });
  const [nominaModo, setNominaModo] = useState<'payroll' | 'expense'>('payroll');
  const [bovedaModo, setBovedaModo] = useState<'goals' | 'agua'>('goals');
  const [busca, setBusca] = useState('');
  const q = busca.trim().toLowerCase();
  const restoVisible = RESTO.filter((t) => !q || t.label.toLowerCase().includes(q));
  const atajosVisibles = ATAJOS.filter((t) => !q || `${t.label} ${t.hint}`.toLowerCase().includes(q));

  return (
    <div className="finanzas-hub">
      <AiAssist
        rol="finanzas"
        texto="La caja principal es solo el efectivo del cajón. Nequi y el crédito no se cuentan ahí. Para cuadrar: abre el turno, cobra, cuenta los billetes y cierra."
      />

      <section className="fin-guia">
        <p className="fit-kicker">Dinero del gym</p>
        <h2>La caja es el cajón de efectivo</h2>
        <p>No es Nequi. No es el fiado. No es la nómina. Es la plata física que tiene quien está en recepción.</p>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar: cuadre, crédito, nómina, préstamos..."
          aria-label="Buscar en dinero"
        />
        <div className="fin-pasos">
          {PASOS.filter((p) => !q || `${p.label} ${p.hint}`.toLowerCase().includes(q)).map((p) => (
            <button key={p.id} type="button" className={vista === p.id ? 'on' : ''} onClick={() => ir(p.id)}>
              <b>{p.n}</b>
              <span>
                <strong>{p.label}</strong>
                <small>{p.hint}</small>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="fin-atajos">
        {atajosVisibles.map((t) => {
          const Icon = t.icon;
          const on = vista === t.id;
          return (
            <button key={t.id} type="button" className={on ? 'fin-atajo on' : 'fin-atajo'} onClick={() => ir(t.id)}>
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
        {restoVisible.map((t) => {
          const Icon = t.icon;
          const on = vista === t.id;
          return (
            <button key={t.id} type="button" className={on ? 'fin-pill on' : 'fin-pill'} onClick={() => ir(t.id)}>
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="fin-cuerpo">
        {vista === 'caja' && <CajaHoy onCuadre={() => ir('cuadre')} />}
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
        .finanzas-hub { display: flex; flex-direction: column; gap: 14px; min-height: 0; color: #fff; }
        .fin-guia { display: flex; flex-direction: column; gap: 10px; }
        .fin-guia h2 { margin: 0; font-size: 28px; }
        .fin-guia p { margin: 0; color: #c5d1b0; }
        .fin-guia input {
          width: 100%; min-height: 48px; border-radius: 14px; border: 1px solid rgba(200,245,66,.35);
          background: #0c120e; color: #fff; padding: 10px 14px; font-size: 16px;
        }
        .fin-pasos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .fin-pasos button {
          display: flex; gap: 12px; text-align: left; min-height: 96px; padding: 14px;
          border-radius: 20px; border: 1px solid rgba(200,245,66,.35); background: #0e140f; color: #fff; cursor: pointer;
        }
        .fin-pasos button.on { background: #C8F542; color: #111; }
        .fin-pasos b { font-size: 28px; color: #C8F542; }
        .fin-pasos button.on b { color: #111; }
        .fin-pasos strong, .fin-pasos small { display: block; }
        .fin-pasos small { font-weight: 600; opacity: .8; }
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
          .fin-atajos, .fin-kpis, .fin-pasos { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .fin-atajos, .fin-kpis { grid-template-columns: 1fr; }
          .fin-atajo { min-height: 72px; }
        }
      `}</style>
    </div>
  );
}
