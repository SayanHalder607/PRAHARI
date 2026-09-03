import React from 'react';
import {
  Heart,
  Activity,
  Droplets,
  Thermometer,
  Wind,
  Zap,
  Gauge,
  Compass
} from 'lucide-react';

interface SensorMonitorProps {
  reading: Record<string, number> | null;
}

const SensorMonitor: React.FC<SensorMonitorProps> = ({ reading }) => {
  if (!reading) {
    return (
      <div className="p-8 text-center text-gray-500">
        No telemetry reading available.
      </div>
    );
  }

  const hr = reading.heart_rate ?? 72;
  const hrv = reading.hrv ?? 55;
  const spo2 = reading.spo2 ?? 98;
  const eda = reading.eda ?? 2.5;
  const temp = reading.skin_temperature ?? 36.6;
  const resp = reading.respiratory_rate ?? 15.5;
  const autoBal = reading.autonomic_balance ?? 1.25;
  const activity = reading.activity_level ?? 0.2;

  // Status helper
  const getHrStatus = (val: number) => {
    if (val > 100) return { label: 'Tachycardia / High', color: 'text-red-400', badge: 'bg-red-500/20 text-red-300 border-red-500/30' };
    if (val > 85) return { label: 'Elevated Load', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    return { label: 'Resting Normal', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  };

  const getHrvStatus = (val: number) => {
    if (val < 30) return { label: 'Severe Sympathetic Tone', color: 'text-red-400', badge: 'bg-red-500/20 text-red-300 border-red-500/30' };
    if (val < 45) return { label: 'Fatigue / Suppressed', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    return { label: 'Healthy Vagal Tone', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  };

  const getSpo2Status = (val: number) => {
    if (val < 95) return { label: 'Hypoxia Risk', color: 'text-red-400', badge: 'bg-red-500/20 text-red-300 border-red-500/30' };
    return { label: 'Optimal Saturation', color: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
  };

  const getEdaStatus = (val: number) => {
    if (val > 5.0) return { label: 'Acute Arousal', color: 'text-red-400', badge: 'bg-red-500/20 text-red-300 border-red-500/30' };
    if (val > 3.5) return { label: 'Elevated Conductance', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    return { label: 'Calm Baseline', color: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
  };

  const hrStat = getHrStatus(hr);
  const hrvStat = getHrvStatus(hrv);
  const spo2Stat = getSpo2Status(spo2);
  const edaStat = getEdaStatus(eda);

  const metrics = [
    {
      label: 'Heart Rate',
      value: hr.toFixed(0),
      unit: 'BPM',
      icon: <Heart className="w-5 h-5 text-red-400 animate-pulse" />,
      sub: hrStat.label,
      badge: hrStat.badge,
      ref: 'Target: 60 - 80 BPM',
    },
    {
      label: 'HRV (RMSSD)',
      value: hrv.toFixed(1),
      unit: 'ms',
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      sub: hrvStat.label,
      badge: hrvStat.badge,
      ref: 'Target: > 45 ms',
    },
    {
      label: 'Blood Oxygen (SpO2)',
      value: spo2.toFixed(1),
      unit: '%',
      icon: <Droplets className="w-5 h-5 text-blue-400" />,
      sub: spo2Stat.label,
      badge: spo2Stat.badge,
      ref: 'Target: 96 - 99 %',
    },
    {
      label: 'Electrodermal Activity',
      value: eda.toFixed(2),
      unit: 'µS',
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      sub: edaStat.label,
      badge: edaStat.badge,
      ref: 'Target: 1.5 - 3.5 µS',
    },
    {
      label: 'Respiratory Rate',
      value: resp.toFixed(1),
      unit: 'br/min',
      icon: <Wind className="w-5 h-5 text-teal-400" />,
      sub: resp > 20 ? 'Tachypnea' : 'Rhythmic Tidal',
      badge: resp > 20 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      ref: 'Target: 12 - 18 br/min',
    },
    {
      label: 'Skin Temperature',
      value: temp.toFixed(1),
      unit: '°C',
      icon: <Thermometer className="w-5 h-5 text-orange-400" />,
      sub: temp > 37.0 ? 'Elevated Core' : 'Normothermia',
      badge: temp > 37.0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      ref: 'Normal: 36.2 - 37.0 °C',
    },
    {
      label: 'Autonomic Balance (LF/HF)',
      value: autoBal.toFixed(2),
      unit: 'ratio',
      icon: <Gauge className="w-5 h-5 text-purple-400" />,
      sub: autoBal > 2.5 ? 'Sympathetic Dominance' : 'Balanced Regulation',
      badge: autoBal > 2.5 ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-gray-800 text-gray-300 border-gray-700',
      ref: 'Target: 1.0 - 2.0',
    },
    {
      label: 'Activity & G-Force Load',
      value: (activity * 100).toFixed(0),
      unit: '% Load',
      icon: <Compass className="w-5 h-5 text-indigo-400" />,
      sub: `${reading.step_count || 0} steps/min`,
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      ref: 'Kinetic Cadence',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="p-4 rounded-xl bg-gray-900/70 border border-gray-800 hover:border-gray-700 transition flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {m.label}
            </span>
            {m.icon}
          </div>

          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {m.value}
            </span>
            <span className="text-xs font-medium text-gray-500">{m.unit}</span>
          </div>

          <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px]">
            <span className={`px-2 py-0.5 rounded border text-[10px] font-medium ${m.badge}`}>
              {m.sub}
            </span>
            <span className="text-gray-500 text-[10px]">{m.ref}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SensorMonitor;
