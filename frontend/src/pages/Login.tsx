import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/personnel');
    } catch {
      setError('Invalid credentials. Try: personnel1 / demo123');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { username: 'personnel1', role: 'Personnel' },
    { username: 'welfare1', role: 'Welfare Officer' },
    { username: 'commander1', role: 'Commander' },
    { username: 'admin', role: 'Admin' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-brand-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            PRAHARI
          </h1>
          <p className="text-gray-400 mt-2">Personnel Stress & Welfare Monitor</p>
          <p className="text-xs text-gray-600 mt-1">SIH 2026 — Prototype</p>
        </div>

        <form onSubmit={handleLogin} className="glass rounded-xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input
              type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none transition"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-brand-500 focus:outline-none transition"
              placeholder="Enter password"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-6 glass rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Demo Accounts (password: demo123)</h3>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.username}
                onClick={() => { setUsername(acc.username); setPassword('demo123'); }}
                className="text-left px-3 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition"
              >
                <div className="text-sm text-white font-medium">{acc.username}</div>
                <div className="text-xs text-gray-500">{acc.role}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
