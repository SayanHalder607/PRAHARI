import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, User, Activity, Heart, BarChart3, AlertTriangle, Settings, LogOut, MessageSquare } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/personnel', label: 'Dashboard', icon: <User className="w-4 h-4" />, roles: ['personnel', 'welfare_officer', 'medical_officer', 'commander', 'admin'] },
    { path: '/chat', label: 'AI Companion', icon: <MessageSquare className="w-4 h-4" />, roles: ['personnel', 'welfare_officer', 'medical_officer', 'commander', 'admin'] },
    { path: '/live-monitor', label: 'Live Monitor', icon: <Activity className="w-4 h-4" />, roles: ['personnel', 'welfare_officer', 'medical_officer', 'commander', 'admin'] },
    { path: '/wellness-checkin', label: 'Check-In', icon: <Heart className="w-4 h-4" />, roles: ['personnel', 'welfare_officer', 'admin'] },
    { path: '/welfare-officer', label: 'Welfare', icon: <Shield className="w-4 h-4" />, roles: ['welfare_officer', 'medical_officer', 'admin'] },
    { path: '/commander', label: 'Command', icon: <BarChart3 className="w-4 h-4" />, roles: ['commander', 'admin'] },
    { path: '/alerts', label: 'Alerts', icon: <AlertTriangle className="w-4 h-4" />, roles: ['welfare_officer', 'medical_officer', 'commander', 'admin'] },
    { path: '/admin', label: 'Admin', icon: <Settings className="w-4 h-4" />, roles: ['admin'] },
  ];

  const visibleItems = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <nav className="glass sticky top-0 z-50 border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/personnel" className="flex items-center space-x-2">
            <Shield className="w-7 h-7 text-brand-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              PRAHARI
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {visibleItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === item.path
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              {user?.username} <span className="text-gray-600">({user?.role})</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-400 hover:text-red-400 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
