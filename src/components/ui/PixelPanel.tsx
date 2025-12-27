'use client';

import React from 'react';

interface PixelPanelProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function PixelPanel({ children, title, className = '' }: PixelPanelProps) {
  return (
    <div
      className={`
        relative bg-gray-900 border-4 border-gray-700
        shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]
        [image-rendering:pixelated]
        ${className}
      `}
    >
      {title && (
        <div
          className="
            bg-gray-800 border-b-4 border-gray-700
            px-4 py-2 text-yellow-400 font-bold uppercase
          "
          style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
        >
          {title}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
