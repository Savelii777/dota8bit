'use client';

import React from 'react';

interface HealthBarProps {
  current: number;
  max: number;
  type?: 'health' | 'mana' | 'experience';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HealthBar({
  current,
  max,
  type = 'health',
  showText = true,
  size = 'md',
  className = '',
}: HealthBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  const colors = {
    health: {
      bg: 'bg-red-900',
      fill: percentage > 30 ? 'bg-green-500' : 'bg-red-500',
      border: 'border-red-700',
    },
    mana: {
      bg: 'bg-blue-900',
      fill: 'bg-blue-500',
      border: 'border-blue-700',
    },
    experience: {
      bg: 'bg-purple-900',
      fill: 'bg-yellow-500',
      border: 'border-purple-700',
    },
  };
  
  const sizes = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };
  
  const { bg, fill, border } = colors[type];
  
  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          ${bg} ${border} ${sizes[size]}
          border-2 overflow-hidden
          [image-rendering:pixelated]
        `}
      >
        <div
          className={`${fill} h-full transition-all duration-200`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <div
          className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold"
          style={{ 
            fontFamily: '"Press Start 2P", cursive, monospace',
            textShadow: '1px 1px 0 black',
            fontSize: size === 'sm' ? '6px' : size === 'md' ? '8px' : '10px',
          }}
        >
          {Math.floor(current)} / {Math.floor(max)}
        </div>
      )}
    </div>
  );
}
