'use client';

import React from 'react';
import { HeroEntity, EXPERIENCE_TABLE } from '@/types';
import { HealthBar } from '../ui';
import { AbilityPanel } from './AbilityPanel';
import { InventoryPanel } from './InventoryPanel';
import { Minimap } from './Minimap';
import { getHeroDefinition } from '@/game/data';
import { formatGameTime } from '@/utils';

interface GameHUDProps {
  hero: HeroEntity;
  gameTime: number;
  radiantScore: number;
  direScore: number;
  isNight?: boolean;
  onAbilityClick?: (index: number) => void;
  onLevelUpAbility?: (index: number) => void;
  onItemClick?: (index: number) => void;
  onShopClick?: () => void;
}

export function GameHUD({
  hero,
  gameTime,
  radiantScore,
  direScore,
  isNight = false,
  onAbilityClick,
  onLevelUpAbility,
  onItemClick,
  onShopClick,
}: GameHUDProps) {
  const heroDef = getHeroDefinition(hero.definitionId);
  const expForNextLevel = EXPERIENCE_TABLE[hero.level] || 99999;
  const expForCurrentLevel = EXPERIENCE_TABLE[hero.level - 1] || 0;
  const expProgress = hero.experience - expForCurrentLevel;
  const expNeeded = expForNextLevel - expForCurrentLevel;
  
  return (
    <div className="fixed inset-x-0 bottom-0 pointer-events-none">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 flex justify-center items-center gap-8 p-2 pointer-events-auto">
        <div 
          className="bg-gray-900 border-4 border-gray-700 px-4 py-2 flex items-center gap-4"
          style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
        >
          <span className="text-green-400">{radiantScore}</span>
          <span className="text-gray-400">vs</span>
          <span className="text-red-400">{direScore}</span>
        </div>
        <div 
          className="bg-gray-900 border-4 border-gray-700 px-4 py-2 text-yellow-400 flex items-center gap-2"
          style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
        >
          <span>{isNight ? '🌙' : '☀️'}</span>
          <span>{formatGameTime(gameTime)}</span>
        </div>
      </div>
      
      {/* Minimap (bottom right) */}
      <div className="fixed bottom-4 right-4 pointer-events-auto">
        <Minimap 
          playerPosition={hero.position} 
          playerTeam={hero.team} 
          size={150}
        />
      </div>
      
      {/* Main HUD bar */}
      <div 
        className="bg-gray-900 border-t-4 border-gray-700 p-4 pointer-events-auto"
        style={{ marginRight: 170 }}
      >
        <div className="flex items-center gap-4">
          {/* Hero portrait and info */}
          <div className="flex items-center gap-3">
            {/* Portrait */}
            <div 
              className="w-20 h-20 bg-gray-800 border-4 border-gray-600 flex items-center justify-center [image-rendering:pixelated]"
            >
              <span 
                className="text-white text-center"
                style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}
              >
                {heroDef?.name || 'Hero'}
              </span>
            </div>
            
            {/* Level and bars */}
            <div className="flex flex-col gap-1 w-40">
              <div 
                className="text-yellow-400 mb-1"
                style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '10px' }}
              >
                LVL {hero.level}
              </div>
              <HealthBar 
                current={hero.stats.health} 
                max={hero.stats.maxHealth} 
                type="health" 
                size="md"
              />
              <HealthBar 
                current={hero.stats.mana} 
                max={hero.stats.maxMana} 
                type="mana" 
                size="md"
              />
              <HealthBar 
                current={expProgress} 
                max={expNeeded} 
                type="experience" 
                size="sm"
                showText={false}
              />
            </div>
          </div>
          
          {/* Abilities */}
          <div className="ml-4">
            <AbilityPanel hero={hero} onAbilityClick={onAbilityClick} onLevelUpAbility={onLevelUpAbility} />
          </div>
          
          {/* Inventory */}
          <div className="ml-4">
            <InventoryPanel hero={hero} onItemClick={onItemClick} />
          </div>
          
          {/* Gold and Shop */}
          <div className="ml-auto flex items-center gap-4">
            <div 
              className="text-yellow-500 flex items-center gap-2"
              style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
            >
              <span className="text-2xl">⬤</span>
              <span>{hero.gold}</span>
            </div>
            <button
              onClick={onShopClick}
              className="bg-amber-700 border-4 border-amber-500 px-4 py-2 text-white hover:bg-amber-600 transition-colors"
              style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '10px' }}
            >
              SHOP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
