import React from 'react';

interface PSIGaugeProps {
    value: number;
    size?: number;
}

const PSIGauge: React.FC<PSIGaugeProps> = ({ value, size = 200 }) => {
    const getColor = (psi: number) => {
        if (psi <= 20) return '#10b981';
        if (psi <= 40) return '#f59e0b';
        if (psi <= 60) return '#f97316';
        if (psi <= 80) return '#ef4444';
        return '#dc2626';
    };

    const getLabel = (psi: number) => {
        if (psi <= 20) return 'Normal / Stable';
        if (psi <= 40) return 'Mild Stress';
        if (psi <= 60) return 'Moderate Stress';
        if (psi <= 80) return 'High Stress';
        return 'Critical';
    };

    const color = getColor(value);
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#1f2937"
                        strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold" style={{ color }}>
                        {Math.round(value)}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">PSI</span>
                </div>
            </div>
            <span className="mt-3 text-sm font-medium" style={{ color }}>
                {getLabel(value)}
            </span>
            <span className="text-xs text-gray-500 mt-1">
                Prototype Risk Band
            </span>
        </div>
    );
};

export default PSIGauge;