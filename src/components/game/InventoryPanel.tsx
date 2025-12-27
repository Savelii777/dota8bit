'use client';

import React from 'react';
import { HeroEntity } from '@/types';
import { getItemDefinition } from '@/game/data';

interface InventoryPanelProps {
  hero: HeroEntity;
  onItemClick?: (index: number) => void;
}

export function InventoryPanel({ hero, onItemClick }: InventoryPanelProps) {
  const itemKeys = ['1', '2', '3', '4', '5', '6'];
  
  return (
    <div className="grid grid-cols-3 gap-1">
      {hero.inventory.map((item, index) => {
        const def = item ? getItemDefinition(item.definitionId) : null;
        const isOnCooldown = item && item.currentCooldown > 0;
        
        return (
          <div
            key={index}
            onClick={() => item && !isOnCooldown && onItemClick?.(index)}
            className={`
              relative w-12 h-12 border-2 cursor-pointer
              transition-all [image-rendering:pixelated]
              ${item 
                ? isOnCooldown 
                  ? 'bg-gray-700 border-gray-500' 
                  : 'bg-amber-800 border-amber-600 hover:bg-amber-700'
                : 'bg-gray-800 border-gray-600'
              }
            `}
          >
            {/* Item Icon placeholder */}
            {item && def && (
              <div className="w-full h-full flex items-center justify-center">
                <span 
                  className="text-white font-bold text-xs text-center"
                  style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '6px' }}
                >
                  {def.name.substring(0, 4)}
                </span>
              </div>
            )}
            
            {/* Charges */}
            {item && item.charges !== undefined && item.charges > 0 && (
              <div 
                className="absolute bottom-0 right-0 bg-black bg-opacity-80 px-1 text-white"
                style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '6px' }}
              >
                {item.charges}
              </div>
            )}
            
            {/* Cooldown overlay */}
            {isOnCooldown && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span 
                  className="text-white"
                  style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}
                >
                  {Math.ceil(item.currentCooldown)}
                </span>
              </div>
            )}
            
            {/* Hotkey */}
            <div 
              className="absolute -top-1 -right-1 bg-gray-900 border border-gray-600 px-0.5 text-white"
              style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '6px' }}
            >
              {itemKeys[index]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
