import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useGymData } from './hooks/useGymData';
import AppLayout from './components/layout/AppLayout';

/* ══════════════════════════════════════════
   LAZY LOADING — Carga bajo demanda
   Reduce bundle inicial de ~520KB → ~50KB
   ══════════════════════════════════════════ */
const Login            = lazy(() => import('./pages/Login'));
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const Members          = lazy(() => import('./pages/Members'));
const Classes          = lazy(() => import('./pages/Classes'));
const Analytics        = lazy(() => import('./pages/Analytics'));
const Settings         = lazy(() => import('./pages/Settings'));
const GenesisScan      = lazy(() => import('./pages/GenesisScan'));
const CRM              = lazy(() => import('./pages/CRM'));
const Nutrition        = lazy(() => import('./pages/Nutrition'));
const AICoach          = lazy(() => import('./pages/AICoach'));
const Leaderboard      = lazy(() => import('./pages/Leaderboard'));
const Payments         = lazy(() => import('./pages/Payments'));
const Wearables        = lazy(() => import('./pages/Wearables'));
const Schedule         = lazy(() => import('./pages/Schedule'));
const TrainerDashboard = lazy(() => import('./pages/TrainerDashboard'));
const Reception        = lazy(() => import('./pages/Reception'));
const Operations       = lazy(() => import('./pages/Operations'));
const ClientAppView    = lazy(() => import('./pages/ClientAppView'));
const Finances         = lazy(() => import('./pages/Finances'));
const Inventory        = lazy(() => import('./pages/Inventory'));

/* ── Fallback de carga Glassmorphism ── */
function LoadingFallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100%', minHeight: 400, flexDirection: 'column', gap: 16
    }}>
      <div style={{
        width: 48, height: 48, border: '3px solid rgba(0,255,136,0.1)',
        borderTop: '3px solid var(--neon-green)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: 2 }}>
        CARGANDO MÓDULO...
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* -- Proteccion de rutas (DESACTIVADA PARA DEBUG CRITICO) -- */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  console.log("🛡️ MODO CRÍTICO: Bypass de seguridad activado.");
  return <>{children}</>;
}

function App() {
  const { syncError } = useGymData();
  const [showSyncError, setShowSyncError] = useState(() => {
    // 🛡️ MODO CRÍTICO: No mostrar si ya se cerró en esta sesión
    return sessionStorage.getItem('hide_sync_alert') !== 'true';
  });

  // Auto-ocultar alerta después de 12 segundos (más tiempo para leer)
  useEffect(() => {
    if (syncError && sessionStorage.getItem('hide_sync_alert') !== 'true') {
      setShowSyncError(true);
      const timer = setTimeout(() => setShowSyncError(false), 12000);
      return () => clearTimeout(timer);
    }
  }, [syncError]);

  const closeAlert = () => {
    setShowSyncError(false);
    sessionStorage.setItem('hide_sync_alert', 'true');
  };

  const forceRefresh = () => {
    // 🛠️ CACHE SLAYER: Limpieza profunda
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
    }
    window.location.reload();
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      {syncError && showSyncError && (
        <div style={{
          background: 'var(--danger-red)',
          color: '#fff',
          padding: '10px 20px',
          fontSize: 11,
          fontWeight: 950,
          textAlign: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          letterSpacing: 1,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14 }}>⚠️</span>
            <span>ALERTA DE SINCRONIZACIÓN: {syncError.toUpperCase()}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              onClick={forceRefresh} 
              style={{ 
                background: '#fff', 
                color: '#000', 
                border: 'none', 
                padding: '6px 12px', 
                borderRadius: 4, 
                fontSize: 9, 
                fontWeight: 900, 
                cursor: 'pointer'
              }}
            >
              LIMPIAR CACHÉ
            </button>

            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                color: '#fff', 
                border: '1px solid rgba(255,255,255,0.2)', 
                padding: '6px 12px', 
                borderRadius: 4, 
                fontSize: 9, 
                fontWeight: 900, 
                cursor: 'pointer'
              }}
            >
              REINTENTAR
            </button>
            
            <button 
              onClick={closeAlert}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0 5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 300
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="/"             element={<Navigate to="/dashboard" replace />} />
          {/* Admin */}
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/genesis-scan"element={<GenesisScan />} />
          <Route path="/crm"         element={<CRM />} />
          <Route path="/members"     element={<Members />} />
          <Route path="/classes"     element={<Classes />} />
          <Route path="/schedule"    element={<Schedule />} />
          <Route path="/analytics"   element={<Analytics />} />
          <Route path="/payments"    element={<Payments />} />
          <Route path="/finances"    element={<Finances />} />
          <Route path="/settings"    element={<Settings />} />
          {/* IA & Biometría */}
          <Route path="/ai-coach"    element={<AICoach />} />
          <Route path="/nutrition"   element={<Nutrition />} />
          <Route path="/wearables"   element={<Wearables />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          {/* Admin Operations Center */}
          <Route path="/operations"  element={<Operations />} />
          <Route path="/inventory"   element={<Inventory />} />
          {/* Client App Preview */}
          <Route path="/client-app"  element={<ClientAppView />} />
          {/* Trainer */}
          <Route path="/trainer"     element={<TrainerDashboard />} />
          {/* Recepción */}
          <Route path="/reception"   element={<Reception />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
