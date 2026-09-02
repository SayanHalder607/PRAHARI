import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SensorMonitor from '../components/SensorMonitor';
import PSIGauge from '../components/PSIGauge';

const LiveMonitor: React.FC = () => {
  const { user } = useAuth();
  const [reading, setReading] = useState<Record<string, number> | null>(null);
  const [psi, setPsi] = useState(25);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user?.personnel_id) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live/${user.personnel_id}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'sensor_reading') {
        setReading(msg.data);
        if (msg.data.psi_score != null) setPsi(msg.data.psi_score);
      }
    };
    return () => { ws.close(); };
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Monitor</h1>
          <p className="text-gray-400 mt-1">Real-time wearable sensor data stream</p>
        </div>
        <span className={`flex items-center space-x-2 text-sm ${connected ? 'text-green-400' : 'text-gray-500'}`}>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
          <span>{connected ? 'Connected' : 'Disconnected — start a simulation'}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Sensor Readings</h2>
          {reading ? <SensorMonitor reading={reading} /> : (
            <p className="text-gray-500 text-center py-8">Waiting for data… Start a simulation from the Personnel Dashboard.</p>
          )}
        </div>
        <div className="glass rounded-xl p-6 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-white mb-4">Live PSI</h2>
          <PSIGauge value={psi} size={180} />
        </div>
      </div>
    </div>
  );
};

export default LiveMonitor;
