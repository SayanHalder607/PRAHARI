import React from 'react';
import { Brain } from 'lucide-react';

const ModelAnalytics: React.FC = () => (
  <div className="max-w-5xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold text-white mb-2">Model Analytics</h1>
    <p className="text-gray-400 mb-6">PSI engine performance metrics and model versioning</p>
    <div className="glass rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Brain className="w-5 h-5 mr-2 text-brand-400" />Current Model: PSI Engine v1.0
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Modalities', value: '6' },
          { label: 'Weights', value: 'Configurable' },
          { label: 'Confidence', value: '60-95%' },
          { label: 'Risk Tiers', value: '4' },
        ].map((m) => (
          <div key={m.label} className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-xl font-bold text-brand-400">{m.value}</div>
            <div className="text-xs text-gray-500 mt-1">{m.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Modality Weights</h3>
        {[
          { label: 'Physiological', weight: 0.30 },
          { label: 'Sleep & Fatigue', weight: 0.20 },
          { label: 'Facial / Behavioral', weight: 0.15 },
          { label: 'Operational Load', weight: 0.15 },
          { label: 'Psychometric', weight: 0.15 },
          { label: 'Historical Trend', weight: 0.05 },
        ].map((w) => (
          <div key={w.label} className="flex items-center space-x-3 mb-2">
            <span className="w-40 text-sm text-gray-300">{w.label}</span>
            <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${w.weight * 100}%` }} />
            </div>
            <span className="w-12 text-sm text-gray-400 text-right">{(w.weight * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ModelAnalytics;
