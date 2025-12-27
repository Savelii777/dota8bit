'use client';

import React, { useCallback, useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GameCanvas, GameHUD } from '@/components/game';
import { GameEngine } from '@/game/engine';
import { HeroEntity, GAME_CONSTANTS } from '@/types';
import { getHeroDefinition } from '@/game/data';
import { generateId } from '@/utils';

function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const heroId = searchParams.get('hero') || 'warrior';
  
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [playerHero, setPlayerHero] = useState<HeroEntity | null>(null);
  const [gameTime, setGameTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleEngineInit = useCallback((newEngine: GameEngine) => {
    setEngine(newEngine);
    
    const heroDef = getHeroDefinition(heroId);
    if (!heroDef) {
      console.error(`Hero ${heroId} not found`);
      router.push('/select-hero');
      return;
    }
    
    // Create player hero
    const hero: HeroEntity = {
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
        level: index === 0 ? 1 : 0, // Start with first ability at level 1
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
    
    newEngine.addHero(hero);
    newEngine.setPlayerHero(hero.id);
    newEngine.setPlayerTeam('radiant');
    newEngine.camera.centerOn(hero.position);
    newEngine.start();
    
    setPlayerHero(hero);
    setIsLoading(false);
    
    // Update game state periodically
    const updateInterval = setInterval(() => {
      const currentHero = newEngine.getPlayerHero();
      if (currentHero) {
        setPlayerHero({ ...currentHero });
      }
      setGameTime(newEngine.gameTime);
    }, 100);
    
    return () => {
      clearInterval(updateInterval);
    };
  }, [heroId, router]);
  
  const handleAbilityClick = useCallback((index: number) => {
    if (engine && playerHero) {
      engine.useAbility(playerHero.id, index);
    }
  }, [engine, playerHero]);
  
  const handleItemClick = useCallback((index: number) => {
    if (engine && playerHero) {
      engine.useItem(playerHero.id, index);
    }
  }, [engine, playerHero]);
  
  const handleShopClick = useCallback(() => {
    // TODO: Open shop UI
    console.log('Shop clicked');
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div 
          className="text-yellow-400 text-2xl animate-pulse"
          style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
        >
          LOADING...
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center overflow-hidden">
      <GameCanvas 
        onEngineInit={handleEngineInit}
        width={1024}
        height={600}
      />
      {playerHero && (
        <GameHUD
          hero={playerHero}
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
