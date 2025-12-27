'use client';

import React, { useState } from 'react';
import { HeroEntity, AbilityInstance } from '@/types';
import { getAbilityDefinition } from '@/game/data';

interface AbilityPanelProps {
  hero: HeroEntity;
  onAbilityClick?: (index: number) => void;
  onLevelUpAbility?: (index: number) => void;
}

// Helper to safely get ability value at current level (or level 1 if not yet leveled)
function getAbilityValue(arr: number[] | undefined, level: number): number {
  if (!arr || arr.length === 0) return 0;
  const idx = level > 0 ? level - 1 : 0;
  return arr[idx] ?? arr[0] ?? 0;
}

export function AbilityPanel({ hero, onAbilityClick, onLevelUpAbility }: AbilityPanelProps) {
  const abilityKeys = ['Q', 'W', 'E', 'R'];
  const [hoveredAbility, setHoveredAbility] = useState<number | null>(null);
  
  const canLevelUp = (ability: AbilityInstance, isUltimate: boolean) => {
    if (hero.abilityPoints <= 0) return false;
    
    const maxLevel = isUltimate ? 3 : 4;
    if (ability.level >= maxLevel) return false;
    
    // Ultimate requires level 6, 12, 18
    if (isUltimate) {
      const requiredLevels = [6, 12, 18];
      const nextAbilityLevel = ability.level + 1;
      return hero.level >= requiredLevels[nextAbilityLevel - 1];
    }
    
    // Regular abilities can be leveled at 1, 3, 5, 7
    return true;
  };
  
  return (
    <div className="flex gap-2 relative">
      {hero.abilities.map((ability, index) => {
        const abilityDef = getAbilityDefinition(ability.definitionId);
        const isOnCooldown = ability.currentCooldown > 0;
        const isLocked = ability.level === 0;
        const isUltimate = index === 3;
        const canLevel = canLevelUp(ability, isUltimate);
        const hasMana = abilityDef && ability.level > 0 
          ? hero.stats.mana >= (abilityDef.manaCost[ability.level - 1] || 0) 
          : true;
        
        return (
          <div
            key={ability.definitionId}
            className="relative"
            onMouseEnter={() => setHoveredAbility(index)}
            onMouseLeave={() => setHoveredAbility(null)}
          >
            <div
              onClick={() => !isLocked && !isOnCooldown && hasMana && onAbilityClick?.(index)}
              className={`
                relative w-16 h-16 border-4 cursor-pointer
                transition-all [image-rendering:pixelated]
                ${isLocked 
                  ? 'bg-gray-800 border-gray-600 opacity-50' 
                  : isOnCooldown 
                    ? 'bg-gray-700 border-gray-500' 
                    : !hasMana
                      ? 'bg-blue-900 border-blue-700 opacity-70'
                      : isUltimate
                        ? 'bg-yellow-700 border-yellow-500 hover:bg-yellow-600'
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
                {Array.from({ length: isUltimate ? 3 : 4 }).map((_, lvl) => (
                  <div
                    key={lvl}
                    className={`w-2 h-2 ${lvl < ability.level ? 'bg-yellow-400' : 'bg-gray-600'}`}
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
              
              {/* No mana indicator */}
              {!isLocked && !isOnCooldown && !hasMana && (
                <div className="absolute inset-0 bg-blue-900 bg-opacity-60 flex items-center justify-center">
                  <span 
                    className="text-blue-300 text-xs"
                    style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
                  >
                    MANA
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
              
              {/* Level up button */}
              {canLevel && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLevelUpAbility?.(index);
                  }}
                  className="absolute -top-2 -left-2 w-5 h-5 bg-green-500 border-2 border-green-300 
                             text-white text-xs flex items-center justify-center hover:bg-green-400
                             animate-pulse"
                  style={{ fontSize: '10px' }}
                >
                  +
                </button>
              )}
            </div>
            
            {/* Tooltip */}
            {hoveredAbility === index && abilityDef && (
              <div 
                className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 bg-gray-900 border-2 border-gray-600 
                           p-3 z-50 shadow-lg"
                style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
              >
                <div className="text-yellow-400 text-xs mb-2">{abilityDef.name}</div>
                <div className="text-gray-400 text-xs mb-2" style={{ fontSize: '7px', lineHeight: '1.4' }}>
                  {abilityDef.description}
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-xs" style={{ fontSize: '7px' }}>
                    <span className="text-blue-400">MANA:</span>
                    <span className="text-white">
                      {getAbilityValue(abilityDef.manaCost, ability.level)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs" style={{ fontSize: '7px' }}>
                    <span className="text-yellow-400">CD:</span>
                    <span className="text-white">
                      {getAbilityValue(abilityDef.cooldown, ability.level)}s
                    </span>
                  </div>
                  {abilityDef.damage && (
                    <div className="flex justify-between text-xs" style={{ fontSize: '7px' }}>
                      <span className="text-red-400">DMG:</span>
                      <span className="text-white">
                        {getAbilityValue(abilityDef.damage, ability.level)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-gray-500 text-center mt-2" style={{ fontSize: '6px' }}>
                  LVL {ability.level}/{isUltimate ? 3 : 4}
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* Skill points indicator */}
      {hero.abilityPoints > 0 && (
        <div 
          className="absolute -top-6 left-0 right-0 text-center text-green-400 animate-pulse"
          style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}
        >
          {hero.abilityPoints} SKILL POINT{hero.abilityPoints > 1 ? 'S' : ''}
        </div>
      )}
    </div>
  );
}
