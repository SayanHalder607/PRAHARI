import React, { useEffect, useState } from 'react';
import { Heart, Activity, Droplets, Thermometer } from 'lucide-react';

interface SensorMonitorProps {
  reading: Record<string, number> | null;
}

const SensorMonitor: React.FC<SensorMonitorProps> = ({ reading }) => {
  const metrics = reading
    ? [
        { label: 'Heart Rate', value: reading.heart_rate, unit: 'BPM', icon: <Heart className="w-5 h-5 text-red-400" />, color: 'text-red-400' },
        { label: 'HRV', value: reading.hrv, unit: 'ms', icon: <Activity className="w-5 h-5 text-green-400" />, color: 'text-green-400' },
        { label: 'SpO2', value: reading.spo2, unit: '%', icon: <Droplets className="w-5 h-5 text-blue-400" />, color: 'text-blue-400' },
        { label: 'EDA', value: reading.eda, unit: 'µS', icon: <Activity className="w-5 h-5 text-yellow-400" />, color: 'text-yellow-400' },
        { label: 'Skin Temp', value: reading.skin_temperature, unit: '°C', icon: <Thermometer className="w-5 h-5 text-orange-400" />, color: 'text-orange-400' },
      ]
    : [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className="bg-gray-800/50 rounded-lg p-3 text-center">
          <div className="flex justify-center mb-1">{m.icon}</div>
          <div className={`text-xl font-bold ${m.color}`}>{m.value?.toFixed(1)}</div>
          <div className="text-xs text-gray-500">{m.label}</div>
          <div className="text-xs text-gray-600">{m.unit}</div>
        </div>
      ))}
    </div>
  );
};

export default SensorMonitor;
