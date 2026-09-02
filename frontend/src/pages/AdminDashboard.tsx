import React from 'react';
import { Settings, Database, Server, Shield } from 'lucide-react';

const AdminDashboard: React.FC = () => (
  <div className="max-w-5xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
    <p className="text-gray-400 mb-6">System administration and configuration</p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { icon: <Database className="w-8 h-8 text-brand-400" />, title: 'Database', desc: 'PostgreSQL with TimescaleDB', status: 'Connected' },
        { icon: <Server className="w-8 h-8 text-green-400" />, title: 'Backend API', desc: 'FastAPI on port 8000', status: 'Running' },
        { icon: <Shield className="w-8 h-8 text-purple-400" />, title: 'Auth', desc: 'JWT with bcrypt hashing', status: 'Active' },
        { icon: <Settings className="w-8 h-8 text-amber-400" />, title: 'PSI Engine', desc: '6-modality fusion v1.0', status: 'Loaded' },
      ].map((card) => (
        <div key={card.title} className="glass rounded-xl p-6">
          <div className="flex items-center space-x-4">
            {card.icon}
            <div>
              <h3 className="font-semibold text-white">{card.title}</h3>
              <p className="text-sm text-gray-400">{card.desc}</p>
              <span className="text-xs text-green-400">{card.status}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminDashboard;
