import React from 'react';
import WellnessCheckIn from '../components/WellnessCheckIn';

const WellnessCheckInPage: React.FC = () => (
  <div className="max-w-2xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold text-white mb-2">Wellness Check-In</h1>
    <p className="text-gray-400 mb-6">Voluntary daily wellness self-assessment. Your responses help personalize your stress baseline.</p>
    <div className="glass rounded-xl p-6">
      <WellnessCheckIn />
    </div>
  </div>
);

export default WellnessCheckInPage;
