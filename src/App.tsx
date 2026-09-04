import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import RequireAuth from './components/layout/RequireAuth';
import MaintenanceWatcher from './components/enjambre/MaintenanceWatcher';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import TrainerDashboard from './pages/TrainerDashboard';
import TrainingDashboard2 from './pages/TrainingDashboard2';
import ClientProgress from './pages/ClientProgress';
import Nutrition from './pages/Nutrition';
import NutritionProfile from './pages/NutritionProfile';
import ReportsIntegrated from './pages/ReportsIntegrated';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Mantenimiento from './pages/Mantenimiento';
import Operations from './pages/Operations';
import GenesisScan from './pages/GenesisScan';
import CRM from './pages/CRM';
import Schedule from './pages/Schedule';
import Classes from './pages/Classes';
import ExpertCatalogs from './pages/ExpertCatalogs';
import EvaluacionInicial from './pages/EvaluacionInicial';
import ElitePlanner from './pages/ElitePlanner';
import EliteRecovery from './pages/EliteRecovery';
import AICoach from './pages/AICoach';
import Wearables from './pages/Wearables';
import Leaderboard from './pages/Leaderboard';
import Analytics from './pages/Analytics';
import GerencialKPIs from './pages/GerencialKPIs';
import MoneyHub from './pages/MoneyHub';
import Inventory from './pages/Inventory';
import Reception from './pages/Reception';
import ClientAppView from './pages/ClientAppView';
import Avisos from './pages/Avisos';
import PisoHub from './pages/PisoHub';
import PisoScan from './pages/PisoScan';
import SalaCliente from './pages/SalaCliente';

function App() {
  return (
    <>
      <MaintenanceWatcher />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/sala" element={<SalaCliente />} />
      <Route path="/piso/:tipo/:id" element={<PisoScan />} />

      <Route element={<RequireAuth />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/trainer" element={<TrainerDashboard />} />
        <Route path="/training" element={<TrainerDashboard />} />
        <Route path="/progress" element={<ClientProgress />} />
        <Route path="/nutrition" element={<Nutrition />} />
        <Route path="/reports" element={<ReportsIntegrated />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/mantenimiento" element={<Mantenimiento />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/genesis-scan" element={<GenesisScan />} />
        <Route path="/crm" element={<CRM />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/catalogs" element={<ExpertCatalogs />} />
        <Route path="/evaluacion" element={<EvaluacionInicial />} />
        <Route path="/elite-plan" element={<ElitePlanner />} />
        <Route path="/elite-rec" element={<EliteRecovery />} />
        <Route path="/ai-coach" element={<AICoach />} />
        <Route path="/wearables" element={<Wearables />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/kpis" element={<GerencialKPIs />} />
        <Route path="/finances" element={<MoneyHub />} />
        <Route path="/payments" element={<Navigate to="/finances?tab=cobros" replace />} />
        <Route path="/accounting" element={<Navigate to="/finances?tab=libros" replace />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reception" element={<Reception />} />
        <Route path="/avisos" element={<Avisos />} />
        <Route path="/piso-qr" element={<PisoHub />} />
        <Route path="/client-app" element={<ClientAppView />} />
        {/* Rutas dashboards cliente */}
        <Route path="/client/progress" element={<ClientProgress />} />
        <Route path="/client/nutrition" element={<NutritionProfile />} />
        <Route path="/client/training" element={<TrainingDashboard2 />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    </>
  );
}

export default App;
