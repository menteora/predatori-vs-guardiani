import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; title?: string; className?: string }> = ({ 
  children, 
  title,
  className = '' 
}) => {
  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-5 mb-4 ${className}`}>
      {title && <h3 className="text-lg font-bold text-slate-200 mb-3">{title}</h3>}
      {children}
    </div>
  );
};