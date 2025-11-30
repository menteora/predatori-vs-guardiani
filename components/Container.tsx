import React from 'react';

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`w-full max-w-md mx-auto p-4 sm:p-6 flex flex-col min-h-screen ${className}`}>
      {children}
    </div>
  );
};