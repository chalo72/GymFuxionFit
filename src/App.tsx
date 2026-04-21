import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard        from './pages/Dashboard';
import Members          from './pages/Members';
import Classes          from './pages/Classes';
import Analytics        from './pages/Analytics';
import Settings         from './pages/Settings';
import Login            from './pages/Login';
import GenesisScan      from './pages/GenesisScan';
import CRM              from './pages/CRM';
import Nutrition        from './pages/Nutrition';
import AICoach          from './pages/AICoach';
import Leaderboard      from './pages/Leaderboard';
import Payments         from './pages/Payments';
import Wearables        from './pages/Wearables';
import Schedule         from './pages/Schedule';
import TrainerDashboard from './pages/TrainerDashboard';
import Reception        from './pages/Reception';
import Operations       from './pages/Operations';
import ClientAppView    from './pages/ClientAppView';
import Finances        from './pages/Finances';
import Inventory       from './pages/Inventory';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
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
  );
}

export default App;
