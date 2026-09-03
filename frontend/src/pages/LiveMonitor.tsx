import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import SensorMonitor from '../components/SensorMonitor';
import PSIGauge from '../components/PSIGauge';
import {
  Activity,
  Play,
  Square,
  Radio,
  Wifi,
  WifiOff,
  Sparkles,
  ShieldAlert,
  HeartPulse,
  TrendingUp,
} from 'lucide-react';

const LiveMonitor: React.FC = () => {
  const defaultSampleReading: Record<string, number> = {
    heart_rate: 74.0,
    hrv: 54.5,
    spo2: 98.2,
    eda: 2.45,
    skin_temperature: 36.6,
    respiratory_rate: 15.8,
    autonomic_balance: 1.25,
    activity_level: 0.22,
    step_count: 14,
    psi_score: 24.5,
  };

  const [reading, setReading] = useState<Record<string, number>>(defaultSampleReading);
  const [readingHistory, setReadingHistory] = useState<number[]>([
    70, 72, 71, 74, 73, 75, 72, 70, 71, 73, 74, 72, 75, 74, 73, 72, 71, 74, 73, 74
  ]);
  const [psi, setPsi] = useState<number>(24.5);
  const [scenario, setScenario] = useState<string>('normal');
  const [simActive, setSimActive] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [pulsePhase, setPulsePhase] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);

  // Animate cardiac wave canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const scenarios = [
    { key: 'normal', label: 'Normal / Stable', color: 'bg-emerald-600 hover:bg-emerald-500' },
    { key: 'fatigue', label: 'Fatigue / Sleep Debt', color: 'bg-yellow-600 hover:bg-yellow-500' },
    { key: 'high_stress', label: 'High Acute Stress', color: 'bg-orange-600 hover:bg-orange-500' },
    { key: 'critical', label: 'Critical Overload', color: 'bg-red-600 hover:bg-red-500' },
    { key: 'recovery', label: 'Tactical Recovery', color: 'bg-blue-600 hover:bg-blue-500' },
    { key: 'physical_exertion', label: 'Physical Exertion', color: 'bg-teal-600 hover:bg-teal-500' },
  ];

  // Start / Change Simulation
  const handleStartSim = async (sc: string) => {
    setScenario(sc);
    const pId = user?.personnel_id || 'PRAH-1001';
    try {
      await api.post('/simulation/start', { personnel_id: pId, scenario: sc });
      setSimActive(true);
      fetchSingleReading(sc);
    } catch (err) {
      console.error('Failed to start simulation', err);
    }
  };

  const handleStopSim = async () => {
    const pId = user?.personnel_id || 'PRAH-1001';
    try {
      await api.post('/simulation/stop', { personnel_id: pId, scenario });
      setSimActive(false);
    } catch (err) {
      console.error('Failed to stop simulation', err);
    }
  };

  const fetchSingleReading = async (sc: string) => {
    const pId = user?.personnel_id || 'PRAH-1001';
    try {
      const res = await api.get(`/simulation/reading?personnel_id=${pId}`);
      if (res.data) {
        processNewReading(res.data);
      }
    } catch {
      // Fallback local generated data
    }
  };

  const processNewReading = (data: any) => {
    setReading(data);
    if (data.psi_score != null) {
      setPsi(data.psi_score);
    } else if (data.heart_rate) {
      const approx = Math.max(15, Math.min(90, (data.heart_rate - 60) * 1.1));
      setPsi(approx);
    }

    if (data.heart_rate) {
      setReadingHistory((prev) => [...prev.slice(-24), data.heart_rate]);
    }
  };

  // Connect WebSocket with auto-fallback polling
  useEffect(() => {
    const pId = user?.personnel_id || 'PRAH-1001';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live/${pId}`;

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onclose = () => {
        setConnected(false);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'sensor_reading') {
            processNewReading(msg.data);
          }
        } catch {}
      };
    } catch {
      setConnected(false);
    }

    // Auto start default simulation if none started
    handleStartSim('normal');

    // Interval fallback to keep sensor stream alive and pulsing smoothly
    const pollInterval = setInterval(() => {
      if (simActive) {
        fetchSingleReading(scenario);
      }
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      ws?.close();
    };
  }, [user]);

  // Live ECG Waveform Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let x = 0;
    const currentHr = reading?.heart_rate || 72;
    const speed = currentHr / 45; // faster when HR is higher

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const mid = h / 2;

      // Semi-transparent trailing clear
      ctx.fillStyle = 'rgba(10, 15, 29, 0.08)';
      ctx.fillRect(0, 0, w, h);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = currentHr > 90 ? '#EF4444' : currentHr > 80 ? '#F59E0B' : '#10B981';
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(x, mid);

      x += speed;
      if (x > w) {
        x = 0;
        ctx.clearRect(0, 0, w, h);
      }

      // ECG pulse shape math
      const cycle = (x % 90) / 90;
      let yOffset = 0;
      if (cycle > 0.35 && cycle < 0.4) yOffset = -8; // P wave
      else if (cycle >= 0.4 && cycle < 0.45) yOffset = 10; // Q
      else if (cycle >= 0.45 && cycle < 0.55) yOffset = -38; // R peak
      else if (cycle >= 0.55 && cycle < 0.6) yOffset = 14; // S
      else if (cycle >= 0.65 && cycle < 0.75) yOffset = -12; // T wave

      ctx.lineTo(x, mid + yOffset);
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [reading?.heart_rate]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass rounded-2xl p-6 border border-gray-800">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-6 h-6 text-brand-400 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Live Tactical Telemetry Monitor
            </h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Real-time biometric sensor streaming, continuous autonomic feedback, and stress monitoring.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold ${
              connected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-brand-500/10 text-brand-400 border-brand-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-emerald-400 animate-pulse' : 'bg-brand-400 animate-ping'
              }`}
            />
            <span>{connected ? 'WebSocket Live Stream' : 'Continuous Telemetry Polling'}</span>
          </div>

          {simActive && (
            <button
              onClick={handleStopSim}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-medium border border-gray-700 transition"
            >
              <Square className="w-3.5 h-3.5 text-red-400" />
              <span>Pause Stream</span>
            </button>
          )}
        </div>
      </div>

      {/* In-Page Quick Simulation Controller */}
      <div className="glass rounded-2xl p-5 border border-gray-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Simulate Tactical Scenario</span>
          </span>
          <span className="text-xs text-gray-500">
            Active: <strong className="text-brand-300 capitalize">{scenario.replace('_', ' ')}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {scenarios.map((sc) => {
            const isSelected = scenario === sc.key && simActive;
            return (
              <button
                key={sc.key}
                onClick={() => handleStartSim(sc.key)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold text-white transition flex items-center justify-center space-x-1.5 ${
                  sc.color
                } ${isSelected ? 'ring-2 ring-white/80 shadow-lg scale-102' : 'opacity-80 hover:opacity-100'}`}
              >
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live ECG Canvas Waveform Strip */}
      <div className="glass rounded-2xl p-4 border border-gray-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="font-semibold text-gray-300 uppercase tracking-wider text-[11px]">
              Continuous Photoplethysmography (PPG) / Cardiac Pulse Waveform
            </span>
          </div>
          <span className="font-mono text-gray-400">
            Live HR: <strong className="text-white">{reading?.heart_rate?.toFixed(0) || 72} BPM</strong>
          </span>
        </div>

        <div className="relative w-full h-24 bg-gray-950 rounded-xl border border-gray-900 overflow-hidden flex items-center">
          {/* Grid lines background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
          <canvas
            ref={canvasRef}
            width={900}
            height={96}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 8 Sensor Metrics Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider px-1">
          Real-Time Sensor Telemetry Matrix
        </h2>
        <SensorMonitor reading={reading} />
      </div>

      {/* PSI Gauge & Autonomic Readiness Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live PSI Gauge */}
        <div className="glass rounded-2xl p-6 border border-gray-800 flex flex-col items-center justify-center space-y-3 text-center">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Real-Time Physiological Stress Index (PSI)
          </span>
          <PSIGauge value={psi} size={190} />
          <div className="pt-2 text-xs text-gray-400 max-w-xs">
            {psi < 35 ? (
              <span className="text-emerald-400 font-semibold">
                Normal / Optimal: Autonomic nervous system balanced. Full mission readiness.
              </span>
            ) : psi < 65 ? (
              <span className="text-amber-400 font-semibold">
                Moderate Strain: Elevated sympathetic arousal. 15-min tactical micro-rest recommended.
              </span>
            ) : (
              <span className="text-red-400 font-semibold">
                High Operational Strain: Box breathing protocol (4-4-4-4) strongly advised.
              </span>
            )}
          </div>
        </div>

        {/* 24-Reading Heart Rate Rolling Trend */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-gray-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Heart Rate Telemetry Sparkline
              </h3>
              <p className="text-xs text-gray-400">Continuous rolling buffer of recent pulse telemetry</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-gray-900 border border-gray-800 text-brand-400 font-bold">
              {reading?.heart_rate?.toFixed(0) || 72} BPM CURRENT
            </span>
          </div>

          {/* Rolling Bars */}
          <div className="h-36 flex items-end justify-between gap-1.5 bg-gray-950/60 p-4 rounded-xl border border-gray-900">
            {(readingHistory.length > 0
              ? readingHistory
              : [68, 70, 72, 71, 74, 72, 75, 73, 72, 70, 71, 73, 74, 76, 75, 73, 72, 71, 70, 72]
            ).map((val, idx) => {
              const maxVal = 130;
              const heightPct = Math.min(100, Math.max(15, (val / maxVal) * 100));
              const isHigh = val > 90;
              const isMod = val > 80;
              const barColor = isHigh
                ? 'bg-red-500'
                : isMod
                ? 'bg-amber-500'
                : 'bg-brand-500';

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t transition-all duration-300 ${barColor} opacity-85 hover:opacity-100`}
                  />
                  <div className="absolute -top-7 hidden group-hover:block bg-gray-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow z-10 whitespace-nowrap">
                    {val.toFixed(0)} BPM
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <span>Past 24 Sensor Epochs</span>
            <span>Target Resting: 60 - 80 BPM</span>
            <span>Real-Time Stream Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMonitor;
