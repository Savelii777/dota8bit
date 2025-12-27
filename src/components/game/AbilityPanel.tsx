'use client';

import React from 'react';
import { HeroEntity } from '@/types';

interface AbilityPanelProps {
  hero: HeroEntity;
  onAbilityClick?: (index: number) => void;
}

export function AbilityPanel({ hero, onAbilityClick }: AbilityPanelProps) {
  const abilityKeys = ['Q', 'W', 'E', 'R'];
  
  return (
    <div className="flex gap-2">
      {hero.abilities.map((ability, index) => {
        const isOnCooldown = ability.currentCooldown > 0;
        const isLocked = ability.level === 0;
        
        return (
          <div
            key={ability.definitionId}
            onClick={() => !isLocked && !isOnCooldown && onAbilityClick?.(index)}
            className={`
              relative w-16 h-16 border-4 cursor-pointer
              transition-all [image-rendering:pixelated]
              ${isLocked 
                ? 'bg-gray-800 border-gray-600 opacity-50' 
                : isOnCooldown 
                  ? 'bg-gray-700 border-gray-500' 
                  : 'bg-amber-700 border-amber-500 hover:bg-amber-600'
              }
            `}
          >
            {/* Ability Icon placeholder */}
            <div className="w-full h-full flex items-center justify-center">
              <span 
                className="text-white font-bold text-2xl"
                style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
              >
                {abilityKeys[index]}
              </span>
            </div>
            
            {/* Level dots */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-1">
              {[1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  className={`w-2 h-2 ${lvl <= ability.level ? 'bg-yellow-400' : 'bg-gray-600'}`}
                />
              ))}
            </div>
            
            {/* Cooldown overlay */}
            {isOnCooldown && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span 
                  className="text-white text-sm"
                  style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
                >
                  {Math.ceil(ability.currentCooldown)}
                </span>
              </div>
            )}
            
            {/* Hotkey */}
            <div 
              className="absolute -top-1 -right-1 bg-gray-900 border-2 border-gray-600 px-1 text-xs text-white"
              style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}
            >
              {abilityKeys[index]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
