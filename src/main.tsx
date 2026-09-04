import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { GymConfigProvider } from './contexts/GymConfigContext';
import { GymDataProvider } from './hooks/useGymData';
import { reportUiCrash } from './lib/maintenanceAgent';

// 🧪 Tests internos disponibles en consola: window.__runSyncTests()
import('./lib/syncTests').catch(console.error);

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
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
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0a0f0d', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          gap: 20, padding: 40, fontFamily: 'monospace'
        }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#ff3d57' }}>PARTE DEL AGENTE DE MANTENIMIENTO</div>
          <div style={{
            background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.3)',
            borderRadius: 12, padding: 20, maxWidth: 640, width: '100%', color: '#ddd', fontSize: 13, lineHeight: 1.5
          }}>
            <p><strong>Qué:</strong> {this.state.error?.name}: {this.state.error?.message}</p>
            <p><strong>Dónde:</strong> {typeof window !== 'undefined' ? window.location.pathname : '?'}</p>
            <p><strong>Por qué no lo viste en Mantenimiento:</strong> este crash apagó toda la interfaz, incluido el informe.</p>
            <p><strong>Para qué:</strong> ya se guardó el parte. Al recargar, ábrelo en Sistema → Mantenimiento.</p>
            <pre style={{ color: '#888', fontSize: 10, overflow: 'auto', maxHeight: 160, marginTop: 12 }}>
              {this.state.error?.stack?.split('\n').slice(0, 6).join('\n')}
            </pre>
          </div>
          <button
            onClick={() => window.location.assign('/mantenimiento')}
            style={{
              padding: '12px 32px', background: '#00ff88', color: '#000',
              border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 14,
              cursor: 'pointer'
            }}
          >
            VER INFORME / MANTENIMIENTO
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <GymConfigProvider>
            <GymDataProvider>
              <App />
            </GymDataProvider>
          </GymConfigProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
