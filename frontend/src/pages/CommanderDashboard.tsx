import React, { useEffect, useState } from 'react';
import api from '../api';
import { BarChart3, Users, AlertTriangle, TrendingUp } from 'lucide-react';

interface CommanderData {
  total_personnel: number;
  average_psi: number;
  distribution: Record<string, number>;
  percentages: Record<string, number>;
}

const CommanderDashboard: React.FC = () => {
  const [data, setData] = useState<CommanderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/commander')
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" /></div>;

  const dist = data?.distribution || {};
  const pcts = data?.percentages || {};
  const bars = [
    { label: 'Normal', count: dist.normal_stable || 0, pct: pcts.normal_stable_pct || 0, color: 'bg-emerald-500' },
    { label: 'Mild', count: dist.mild_stress || 0, pct: pcts.mild_stress_pct || 0, color: 'bg-amber-500' },
    { label: 'Moderate', count: dist.moderate_stress || 0, pct: pcts.moderate_stress_pct || 0, color: 'bg-orange-500' },
    { label: 'High', count: dist.high_stress || 0, pct: pcts.high_stress_pct || 0, color: 'bg-red-500' },
    { label: 'Critical', count: dist.critical || 0, pct: pcts.critical_pct || 0, color: 'bg-red-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Commander Dashboard</h1>
      <p className="text-gray-400 mb-6">Aggregate unit readiness and stress overview</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-xl p-6 text-center">
          <Users className="w-8 h-8 text-brand-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-white">{data?.total_personnel || 0}</div>
          <div className="text-sm text-gray-400">Total Personnel</div>
        </div>
        <div className="glass rounded-xl p-6 text-center">
          <TrendingUp className="w-8 h-8 text-brand-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-white">{data?.average_psi || 0}</div>
          <div className="text-sm text-gray-400">Average PSI</div>
        </div>
        <div className="glass rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-red-400">{(dist.high_stress || 0) + (dist.critical || 0)}</div>
          <div className="text-sm text-gray-400">Requiring Attention</div>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-brand-400" />Stress Distribution</h2>
        <div className="space-y-3">
          {bars.map((b) => (
            <div key={b.label} className="flex items-center space-x-4">
              <span className="w-20 text-sm text-gray-400">{b.label}</span>
              <div className="flex-1 h-6 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${b.color} rounded-full transition-all duration-500`} style={{ width: `${b.pct}%` }} />
              </div>
              <span className="w-16 text-sm text-gray-300 text-right">{b.count} ({b.pct}%)</span>
            </div>
          ))}
        </div>
        {Object.keys(dist).length === 0 && (
          <p className="text-gray-500 text-center py-4">No data yet. Generate predictions via simulations.</p>
        )}
      </div>
    </div>
  );
};

export default CommanderDashboard;
