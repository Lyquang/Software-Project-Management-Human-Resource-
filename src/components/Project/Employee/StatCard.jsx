// src/components/StatCard.jsx
import React from 'react';

const StatCard = ({ title, count, icon, color, bgColor, size = 'md' }) => {
  const sizes = {
    sm: {
      card: 'p-3',
      iconWrap: 'p-2',
      icon: 'w-5 h-5',
      title: 'text-xs',
      count: 'text-xl',
    },
    md: {
      card: 'p-5',
      iconWrap: 'p-3',
      icon: 'w-6 h-6',
      title: 'text-sm',
      count: 'text-3xl',
    },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`bg-white ${s.card} rounded-xl shadow-sm border border-gray-100 flex items-center gap-4`}>
      <div className={`rounded-lg ${s.iconWrap} ${bgColor} ${color}`}>
        {React.cloneElement(icon, { className: s.icon })}
      </div>
      <div>
        <p className={`${s.title} font-medium text-gray-500`}>{title}</p>
        <p className={`${s.count} font-bold text-gray-900`}>{count}</p>
      </div>
    </div>
  );
};

export default StatCard;