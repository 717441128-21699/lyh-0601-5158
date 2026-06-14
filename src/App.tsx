import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ShipManagement from '@/pages/ShipManagement';
import TransportDispatch from '@/pages/TransportDispatch';
import EquipmentMonitor from '@/pages/EquipmentMonitor';
import ForecastSchedule from '@/pages/ForecastSchedule';
import InventoryControl from '@/pages/InventoryControl';
import ReportExport from '@/pages/ReportExport';
import { useAppStore } from '@/stores/useAppStore';
import { usePermission } from '@/hooks/usePermission';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type UserRole = 'operator' | 'river_chief' | 'administrator';
const roleRoutes: Record<UserRole, string[]> = {
  operator: ['/dashboard', '/ships', '/transport', '/equipment'],
  river_chief: ['/dashboard', '/ships', '/transport', '/equipment', '/forecast', '/inventory'],
  administrator: ['/dashboard', '/ships', '/transport', '/equipment', '/forecast', '/inventory', '/reports'],
};

function RouteGuard() {
  const currentUser = useAppStore((s) => s.currentUser);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) {
      if (location.pathname !== '/login') navigate('/login', { replace: true });
      return;
    }
    if (location.pathname === '/login' || location.pathname === '/') {
      navigate('/dashboard', { replace: true });
      return;
    }
    const allowed = roleRoutes[currentUser.role];
    if (!allowed.includes(location.pathname)) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  return null;
}

export default function App() {
  return (
    <Router>
      <RouteGuard />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ships" element={<ShipManagement />} />
        <Route path="/transport" element={<TransportDispatch />} />
        <Route path="/equipment" element={<EquipmentMonitor />} />
        <Route path="/forecast" element={<ForecastSchedule />} />
        <Route path="/inventory" element={<InventoryControl />} />
        <Route path="/reports" element={<ReportExport />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
