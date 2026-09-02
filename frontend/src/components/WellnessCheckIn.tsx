import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

interface WellnessCheckInProps {
  onSubmit?: (result: any) => void;
}

const WellnessCheckIn: React.FC<WellnessCheckInProps> = ({ onSubmit }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    perceived_stress: 3,
    sleep_quality: 5,
    fatigue_level: 3,
    emotional_state: 5,
    workload_perception: 3,
    recovery_level: 7,
    willingness_to_talk: 5,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fields = [
    { key: 'perceived_stress', label: 'Perceived Stress', min: 1, max: 10 },
    { key: 'sleep_quality', label: 'Sleep Quality', min: 1, max: 10 },
    { key: 'fatigue_level', label: 'Fatigue Level', min: 1, max: 10 },
    { key: 'emotional_state', label: 'Emotional State', min: 1, max: 10 },
    { key: 'workload_perception', label: 'Workload Perception', min: 1, max: 10 },
    { key: 'recovery_level', label: 'Recovery Level', min: 1, max: 10 },
    { key: 'willingness_to_talk', label: 'Willingness to Seek Support', min: 1, max: 10 },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/wellness-checkin', {
        ...form,
        personnel_id: user?.personnel_id,
      });
      setResult(res.data);
      onSubmit?.(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="flex justify-between text-sm text-gray-300 mb-1">
            <span>{f.label}</span>
            <span className="text-brand-400 font-mono">{(form as any)[f.key]}</span>
          </label>
          <input
            type="range"
            min={f.min}
            max={f.max}
            value={(form as any)[f.key]}
            onChange={(e) => setForm({ ...form, [f.key]: parseInt(e.target.value) })}
            className="w-full accent-brand-500"
          />
        </div>
      ))}
      <textarea
        placeholder="Optional notes..."
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
        rows={3}
      />
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Check-In'}
      </button>
      {result && (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-300">
            PSI Score: <span className="font-bold text-brand-400">{result.psi_result?.psi_score}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default WellnessCheckIn;
