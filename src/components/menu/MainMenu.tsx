'use client';

import React from 'react';
import Link from 'next/link';
import { PixelButton } from '../ui';

export function MainMenu() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      {/* Title */}
      <div className="mb-16 text-center">
        <h1 
          className="text-6xl text-yellow-400 mb-4 [text-shadow:4px_4px_0px_#000]"
          style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
        >
          DOTA
        </h1>
        <h2 
          className="text-4xl text-green-400 [text-shadow:3px_3px_0px_#000]"
          style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
        >
          8-BIT
        </h2>
      </div>
      
      {/* Pixel art decoration */}
      <div className="mb-12 flex gap-4">
        {['⚔️', '🛡️', '🏰', '🗡️', '🧙'].map((emoji, i) => (
          <span key={i} className="text-4xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
            {emoji}
          </span>
        ))}
      </div>
      
      {/* Menu buttons */}
      <div className="flex flex-col gap-6">
        <Link href="/select-hero">
          <PixelButton variant="primary" size="lg">
            START GAME
          </PixelButton>
        </Link>
        
        <PixelButton variant="secondary" size="lg" disabled>
          MULTIPLAYER
        </PixelButton>
        
        <PixelButton variant="secondary" size="lg" disabled>
          SETTINGS
        </PixelButton>
      </div>
      
      {/* Footer */}
      <div 
        className="absolute bottom-8 text-gray-500 text-sm"
        style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}
      >
        v0.1.0 - A tribute to Dota 2
      </div>
    </div>
  );
}
