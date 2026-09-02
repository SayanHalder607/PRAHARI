import React, { useState, useEffect } from 'react';
import api from '../api';

interface TrendChartProps {
  personnelId: string;
}

interface TrendPoint {
  timestamp: string;
  psi_score: number;
  trend: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ personnelId }) => {
  const [data, setData] = useState<TrendPoint[]>([]);

  useEffect(() => {
    if (!personnelId) return;
    api.get(`/personnel/${personnelId}/trend?days=7`)
      .then((res) => setData(res.data))
      .catch(() => {});
  }, [personnelId]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        <p>No trend data available yet. Start a simulation to generate data.</p>
      </div>
    );
  }

  const maxPsi = Math.max(...data.map((d) => d.psi_score), 100);
  const width = 600;
  const height = 200;
  const padding = 40;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * chartW;
    const y = padding + chartH - (d.psi_score / maxPsi) * chartH;
    return `${x},${y}`;
  });

  const getColor = (psi: number) => {
    if (psi <= 20) return '#10b981';
    if (psi <= 40) return '#f59e0b';
    if (psi <= 60) return '#f97316';
    if (psi <= 80) return '#ef4444';
    return '#dc2626';
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-2xl mx-auto">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = padding + chartH - (v / maxPsi) * chartH;
          return (
            <g key={v}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#374151" strokeDasharray="4" />
              <text x={padding - 8} y={y + 4} textAnchor="end" fill="#6b7280" fontSize="10">{v}</text>
            </g>
          );
        })}
        {/* Line */}
        <polyline fill="none" stroke="#818cf8" strokeWidth="2" points={points.join(' ')} />
        {/* Dots */}
        {data.map((d, i) => {
          const x = padding + (i / Math.max(1, data.length - 1)) * chartW;
          const y = padding + chartH - (d.psi_score / maxPsi) * chartH;
          return <circle key={i} cx={x} cy={y} r="4" fill={getColor(d.psi_score)} />;
        })}
      </svg>
    </div>
  );
};

export default TrendChart;
