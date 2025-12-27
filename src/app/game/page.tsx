'use client';

import React, { useCallback, useState, Suspense, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GameHUD } from '@/components/game';
import { GameEngine } from '@/game/engine';
import { HeroEntity, GAME_CONSTANTS } from '@/types';
import { getHeroDefinition } from '@/game/data';
import { generateId } from '@/utils';

function createHero(heroId: string): HeroEntity | null {
  const heroDef = getHeroDefinition(heroId);
  if (!heroDef) return null;
  
  return {
    id: generateId('hero'),
    type: 'hero',
    team: 'radiant',
    definitionId: heroId,
    position: { 
      x: 5 * GAME_CONSTANTS.TILE_SIZE, 
      y: (GAME_CONSTANTS.MAP_HEIGHT - 5) * GAME_CONSTANTS.TILE_SIZE 
    },
    rotation: 0,
    isAlive: true,
    level: 1,
    experience: 0,
    gold: 600,
    attributes: { ...heroDef.baseAttributes },
    stats: {
      maxHealth: heroDef.baseStats.health + heroDef.baseAttributes.strength * GAME_CONSTANTS.STRENGTH_HP_BONUS,
      health: heroDef.baseStats.health + heroDef.baseAttributes.strength * GAME_CONSTANTS.STRENGTH_HP_BONUS,
      maxMana: heroDef.baseStats.mana + heroDef.baseAttributes.intelligence * GAME_CONSTANTS.INTELLIGENCE_MANA_BONUS,
      mana: heroDef.baseStats.mana + heroDef.baseAttributes.intelligence * GAME_CONSTANTS.INTELLIGENCE_MANA_BONUS,
      healthRegen: heroDef.baseStats.healthRegen + heroDef.baseAttributes.strength * GAME_CONSTANTS.STRENGTH_REGEN_BONUS,
      manaRegen: heroDef.baseStats.manaRegen + heroDef.baseAttributes.intelligence * GAME_CONSTANTS.INTELLIGENCE_REGEN_BONUS,
      armor: heroDef.baseStats.armor + heroDef.baseAttributes.agility * GAME_CONSTANTS.AGILITY_ARMOR_BONUS,
      magicResistance: heroDef.baseStats.magicResistance,
      attackDamage: (heroDef.baseStats.attackDamage[0] + heroDef.baseStats.attackDamage[1]) / 2 + 
        (heroDef.primaryAttribute === 'strength' ? heroDef.baseAttributes.strength :
         heroDef.primaryAttribute === 'agility' ? heroDef.baseAttributes.agility :
         heroDef.baseAttributes.intelligence),
      attackSpeed: heroDef.baseStats.attackSpeed,
      attackRange: heroDef.baseStats.attackRange,
      movementSpeed: heroDef.baseStats.movementSpeed,
    },
    abilities: heroDef.abilities.map((abilityId, index) => ({
      definitionId: abilityId,
      level: index === 0 ? 1 : 0,
      currentCooldown: 0,
    })),
    inventory: [null, null, null, null, null, null],
    respawnTime: 0,
    abilityPoints: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    buffs: [],
  };
}

function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const heroId = searchParams.get('hero') || 'warrior';
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const heroRef = useRef<HeroEntity | null>(null);
  const [heroState, setHeroState] = useState<HeroEntity | null>(null);
  const [gameTime, setGameTime] = useState(0);
  const [isEngineReady, setIsEngineReady] = useState(false);
  
  // Initialize hero once
  const initialHero = useMemo(() => createHero(heroId), [heroId]);
  
  useEffect(() => {
    if (!initialHero) {
      console.error(`Hero ${heroId} not found`);
      router.push('/select-hero');
      return;
    }
    heroRef.current = initialHero;
  }, [initialHero, heroId, router]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;
    
    // Initialize engine
    const newEngine = new GameEngine();
    newEngine.init(canvas);
    engineRef.current = newEngine;
    
    newEngine.addHero(hero);
    newEngine.setPlayerHero(hero.id);
    newEngine.setPlayerTeam('radiant');
    newEngine.camera.centerOn(hero.position);
    newEngine.start();
    
    // Use requestAnimationFrame to defer state update to avoid synchronous setState
    requestAnimationFrame(() => {
      setIsEngineReady(true);
    });
    
    // Update game state periodically
    const updateInterval = setInterval(() => {
      const currentHero = newEngine.getPlayerHero();
      if (currentHero) {
        setHeroState({ ...currentHero });
      }
      setGameTime(newEngine.gameTime);
    }, 100);
    
    return () => {
      clearInterval(updateInterval);
      newEngine.destroy();
    };
  }, [initialHero]);
  
  const handleAbilityClick = useCallback((index: number) => {
    if (engineRef.current && heroState) {
      engineRef.current.useAbility(heroState.id, index);
    }
  }, [heroState]);
  
  const handleItemClick = useCallback((index: number) => {
    if (engineRef.current && heroState) {
      engineRef.current.useItem(heroState.id, index);
    }
  }, [heroState]);
  
  const handleShopClick = useCallback(() => {
    // TODO: Open shop UI
    console.log('Shop clicked');
  }, []);
  
  // Use heroState for display, fallback to initial hero
  const displayHero = heroState || initialHero;
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={1024}
        height={600}
        className="border-4 border-gray-700 bg-gray-900 [image-rendering:pixelated]"
        style={{ imageRendering: 'pixelated' }}
      />
      {!isEngineReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div 
            className="text-yellow-400 text-2xl animate-pulse"
            style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
          >
            LOADING...
          </div>
        </div>
      )}
      {displayHero && isEngineReady && (
        <GameHUD
          hero={displayHero}
          gameTime={gameTime}
          radiantScore={0}
          direScore={0}
          onAbilityClick={handleAbilityClick}
          onItemClick={handleItemClick}
          onShopClick={handleShopClick}
        />
      )}
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div 
          className="text-yellow-400 text-2xl animate-pulse"
          style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
        >
          LOADING...
        </div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
