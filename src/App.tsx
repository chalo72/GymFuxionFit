import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
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

/* -- Proteccion de rutas autenticadas -- */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
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
