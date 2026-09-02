import React from 'react';

interface AlertBadgeProps {
  tier: string;
}

const AlertBadge: React.FC<AlertBadgeProps> = ({ tier }) => {
  const config: Record<string, { label: string; bg: string; text: string; ring: string }> = {
    self_awareness: { label: 'Normal', bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
    personnel_wellness: { label: 'Mild / Moderate', bg: 'bg-amber-500/10', text: 'text-amber-400', ring: 'ring-amber-500/30' },
    welfare_officer: { label: 'High Stress', bg: 'bg-orange-500/10', text: 'text-orange-400', ring: 'ring-orange-500/30' },
    urgent_human_review: { label: 'Critical', bg: 'bg-red-500/10', text: 'text-red-400', ring: 'ring-red-500/30' },
  };
  const c = config[tier] || config.self_awareness;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ring-1 ${c.bg} ${c.text} ${c.ring}`}>
      {c.label}
    </span>
  );
};

export default AlertBadge;
