
import React from 'react';

interface ProgressBarProps {
  value: number;
  label: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  value, 
  label, 
  color = 'stroke-indigo-600',
  size = 'md' 
}) => {
  const radius = size === 'lg' ? 45 : size === 'md' ? 35 : 25;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const sizeClasses = {
    sm: 'w-16 h-16 text-xs',
    md: 'w-24 h-24 text-sm',
    lg: 'w-32 h-32 text-lg'
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            className="text-slate-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50%"
            cy="50%"
          />
          <circle
            className={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50%"
            cy="50%"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-bold">
          {Math.round(value)}%
        </div>
      </div>
      <span className="text-slate-500 font-medium text-center text-sm">{label}</span>
    </div>
  );
};

export default ProgressBar;
