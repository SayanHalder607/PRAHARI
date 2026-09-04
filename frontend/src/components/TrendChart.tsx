import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Activity,
  Award,
  AlertTriangle
} from 'lucide-react';

interface TrendChartProps {
  personnelId: string;
}

interface TrendPoint {
  timestamp: string;
  psi_score: number;
  trend: string;
  risk_tier?: string;
  day_label?: string;
  short_day?: string;
}

const defaultSampleData: TrendPoint[] = [
  { timestamp: '2026-08-28T00:00:00', psi_score: 24.5, trend: 'stable', day_label: 'Fri 28 Aug', short_day: 'Fri' },
  { timestamp: '2026-08-29T00:00:00', psi_score: 21.2, trend: 'stable', day_label: 'Sat 29 Aug', short_day: 'Sat' },
  { timestamp: '2026-08-30T00:00:00', psi_score: 17.8, trend: 'decreasing', day_label: 'Sun 30 Aug', short_day: 'Sun' },
  { timestamp: '2026-08-31T00:00:00', psi_score: 24.0, trend: 'stable', day_label: 'Mon 31 Aug', short_day: 'Mon' },
  { timestamp: '2026-09-01T00:00:00', psi_score: 30.5, trend: 'increasing', day_label: 'Tue 01 Sep', short_day: 'Tue' },
  { timestamp: '2026-09-02T00:00:00', psi_score: 28.4, trend: 'stable', day_label: 'Wed 02 Sep', short_day: 'Wed' },
  { timestamp: '2026-09-03T00:00:00', psi_score: 23.6, trend: 'stable', day_label: 'Today', short_day: 'Today' },
];

