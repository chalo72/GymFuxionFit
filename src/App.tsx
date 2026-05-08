import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import TrainerDashboard from './pages/TrainerDashboard';
import TrainingDashboard2 from './pages/TrainingDashboard2';
import ClientProgress from './pages/ClientProgress';
import NutritionProfile from './pages/NutritionProfile';
import ReportsIntegrated from './pages/ReportsIntegrated';
import Settings from './pages/Settings';
import Login from './pages/Login';
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
import Finances from './pages/Finances';
import Inventory from './pages/Inventory';
import Payments from './pages/Payments';
import Reception from './pages/Reception';
import ClientAppView from './pages/ClientAppView';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/members" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/trainer" element={<TrainerDashboard />} />
        <Route path="/training" element={<TrainingDashboard2 />} />
        <Route path="/progress" element={<ClientProgress />} />
        <Route path="/nutrition" element={<NutritionProfile />} />
        <Route path="/reports" element={<ReportsIntegrated />} />
        <Route path="/settings" element={<Settings />} />
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
        <Route path="/finances" element={<Finances />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/reception" element={<Reception />} />
        <Route path="/client-app" element={<ClientAppView />} />
        {/* Rutas dashboards cliente */}
        <Route path="/client/progress" element={<ClientProgress />} />
        <Route path="/client/nutrition" element={<NutritionProfile />} />
        <Route path="/client/training" element={<TrainingDashboard2 />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/members" />} />
    </Routes>
  );
}

export default App;
