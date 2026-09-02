import React from 'react';
import { Clipboard } from 'lucide-react';

const Interventions: React.FC = () => (
  <div className="max-w-5xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold text-white mb-2">Interventions</h1>
    <p className="text-gray-400 mb-6">Track and manage welfare interventions</p>
    <div className="glass rounded-xl p-8 text-center">
      <Clipboard className="w-12 h-12 text-gray-700 mx-auto mb-3" />
      <p className="text-gray-500">No interventions recorded yet.</p>
      <p className="text-sm text-gray-600 mt-2">Interventions are created when welfare officers respond to high-stress alerts.</p>
    </div>
  </div>
);

export default Interventions;
