import React from 'react';
import { AlertTriangle, Coffee, Moon, MessageCircle } from 'lucide-react';

interface RecommendationCardProps {
  psiScore: number;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ psiScore }) => {
  const getRecommendations = (psi: number) => {
    if (psi > 80) {
      return {
        level: 'Critical',
        color: 'border-red-500/30 bg-red-500/5',
        items: [
          { icon: <MessageCircle className="w-5 h-5 text-red-400" />, text: 'Immediate welfare officer contact recommended' },
          { icon: <AlertTriangle className="w-5 h-5 text-red-400" />, text: 'Consider temporary duty adjustment' },
          { icon: <Moon className="w-5 h-5 text-red-400" />, text: 'Priority rest and recovery period' },
        ],
      };
    }
    if (psi > 60) {
      return {
        level: 'High Stress',
        color: 'border-orange-500/30 bg-orange-500/5',
        items: [
          { icon: <MessageCircle className="w-5 h-5 text-orange-400" />, text: 'Reach out to a peer or welfare officer' },
          { icon: <Coffee className="w-5 h-5 text-orange-400" />, text: 'Take scheduled breaks during duty' },
          { icon: <Moon className="w-5 h-5 text-orange-400" />, text: 'Prioritize sleep quality tonight' },
        ],
      };
    }
    return {
      level: 'Moderate',
      color: 'border-amber-500/30 bg-amber-500/5',
      items: [
        { icon: <Coffee className="w-5 h-5 text-amber-400" />, text: 'Consider a short break or walk' },
        { icon: <Moon className="w-5 h-5 text-amber-400" />, text: 'Aim for 7+ hours of sleep' },
      ],
    };
  };

  const rec = getRecommendations(psiScore);

  return (
    <div className={`rounded-lg border p-6 ${rec.color}`}>
      <h3 className="text-lg font-semibold text-white mb-3">Wellness Recommendations</h3>
      <div className="space-y-3">
        {rec.items.map((item, i) => (
          <div key={i} className="flex items-center space-x-3">
            {item.icon}
            <span className="text-gray-300 text-sm">{item.text}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-gray-500">
        These are general wellness suggestions, not medical advice.
      </p>
    </div>
  );
};

export default RecommendationCard;
