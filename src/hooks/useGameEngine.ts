'use client';

import { useEffect, useRef, useCallback } from 'react';
import { GameEngine } from '@/game/engine';
import { HeroEntity, Team, GAME_CONSTANTS } from '@/types';
import { getHeroDefinition } from '@/game/data';
import { generateId } from '@/utils';

export function useGameEngine() {
  const engineRef = useRef<GameEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const initEngine = useCallback((canvas: HTMLCanvasElement) => {
    if (engineRef.current) {
      engineRef.current.destroy();
    }
    
    canvasRef.current = canvas;
    engineRef.current = new GameEngine();
    engineRef.current.init(canvas);
    
    return engineRef.current;
  }, []);
  
  const startGame = useCallback((heroId: string, playerTeam: Team = 'radiant') => {
    const engine = engineRef.current;
    if (!engine) return;
    
    const heroDef = getHeroDefinition(heroId);
    if (!heroDef) {
      console.error(`Hero ${heroId} not found`);
      return;
    }
    
    // Create player hero
    const playerHero: HeroEntity = {
      id: generateId('hero'),
      type: 'hero',
      team: playerTeam,
      definitionId: heroId,
      position: playerTeam === 'radiant' 
        ? { x: 5 * GAME_CONSTANTS.TILE_SIZE, y: (GAME_CONSTANTS.MAP_HEIGHT - 5) * GAME_CONSTANTS.TILE_SIZE }
        : { x: (GAME_CONSTANTS.MAP_WIDTH - 5) * GAME_CONSTANTS.TILE_SIZE, y: 5 * GAME_CONSTANTS.TILE_SIZE },
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
      abilities: heroDef.abilities.map(abilityId => ({
        definitionId: abilityId,
        level: 0,
        currentCooldown: 0,
      })),
      inventory: [null, null, null, null, null, null],
      respawnTime: 0,
      abilityPoints: 1,
      kills: 0,
      deaths: 0,
      assists: 0,
      buffs: [],
    };
    
    engine.addHero(playerHero);
    engine.setPlayerHero(playerHero.id);
    engine.setPlayerTeam(playerTeam);
    
    // Center camera on player
    engine.camera.centerOn(playerHero.position);
    
    // Start the game loop
    engine.start();
  }, []);
  
  const stopGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
  }, []);
  
  const pauseGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pause();
    }
  }, []);
  
  const resumeGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resume();
    }
  }, []);
  
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);
  
  return {
    engine: engineRef.current,
    initEngine,
    startGame,
    stopGame,
    pauseGame,
    resumeGame,
  };
}
