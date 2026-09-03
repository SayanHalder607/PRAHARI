import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import PSIGauge from '../components/PSIGauge';
import TrendChart from '../components/TrendChart';
import AlertBadge from '../components/AlertBadge';
import RecommendationCard from '../components/RecommendationCard';
import { Heart, Moon, Activity, Shield } from 'lucide-react';

interface DashboardData {
  personnel: { id: string; number: string; rank: string; unit: string };
  current_psi: number;
  risk_tier: string;
  latest_reading: { heart_rate: number; hrv: number; spo2: number };
  sleep: { duration: number; efficiency: number };
  baselines: { baseline_hr: number; baseline_hrv: number; baseline_sleep: number };
}

const PersonnelDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [livePsi, setLivePsi] = useState(25);
  const [simActive, setSimActive] = useState(false);
  const [scenario, setScenario] = useState('normal');

  const effectivePersonnelId = user?.personnel_id || 'dd985cbd-acd4-404d-bcb6-71f5fb91dc48';

  useEffect(() => {
    api.get(`/dashboard/personnel/${effectivePersonnelId}`)
      .then((r) => { setData(r.data); setLivePsi(r.data.current_psi); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, effectivePersonnelId]);

  const startSim = async (s: string) => {
    setScenario(s); setSimActive(true);
    try { await api.post('/simulation/start', { personnel_id: effectivePersonnelId, scenario: s }); } catch {}
    const map: Record<string, number> = { normal: 25, fatigue: 55, high_stress: 70, recovery: 20, critical: 85, physical_exertion: 35 };
    setLivePsi(map[s] || 25);
  };

  const stopSim = async () => {
    setSimActive(false); setScenario('normal');
    try { await api.post('/simulation/stop', { personnel_id: effectivePersonnelId, scenario: 'normal' }); } catch {}
    setLivePsi(25);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Personnel Dashboard</h1>
        <p className="mt-1 text-gray-400">Welcome back, {data?.personnel?.rank} {data?.personnel?.number}</p>
        <p className="text-xs text-gray-600 mt-1">PRAHARI is a research/prototype system. It does not diagnose mental illness.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><Shield className="w-5 h-5 mr-2 text-indigo-400" />Personnel Stress Index</h2>
          <PSIGauge value={livePsi} />
          {data && <div className="mt-4 text-center"><AlertBadge tier={data.risk_tier} /></div>}
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Live Metrics</h2>
          <div className="space-y-4">
            {[
              { icon: <Heart className="w-5 h-5 text-red-400" />, label: 'Heart Rate', value: data?.latest_reading?.heart_rate, unit: 'BPM' },
              { icon: <Activity className="w-5 h-5 text-green-400" />, label: 'HRV', value: data?.latest_reading?.hrv, unit: 'ms' },
              { icon: <Moon className="w-5 h-5 text-purple-400" />, label: 'Sleep', value: data?.sleep?.duration, unit: 'hrs' },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <div className="flex items-center">{m.icon}<span className="text-gray-300 ml-2">{m.label}</span></div>
                <span className="text-2xl font-bold text-white">{m.value}<span className="text-sm text-gray-400 ml-1">{m.unit}</span></span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Live Simulation</h2>
          <div className="space-y-2">
            {[
              { s: 'normal', label: 'Normal', color: 'bg-emerald-600 hover:bg-emerald-700' },
              { s: 'fatigue', label: 'Fatigue', color: 'bg-yellow-600 hover:bg-yellow-700' },
              { s: 'high_stress', label: 'High Stress', color: 'bg-orange-600 hover:bg-orange-700' },
              { s: 'critical', label: 'Critical', color: 'bg-red-600 hover:bg-red-700' },
              { s: 'recovery', label: 'Recovery', color: 'bg-blue-600 hover:bg-blue-700' },
              { s: 'physical_exertion', label: 'Physical Exertion', color: 'bg-teal-600 hover:bg-teal-700' },
            ].map((btn) => (
              <button key={btn.s} onClick={() => startSim(btn.s)}
                className={`w-full px-4 py-2 text-white rounded-lg transition text-sm font-medium ${btn.color} ${scenario === btn.s && simActive ? 'ring-2 ring-white/50' : ''}`}
              >{btn.label}</button>
            ))}
            {simActive && <button onClick={stopSim} className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition text-sm mt-2">Stop Simulation</button>}
          </div>
        </div>
      </div>

      {livePsi > 40 && <div className="mt-6"><RecommendationCard psiScore={livePsi} /></div>}

      <div className="mt-6 glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">7-Day Trend</h2>
        <TrendChart personnelId={effectivePersonnelId} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Facial Wellness Scan', desc: 'Perform a short voluntary scan', path: '/facial-scan' },
          { title: 'Wellness Check-In', desc: 'Submit your daily wellness form', path: '/wellness-checkin' },
          { title: 'Live Monitor', desc: 'Real-time sensor monitoring', path: '/live-monitor' },
        ].map((a) => (
          <button key={a.path} onClick={() => navigate(a.path)} className="p-4 glass rounded-xl hover:border-indigo-500 transition text-left">
            <h3 className="font-semibold text-white">{a.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{a.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PersonnelDashboard;