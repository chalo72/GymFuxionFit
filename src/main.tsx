import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { GymConfigProvider } from './contexts/GymConfigContext';

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
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0a0f0d', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          gap: 20, padding: 40, fontFamily: 'monospace'
        }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#ff3d57' }}>ERROR DEL SISTEMA</div>
          <div style={{
            background: 'rgba(255,61,87,0.1)', border: '1px solid rgba(255,61,87,0.3)',
            borderRadius: 12, padding: 20, maxWidth: 600, width: '100%'
          }}>
            <div style={{ color: '#ff3d57', fontSize: 12, marginBottom: 8, fontWeight: 700 }}>
              {this.state.error?.name}: {this.state.error?.message}
            </div>
            <pre style={{ color: '#888', fontSize: 10, overflow: 'auto', maxHeight: 200 }}>
              {this.state.error?.stack?.split('\n').slice(1, 6).join('\n')}
            </pre>
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              padding: '12px 32px', background: '#00ff88', color: '#000',
              border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 14,
              cursor: 'pointer'
            }}
          >
            REINICIAR APP
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
            <App />
          </GymConfigProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
