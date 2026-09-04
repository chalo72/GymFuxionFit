import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { addMaint, inspectClickTarget, reportJsError } from '../../lib/maintenanceAgent';

export default function MaintenanceWatcher() {
  const location = useLocation();
  const pantalla = location.pathname + (location.search || '');
  const modo = `rol-vista ${location.pathname}`;

  useEffect(() => {
    addMaint({
      tipo: 'ruta',
      pantalla,
      modo,
      detalle: `Entró a ${pantalla}`,
    });
  }, [pantalla, modo]);

  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      reportJsError(e.message || 'Error JS', window.location.pathname, e.filename ? `${e.filename}:${e.lineno}` : '');
    };
    const onRej = (e: PromiseRejectionEvent) => {
      const reason = e.reason instanceof Error ? e.reason.message : String(e.reason || 'promesa rechazada');
      addMaint({
        tipo: 'error_promesa',
        pantalla: window.location.pathname,
        modo: 'unhandledrejection',
        detalle: reason,
      });
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t) return;
      inspectClickTarget(t, window.location.pathname + window.location.search, modo);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRej);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRej);
      document.removeEventListener('click', onClick, true);
    };
  }, [modo]);

  return null;
}
