import React from 'react';

export const FlowgentLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-8 w-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-black font-bold text-xl">
        F
      </div>
      <span className="font-bold text-2xl tracking-tight text-white">
        Flowgent<span className="text-cyan-400 text-lg">.co.za</span>
      </span>
    </div>
  );
};