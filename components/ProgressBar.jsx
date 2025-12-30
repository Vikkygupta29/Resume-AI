
import React from 'react';

const ProgressBar = ({ value, label, color = 'stroke-indigo-600', size = 'md' }) => {
  const radius = size === 'lg' ? 45 : 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${size === 'lg' ? 'w-32 h-32' : 'w-24 h-24'}`}>
        <svg className="w-full h-full transform -rotate-90">
          <circle className="text-slate-200" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="50%" cy="50%" />
          <circle className={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="50%" cy="50%" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-black text-xl">{Math.round(value)}%</div>
      </div>
      <span className="text-slate-500 font-bold text-sm">{label}</span>
    </div>
  );
};

export default ProgressBar;
