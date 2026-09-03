import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Activity,
  Heart,
  Moon,
  BatteryCharging,
  Shield,
  RefreshCw,
} from 'lucide-react';

interface WellnessCheckInProps {
  onSubmit?: (result: any) => void;
}

const WellnessCheckIn: React.FC<WellnessCheckInProps> = ({ onSubmit }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    perceived_stress: 3,
    sleep_quality: 6,
    fatigue_level: 3,
    emotional_state: 6,
    workload_perception: 4,
    recovery_level: 7,
    willingness_to_talk: 6,
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fields = [
    {
      key: 'perceived_stress',
      label: 'Perceived Stress Level',
      desc: '1 = Very relaxed, 10 = Severe acute stress',
      min: 1,
      max: 10,
      icon: <Activity className="w-4 h-4 text-red-400" />,
    },
    {
      key: 'sleep_quality',
      label: 'Rest & Sleep Quality',
      desc: '1 = Restless / Insomnia, 10 = Deep restful sleep',
      min: 1,
      max: 10,
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
    },
    {
      key: 'fatigue_level',
      label: 'Physical & Cognitive Fatigue',
      desc: '1 = Fully energized, 10 = Completely exhausted',
      min: 1,
      max: 10,
      icon: <BatteryCharging className="w-4 h-4 text-amber-400" />,
    },
    {
      key: 'emotional_state',
      label: 'Emotional Balance & Morale',
      desc: '1 = Overwhelmed / Low, 10 = Calm & Resilient',
      min: 1,
      max: 10,
      icon: <Heart className="w-4 h-4 text-emerald-400" />,
    },
    {
      key: 'workload_perception',
      label: 'Operational Workload Intensity',
      desc: '1 = Very light duty, 10 = Extended high-tempo shift',
      min: 1,
      max: 10,
      icon: <Shield className="w-4 h-4 text-blue-400" />,
    },
    {
      key: 'recovery_level',
      label: 'Post-Duty Recovery Adequacy',
      desc: '1 = No downtime, 10 = Fully recovered',
      min: 1,
      max: 10,
      icon: <BatteryCharging className="w-4 h-4 text-teal-400" />,
    },
    {
      key: 'willingness_to_talk',
      label: 'Comfort Discussing Wellness',
      desc: '1 = Prefer keeping private, 10 = Open to peer / welfare talk',
      min: 1,
      max: 10,
      icon: <MessageSquare className="w-4 h-4 text-purple-400" />,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/wellness-checkin', {
        ...form,
        personnel_id: user?.personnel_id || undefined,
      });

      setResult(res.data);
      onSubmit?.(res.data);
    } catch (err: any) {
      console.error('Wellness check-in error:', err);
      const detail = err.response?.data?.detail || 'Failed to submit check-in. Please try again.';
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  const psiData = result?.psi_result;

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 flex items-start space-x-3 text-red-200 text-sm">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Submission Error</p>
            <p className="text-xs text-red-300/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Result Confirmation Card */}
      {result ? (
        <div className="rounded-2xl bg-gradient-to-b from-gray-900/90 to-gray-950 p-6 border border-emerald-500/40 space-y-6 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Wellness Check-In Recorded</h3>
                <p className="text-xs text-emerald-400">Baseline calibrated & saved to secure health record.</p>
              </div>
            </div>

            {psiData && (
              <div className="text-right">
                <span className="text-[11px] text-gray-400 uppercase font-semibold block">Calculated PSI</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {psiData.psi_score?.toFixed(1)}
                  <span className="text-xs text-gray-500 font-normal"> / 100</span>
                </span>
              </div>
            )}
          </div>

          {psiData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block mb-1">Risk Tier</span>
                  <span className="font-semibold text-emerald-300 capitalize">
                    {psiData.tier_label || psiData.risk_tier}
                  </span>
                </div>
                <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                  <span className="text-gray-400 block mb-1">Trend Direction</span>
                  <span className="font-semibold text-blue-300 capitalize">{psiData.trend || 'Stable'}</span>
                </div>
                <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800 col-span-2 sm:col-span-1">
                  <span className="text-gray-400 block mb-1">Model Confidence</span>
                  <span className="font-semibold text-purple-300 font-mono">
                    {((psiData.confidence || 0.95) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Factors */}
              {psiData.contributing_factors && Object.keys(psiData.contributing_factors).length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Identified Stress & Recovery Signals
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(psiData.contributing_factors).map(([k, v]) => (
                      <span
                        key={k}
                        className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300"
                      >
                        {k}: <strong className="text-brand-300">{String(v)}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {psiData.recommendations && psiData.recommendations.length > 0 && (
                <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1.5 text-xs text-gray-300">
                  <span className="font-bold text-brand-300 uppercase tracking-wider block text-[11px]">
                    Recommended Action Plan
                  </span>
                  <ul className="space-y-1">
                    {psiData.recommendations.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-brand-400">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate('/personnel')}
              className="flex-1 py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition"
            >
              <span>View On Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition"
            >
              <MessageSquare className="w-4 h-4 text-brand-400" />
              <span>Discuss with AI Guardian</span>
            </button>
            <button
              onClick={handleReset}
              className="py-3 px-4 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl text-xs font-medium border border-gray-800 transition"
              title="Submit Another Check-In"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* The Check-In Input Form */
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            {fields.map((f) => {
              const val = (form as any)[f.key];
              const isHigh = val >= 7;
              return (
                <div
                  key={f.key}
                  className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800/80 hover:border-gray-700/80 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {f.icon}
                      <span className="text-sm font-semibold text-gray-200">{f.label}</span>
                    </div>
                    <span
                      className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                        isHigh
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-gray-800 text-brand-400 border border-gray-700'
                      }`}
                    >
                      {val} / 10
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500">{f.desc}</p>

                  <input
                    type="range"
                    min={f.min}
                    max={f.max}
                    value={val}
                    onChange={(e) => setForm({ ...form, [f.key]: parseInt(e.target.value) })}
                    className="w-full accent-brand-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
                  />
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
              Additional Confidential Notes (Optional)
            </label>
            <textarea
              placeholder="e.g. Finished continuous 14-hour border patrol duty, mild shoulder stiffness, loud barracks noise..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-gray-900/80 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-500 focus:border-brand-500 focus:outline-none transition"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-sm transition shadow-lg shadow-brand-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Calibrating Stress Telemetry...</span>
              </>
            ) : (
              <span>Submit Confidential Check-In</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default WellnessCheckIn;
