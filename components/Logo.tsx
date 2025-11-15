import React from 'react';

export const QuantraLogo: React.FC<{ className?: string; alt?: string }> = ({
  className,
  alt = 'Quantra Logo',
}) => {
  return (
    <img
      src="/quantra-logo.png"
      alt={alt}
      className={className}
    />
  );
};

