'use client';

import React from 'react';
import { GAME_CONSTANTS, Team } from '@/types';

interface MinimapProps {
  playerPosition?: { x: number; y: number };
  playerTeam?: Team;
  size?: number;
}

export function Minimap({ 
  playerPosition = { x: 0, y: 0 }, 
  playerTeam = 'radiant',
  size = 150 
}: MinimapProps) {
  const mapPixelWidth = GAME_CONSTANTS.MAP_WIDTH * GAME_CONSTANTS.TILE_SIZE;
  const mapPixelHeight = GAME_CONSTANTS.MAP_HEIGHT * GAME_CONSTANTS.TILE_SIZE;
  
  // Convert world position to minimap position
  const playerMinimapX = (playerPosition.x / mapPixelWidth) * size;
  const playerMinimapY = (playerPosition.y / mapPixelHeight) * size;
  
  return (
    <div 
      className="relative border-4 border-gray-700 bg-gray-900 [image-rendering:pixelated]"
      style={{ width: size, height: size }}
    >
      {/* Map background */}
      <div className="absolute inset-0">
        {/* Radiant base (bottom-left) */}
        <div 
          className="absolute bg-green-700"
          style={{
            left: 0,
            bottom: 0,
            width: size * 0.15,
            height: size * 0.15,
          }}
        />
        
        {/* Dire base (top-right) */}
        <div 
          className="absolute bg-red-700"
          style={{
            right: 0,
            top: 0,
            width: size * 0.15,
            height: size * 0.15,
          }}
        />
        
        {/* Lanes (simplified) */}
        {/* Top lane */}
        <div 
          className="absolute bg-amber-900"
          style={{
            left: 0,
            top: size * 0.1,
            width: size * 0.85,
            height: 4,
          }}
        />
        <div 
          className="absolute bg-amber-900"
          style={{
            right: size * 0.1,
            top: size * 0.1,
            width: 4,
            height: size * 0.75,
          }}
        />
        
        {/* Mid lane */}
        <div 
          className="absolute bg-amber-900 origin-bottom-left"
          style={{
            left: size * 0.1,
            bottom: size * 0.1,
            width: size * 1.2,
            height: 4,
            transform: 'rotate(-45deg)',
          }}
        />
        
        {/* Bottom lane */}
        <div 
          className="absolute bg-amber-900"
          style={{
            left: size * 0.1,
            bottom: size * 0.1,
            width: 4,
            height: size * 0.75,
          }}
        />
        <div 
          className="absolute bg-amber-900"
          style={{
            left: size * 0.1,
            bottom: size * 0.1,
            width: size * 0.85,
            height: 4,
          }}
        />
        
        {/* River (diagonal) */}
        <div 
          className="absolute bg-blue-600 origin-top-left"
          style={{
            left: 0,
            top: size * 0.5,
            width: size * 1.2,
            height: 3,
            transform: 'rotate(-45deg)',
            opacity: 0.6,
          }}
        />
      </div>
      
      {/* Player indicator */}
      <div
        className={`absolute w-3 h-3 ${playerTeam === 'radiant' ? 'bg-green-400' : 'bg-red-400'} border border-white`}
        style={{
          left: playerMinimapX - 6,
          top: playerMinimapY - 6,
        }}
      />
    </div>
  );
}
