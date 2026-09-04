import React from 'react';
import { reportUiCrash } from '../../lib/maintenanceAgent';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error: Error | null };

export default class PageErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    reportUiCrash(error, window.location.pathname);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const err = this.state.error;
    const pantalla = typeof window !== 'undefined' ? window.location.pathname : '?';
    return (
      <div className="glass-card" style={{ margin: 20, padding: 24, border: '1px solid rgba(255,61,87,0.4)' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#ff6b81', letterSpacing: 1 }}>AGENTE DE MANTENIMIENTO · PARTE</div>
        <h3 style={{ margin: '8px 0 12px' }}>Esta pantalla se cayó. El informe ya quedó guardado.</h3>
        <p style={{ fontSize: 14, marginBottom: 8 }}><strong>Qué:</strong> {err?.name}: {err?.message}</p>
        <p style={{ fontSize: 14, marginBottom: 8 }}><strong>Dónde:</strong> {pantalla}</p>
        <p style={{ fontSize: 14, marginBottom: 8 }}><strong>Por qué no lo viste en Mantenimiento:</strong> el crash tapaba toda la app. Ahora el parte se muestra aquí y se guarda igual.</p>
        <p style={{ fontSize: 14, marginBottom: 16 }}><strong>Para qué:</strong> que gerencia vea el fallo y el taller lo parchee.</p>
        <pre style={{ fontSize: 11, color: '#888', overflow: 'auto', maxHeight: 140, marginBottom: 16 }}>
          {(err?.stack || '').split('\n').slice(0, 6).join('\n')}
        </pre>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={() => { this.setState({ hasError: false, error: null }); window.location.assign('/'); }}>
            Ir a Hoy
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => { this.setState({ hasError: false, error: null }); window.location.assign('/mantenimiento'); }}>
            Ver mantenimiento
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => window.location.reload()}>
            Recargar
          </button>
        </div>
      </div>
    );
  }
}
