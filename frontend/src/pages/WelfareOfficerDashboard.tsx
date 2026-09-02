import React, { useEffect, useState } from 'react';
import api from '../api';
import PSIGauge from '../components/PSIGauge';
import AlertBadge from '../components/AlertBadge';
import { Users, AlertTriangle } from 'lucide-react';

interface PersonnelEntry {
  personnel_id: string;
  personnel_number: string;
  rank: string;
  unit: string;
  psi_score: number;
  risk_tier: string;
  trend: string;
  confidence: number;
  last_update: string;
}

const WelfareOfficerDashboard: React.FC = () => {
  const [personnel, setPersonnel] = useState<PersonnelEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/welfare-officer')
      .then((r) => setPersonnel(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" /></div>;

  const critical = personnel.filter((p) => p.risk_tier === 'urgent_human_review');
  const high = personnel.filter((p) => p.risk_tier === 'welfare_officer');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Welfare Officer Dashboard</h1>
      <p className="text-gray-400 mb-6">Monitored personnel overview</p>

      {(critical.length > 0 || high.length > 0) && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="font-semibold text-red-400">{critical.length} Critical, {high.length} High Stress</span>
          </div>
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="text-left p-4">Personnel</th>
              <th className="text-left p-4">Rank</th>
              <th className="text-left p-4">Unit</th>
              <th className="text-center p-4">PSI</th>
              <th className="text-center p-4">Risk Tier</th>
              <th className="text-center p-4">Trend</th>
              <th className="text-center p-4">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {personnel.map((p) => (
              <tr key={p.personnel_id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition">
                <td className="p-4 text-white font-medium">{p.personnel_number}</td>
                <td className="p-4 text-gray-300">{p.rank}</td>
                <td className="p-4 text-gray-300">{p.unit}</td>
                <td className="p-4 text-center font-bold text-white">{p.psi_score}</td>
                <td className="p-4 text-center"><AlertBadge tier={p.risk_tier} /></td>
                <td className="p-4 text-center text-gray-300">{p.trend}</td>
                <td className="p-4 text-center text-gray-400">{(p.confidence * 100).toFixed(0)}%</td>
              </tr>
            ))}
            {personnel.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">No personnel data. Run simulations to generate predictions.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WelfareOfficerDashboard;
