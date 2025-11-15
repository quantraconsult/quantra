import React from 'react';

export const QuantraLogo: React.FC<{ className?: string, alt?: string }> = ({ className, alt = "Quantra Logo" }) => {
    return (
        <img public="/Quantra-logo.png" alt={alt} className={className} />
    );
};
