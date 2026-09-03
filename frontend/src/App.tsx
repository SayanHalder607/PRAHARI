import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PersonnelDashboard from './pages/PersonnelDashboard';
import FacialScanPage from './pages/FacialScanPage';
import WellnessCheckInPage from './pages/WellnessCheckInPage';
import LiveMonitor from './pages/LiveMonitor';
import WelfareOfficerDashboard from './pages/WelfareOfficerDashboard';
import CommanderDashboard from './pages/CommanderDashboard';
import Alerts from './pages/Alerts';
import Interventions from './pages/Interventions';
import ModelAnalytics from './pages/ModelAnalytics';
import AdminDashboard from './pages/AdminDashboard';
import ChatCompanion from './pages/ChatCompanion';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/personnel' : '/login'} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/personnel" element={<ProtectedRoute><PersonnelDashboard /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatCompanion /></ProtectedRoute>} />
        <Route path="/facial-scan" element={<ProtectedRoute><FacialScanPage /></ProtectedRoute>} />
        <Route path="/wellness-checkin" element={<ProtectedRoute><WellnessCheckInPage /></ProtectedRoute>} />
        <Route path="/live-monitor" element={<ProtectedRoute><LiveMonitor /></ProtectedRoute>} />
        <Route path="/welfare-officer" element={<ProtectedRoute><WelfareOfficerDashboard /></ProtectedRoute>} />
        <Route path="/commander" element={<ProtectedRoute><CommanderDashboard /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/interventions" element={<ProtectedRoute><Interventions /></ProtectedRoute>} />
        <Route path="/model-analytics" element={<ProtectedRoute><ModelAnalytics /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;