export const TrendChart: React.FC<TrendChartProps> = ({ personnelId }) => {
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<TrendPoint[]>(defaultSampleData);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const effectiveId = personnelId || 'dd985cbd-acd4-404d-bcb6-71f5fb91dc48';
    setLoading(true);
    api.get(`/personnel/${effectiveId}/trend?days=${days}`)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setData(res.data);
        }
      })
      .catch((err) => console.error('Failed to load trend data', err))
      .finally(() => setLoading(false));
  }, [personnelId, days]);

  const scores = data.map((d) => d.psi_score);
  const avgPsi = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 25;
  const maxPsiVal = scores.length > 0 ? Math.max(...scores) : 35;
  const minPsiVal = scores.length > 0 ? Math.min(...scores) : 18;

  // Calculate 7-day delta
  const firstScore = scores[0] || avgPsi;
  const lastScore = scores[scores.length - 1] || avgPsi;
  const delta = lastScore - firstScore;

  // Chart dimensions
  const width = 640;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;
  const maxScale = 100;

  // Compute SVG coordinates
  const coords = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(1, data.length - 1)) * chartW;
    const y = paddingTop + chartH - (d.psi_score / maxScale) * chartH;
    return { x, y, ...d };
  });

  // Construct smooth SVG path using Catmull-Rom or cubic bezier
  const pathD = coords.length > 0
    ? coords.reduce((acc, pt, i, arr) => {
        if (i === 0) return `M ${pt.x},${pt.y}`;
        const prev = arr[i - 1];
        const cpX1 = prev.x + (pt.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (pt.x - prev.x) / 2;
        const cpY2 = pt.y;
        return `${acc} C ${cpX1},${cpY1} ${cpX2},${cpY2} ${pt.x},${pt.y}`;
      }, '')
    : '';

  // Area under line for gradient fill
  const areaD = coords.length > 0
    ? `${pathD} L ${coords[coords.length - 1].x},${paddingTop + chartH} L ${coords[0].x},${paddingTop + chartH} Z`
    : '';

  const getPsiColor = (score: number) => {
    if (score < 35) return '#10B981'; // emerald
    if (score < 65) return '#F59E0B'; // amber
    if (score < 85) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  const getTierLabel = (score: number) => {
    if (score < 35) return 'Optimal / Normal';
    if (score < 65) return 'Moderate Strain';
    if (score < 85) return 'High Stress';
    return 'Critical';
  };

  const hoveredPoint = hoveredIdx !== null ? coords[hoveredIdx] : null;

  return (
    <div className="w-full space-y-5">
      {/* Top Header & Range Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-brand-400" />
          <span className="text-sm font-bold text-white tracking-wide">
            Personnel Stress Index (PSI) Longitudinal Trajectory
          </span>
        </div>

        <div className="flex items-center space-x-1 bg-gray-900 p-1 rounded-lg border border-gray-800 text-xs">
          <button
            onClick={() => setDays(7)}
            className={`px-3 py-1 rounded-md font-medium transition ${
              days === 7
                ? 'bg-brand-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setDays(14)}
            className={`px-3 py-1 rounded-md font-medium transition ${
              days === 14
                ? 'bg-brand-600 text-white shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            14 Days
          </button>
        </div>
      </div>

      {/* 7-Day Analytical KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
          <span className="text-[11px] text-gray-400 uppercase font-semibold block mb-1">
            7-Day Mean PSI
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold font-mono text-brand-300">
              {avgPsi.toFixed(1)}
            </span>
            <span className="text-[10px] text-gray-500">/ 100</span>
          </div>
        </div>

        <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
          <span className="text-[11px] text-gray-400 uppercase font-semibold block mb-1">
            Overall Trend
          </span>
          <div className="flex items-center space-x-1.5 font-semibold text-xs mt-1">
            {delta > 4 ? (
              <span className="text-amber-400 flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>Elevating (+{delta.toFixed(1)})</span>
              </span>
            ) : delta < -4 ? (
              <span className="text-emerald-400 flex items-center space-x-1">
                <TrendingDown className="w-4 h-4" />
                <span>De-escalating ({delta.toFixed(1)})</span>
              </span>
            ) : (
              <span className="text-blue-400 flex items-center space-x-1">
                <Minus className="w-4 h-4" />
                <span>Stable (±{Math.abs(delta).toFixed(1)})</span>
              </span>
            )}
          </div>
        </div>

        <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
          <span className="text-[11px] text-gray-400 uppercase font-semibold block mb-1">
            Peak Strain Point
          </span>
          <span className="text-xl font-bold font-mono text-amber-400">
            {maxPsiVal.toFixed(1)}
          </span>
        </div>

        <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
          <span className="text-[11px] text-gray-400 uppercase font-semibold block mb-1">
            Optimal Recovery
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            {minPsiVal.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Main SVG Graph */}
      <div className="relative w-full bg-gray-950/60 rounded-2xl border border-gray-800/90 p-2 overflow-hidden shadow-inner">
        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none px-3 py-2 rounded-xl bg-gray-900/95 border border-brand-500/40 shadow-2xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full transition-all duration-75 text-xs"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${hoveredPoint.y - 12}px`,
            }}
          >
            <div className="font-semibold text-gray-200">
              {hoveredPoint.day_label || hoveredPoint.timestamp.slice(0, 10)}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getPsiColor(hoveredPoint.psi_score) }}
              />
              <span className="font-mono font-bold text-white text-sm">
                {hoveredPoint.psi_score.toFixed(1)} PSI
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{
                  backgroundColor: `${getPsiColor(hoveredPoint.psi_score)}25`,
                  color: getPsiColor(hoveredPoint.psi_score),
                }}
              >
                {getTierLabel(hoveredPoint.psi_score)}
              </span>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Linear Area Gradient */}
            <linearGradient id="psiAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#818CF8" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing Drop Shadow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Risk Zone Shading */}
          {/* Optimal 0-35 */}
          <rect
            x={paddingLeft}
            y={paddingTop + chartH - (35 / maxScale) * chartH}
            width={chartW}
            height={(35 / maxScale) * chartH}
            fill="#10B981"
            fillOpacity="0.03"
          />
          {/* Moderate 35-65 */}
          <rect
            x={paddingLeft}
            y={paddingTop + chartH - (65 / maxScale) * chartH}
            width={chartW}
            height={(30 / maxScale) * chartH}
            fill="#F59E0B"
            fillOpacity="0.03"
          />

          {/* Horizontal Grid lines and Y-axis scale */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = paddingTop + chartH - (val / maxScale) * chartH;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1E293B"
                  strokeWidth="1"
                  strokeDasharray={val === 0 ? 'none' : '4 4'}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="#64748B"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Average PSI Reference Dashline */}
          {avgPsi > 0 && (
            <g>
              <line
                x1={paddingLeft}
                y1={paddingTop + chartH - (avgPsi / maxScale) * chartH}
                x2={width - paddingRight}
                y2={paddingTop + chartH - (avgPsi / maxScale) * chartH}
                stroke="#6366F1"
                strokeWidth="1.2"
                strokeDasharray="2 3"
                opacity="0.6"
              />
              <text
                x={width - paddingRight + 4}
                y={paddingTop + chartH - (avgPsi / maxScale) * chartH + 3}
                fill="#818CF8"
                fontSize="9"
                fontFamily="monospace"
              >
                Avg {avgPsi.toFixed(0)}
              </text>
            </g>
          )}

          {/* Gradient Fill Under Line */}
          {areaD && <path d={areaD} fill="url(#psiAreaGradient)" />}

          {/* The Main Glowing PSI Curve Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#818CF8"
              strokeWidth="2.8"
              filter="url(#glow)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Hover Columns & Points */}
          {coords.map((pt, i) => {
            const isHovered = hoveredIdx === i;
            const ptColor = getPsiColor(pt.psi_score);
            return (
              <g key={i}>
                {/* Vertical hover crosshair */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingTop}
                    x2={pt.x}
                    y2={paddingTop + chartH}
                    stroke="#475569"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Visible Data Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={ptColor}
                  stroke="#0F172A"
                  strokeWidth="2"
                  className="transition-all duration-150 cursor-pointer"
                />

                {/* X-Axis Date / Day-of-week Label */}
                <text
                  x={pt.x}
                  y={paddingTop + chartH + 18}
                  textAnchor="middle"
                  fill={isHovered ? '#FFFFFF' : '#94A3B8'}
                  fontWeight={isHovered ? '700' : '500'}
                  fontSize="11"
                  className="transition-colors"
                >
                  {pt.short_day || pt.day_label?.split(' ')[0] || `D${i + 1}`}
                </text>

                {/* Transparent wider touch/hover trigger target */}
                <rect
                  x={pt.x - chartW / (coords.length * 2)}
                  y={paddingTop}
                  width={chartW / coords.length}
                  height={chartH + 30}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="cursor-pointer"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Welfare Zone Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 px-1">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>0-35 Optimal / Rested</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>36-65 Moderate Strain</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>66-100 High Stress</span>
          </span>
        </div>
        <span className="text-[11px] text-gray-500 italic">
          Hover over daily nodes for detailed breakdown
        </span>
      </div>
    </div>
  );
};

export default TrendChart;
