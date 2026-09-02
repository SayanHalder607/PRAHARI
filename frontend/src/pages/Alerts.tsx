import React, { useEffect, useState } from 'react';
import api from '../api';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface AlertEntry {
  id: string;
  personnel_id: string;
  alert_level: string;
  message: string;
  status: string;
  timestamp: string;
}

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/alerts')
      .then((r) => setAlerts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" /></div>;

  const levelColors: Record<string, string> = {
    critical: 'text-red-400 bg-red-500/10',
    high: 'text-orange-400 bg-orange-500/10',
    moderate: 'text-amber-400 bg-amber-500/10',
    low: 'text-green-400 bg-green-500/10',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2">Alerts</h1>
      <p className="text-gray-400 mb-6">Active welfare alerts requiring attention</p>

      <div className="space-y-3">
        {alerts.map((a) => (
          <div key={a.id} className="glass rounded-xl p-4 flex items-start space-x-4">
            <div className={`p-2 rounded-lg ${levelColors[a.alert_level] || levelColors.low}`}>
              {a.status === 'acknowledged' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{a.personnel_id}</span>
                <span className="text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-300 mt-1">{a.message}</p>
              <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${levelColors[a.alert_level] || levelColors.low}`}>
                {a.alert_level} — {a.status}
              </span>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p>No active alerts. All personnel within normal stress bands.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
