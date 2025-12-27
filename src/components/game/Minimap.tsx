'use client';

import React from 'react';
import { GAME_CONSTANTS, Team, Vector2 } from '@/types';

interface MinimapProps {
  playerPosition?: { x: number; y: number };
  playerTeam?: Team;
  size?: number;
  creeps?: Array<{ position: Vector2; team: Team }>;
  heroes?: Array<{ position: Vector2; team: Team; isPlayer?: boolean }>;
  towers?: Array<{ position: Vector2; team: Team; isAlive: boolean }>;
}

export function Minimap({ 
  playerPosition = { x: 0, y: 0 }, 
  playerTeam = 'radiant',
  size = 150,
  creeps = [],
  heroes = [],
  towers = [],
}: MinimapProps) {
  const mapPixelWidth = GAME_CONSTANTS.MAP_WIDTH * GAME_CONSTANTS.TILE_SIZE;
  const mapPixelHeight = GAME_CONSTANTS.MAP_HEIGHT * GAME_CONSTANTS.TILE_SIZE;
  
  // Convert world position to minimap position
  const worldToMinimap = (pos: Vector2) => ({
    x: (pos.x / mapPixelWidth) * size,
    y: (pos.y / mapPixelHeight) * size,
  });
  
  const playerMinimapPos = worldToMinimap(playerPosition);
  
  return (
    <div 
      className="relative border-4 border-gray-700 bg-gray-900 [image-rendering:pixelated] overflow-hidden"
      style={{ width: size, height: size }}
    >
      {/* Map background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-gray-800 to-red-900 opacity-40" />
      
      {/* Radiant base (bottom-left) */}
      <div 
        className="absolute bg-green-700 rounded-tr-lg"
        style={{
          left: 0,
          bottom: 0,
          width: size * 0.18,
          height: size * 0.18,
        }}
      >
        <div className="absolute inset-1 bg-green-500 opacity-50 animate-pulse rounded-tr" />
      </div>
      
      {/* Dire base (top-right) */}
      <div 
        className="absolute bg-red-700 rounded-bl-lg"
        style={{
          right: 0,
          top: 0,
          width: size * 0.18,
          height: size * 0.18,
        }}
      >
        <div className="absolute inset-1 bg-red-500 opacity-50 animate-pulse rounded-bl" />
      </div>
      
      {/* Lanes */}
      {/* Top lane */}
      <div 
        className="absolute bg-amber-800"
        style={{
          left: size * 0.03,
          top: size * 0.08,
          width: size * 0.82,
          height: 3,
        }}
      />
      <div 
        className="absolute bg-amber-800"
        style={{
          right: size * 0.08,
          top: size * 0.08,
          width: 3,
          height: size * 0.78,
        }}
      />
      
      {/* Mid lane (diagonal) */}
      <div 
        className="absolute bg-amber-800 origin-bottom-left"
        style={{
          left: size * 0.12,
          bottom: size * 0.12,
          width: size * 1.1,
          height: 3,
          transform: 'rotate(-45deg)',
        }}
      />
      
      {/* Bottom lane */}
      <div 
        className="absolute bg-amber-800"
        style={{
          left: size * 0.08,
          bottom: size * 0.08,
          width: 3,
          height: size * 0.78,
        }}
      />
      <div 
        className="absolute bg-amber-800"
        style={{
          left: size * 0.08,
          bottom: size * 0.08,
          width: size * 0.82,
          height: 3,
        }}
      />
      
      {/* River (diagonal) */}
      <div 
        className="absolute bg-blue-500 origin-top-left opacity-60"
        style={{
          left: 0,
          top: size * 0.48,
          width: size * 1.15,
          height: 4,
          transform: 'rotate(-45deg)',
        }}
      />
      
      {/* Jungle areas */}
      <div 
        className="absolute bg-green-800 opacity-40 rounded"
        style={{
          left: size * 0.2,
          bottom: size * 0.25,
          width: size * 0.25,
          height: size * 0.2,
        }}
      />
      <div 
        className="absolute bg-red-800 opacity-40 rounded"
        style={{
          right: size * 0.2,
          top: size * 0.25,
          width: size * 0.25,
          height: size * 0.2,
        }}
      />
      
      {/* Roshan pit */}
      <div 
        className="absolute bg-purple-700 rounded-full opacity-70"
        style={{
          left: size * 0.38,
          top: size * 0.28,
          width: size * 0.08,
          height: size * 0.08,
        }}
      />
      
      {/* Towers */}
      {towers.map((tower, idx) => {
        if (!tower.isAlive) return null;
        const pos = worldToMinimap(tower.position);
        return (
          <div
            key={`tower-${idx}`}
            className={`absolute w-2 h-2 border ${tower.team === 'radiant' ? 'bg-green-400 border-green-200' : 'bg-red-400 border-red-200'}`}
            style={{
              left: pos.x - 4,
              top: pos.y - 4,
            }}
          />
        );
      })}
      
      {/* Creeps */}
      {creeps.map((creep, idx) => {
        const pos = worldToMinimap(creep.position);
        return (
          <div
            key={`creep-${idx}`}
            className={`absolute w-1 h-1 ${creep.team === 'radiant' ? 'bg-green-300' : 'bg-red-300'}`}
            style={{
              left: pos.x - 2,
              top: pos.y - 2,
            }}
          />
        );
      })}
      
      {/* Other heroes */}
      {heroes.filter(h => !h.isPlayer).map((hero, idx) => {
        const pos = worldToMinimap(hero.position);
        return (
          <div
            key={`hero-${idx}`}
            className={`absolute w-3 h-3 rounded-full ${hero.team === 'radiant' ? 'bg-green-400 border border-green-200' : 'bg-red-400 border border-red-200'}`}
            style={{
              left: pos.x - 6,
              top: pos.y - 6,
            }}
          />
        );
      })}
      
      {/* Player indicator */}
      <div
        className={`absolute w-4 h-4 rounded-full ${playerTeam === 'radiant' ? 'bg-green-400' : 'bg-red-400'} border-2 border-white animate-pulse`}
        style={{
          left: playerMinimapPos.x - 8,
          top: playerMinimapPos.y - 8,
        }}
      />
      
      {/* Minimap border decoration */}
      <div className="absolute inset-0 border-2 border-gray-600 pointer-events-none" />
    </div>
  );
}
