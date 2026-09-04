import React from 'react';
import FacialScan from '../components/FacialScan';
import { Camera, ShieldAlert, Sparkles } from 'lucide-react';

const FacialScanPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass rounded-2xl p-6 border border-gray-800">
        <div>
          <div className="flex items-center space-x-2">
            <Camera className="w-6 h-6 text-brand-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Facial Behavioral Wellness Scan
            </h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Voluntary behavioral stress-cue extraction, blink frequency, and micro-tension analysis (15% Multimodal PSI Weight).
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-brand-500/30 bg-brand-500/10 text-xs font-semibold text-brand-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MediaPipe Affect AI</span>
        </div>
      </div>

      {/* Main Scan Terminal */}
      <div className="glass rounded-2xl p-6 border border-gray-800">
        <FacialScan />
      </div>

      {/* Advisory Note */}
      <div className="flex items-center space-x-2 text-xs text-gray-500 px-2">
        <ShieldAlert className="w-4 h-4 text-gray-500 shrink-0" />
        <span>
          PRAHARI is a welfare-first, decision-support prototype. Facial scan evaluations are non-diagnostic, confidential, and completely sealed from command appraisal records.
        </span>
      </div>
    </div>
  );
};

export default FacialScanPage;
