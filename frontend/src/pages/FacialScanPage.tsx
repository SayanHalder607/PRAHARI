import React from 'react';
import FacialScan from '../components/FacialScan';

const FacialScanPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold text-white mb-2">Facial Wellness Scan</h1>
    <p className="text-gray-400 mb-6">Voluntary behavioral stress-cue estimation using facial analysis.</p>
    <p className="text-xs text-gray-600 mb-6">This is NOT a diagnostic tool. Results are behavioral signals only.</p>
    <div className="glass rounded-xl p-6">
      <FacialScan />
    </div>
  </div>
);

export default FacialScanPage;
