import React from 'react';

export const FlogentLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src="/flogent-logo.png" alt="Flogent" className="h-8 w-8 rounded-lg" />
      <span className="font-bold text-2xl tracking-tight text-white">
        Flogent<span className="text-cyan-400 text-lg">.co.za</span>
      </span>
    </div>
  );
};