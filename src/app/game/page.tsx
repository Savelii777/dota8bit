'use client';

import React, { useCallback, useState, Suspense, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GameHUD, Shop } from '@/components/game';
import { GameEngine } from '@/game/engine';
import { HeroEntity, GAME_CONSTANTS, ItemInstance } from '@/types';
import { getHeroDefinition, getAllHeroes, getItemDefinition } from '@/game/data';
import { generateId } from '@/utils';

function createHero(heroId: string, team: 'radiant' | 'dire' = 'radiant'): HeroEntity | null {
  const heroDef = getHeroDefinition(heroId);
  if (!heroDef) return null;
  
  const spawnX = team === 'radiant' 
    ? 5 * GAME_CONSTANTS.TILE_SIZE 
    : (GAME_CONSTANTS.MAP_WIDTH - 5) * GAME_CONSTANTS.TILE_SIZE;
  const spawnY = team === 'radiant'
    ? (GAME_CONSTANTS.MAP_HEIGHT - 5) * GAME_CONSTANTS.TILE_SIZE
    : 5 * GAME_CONSTANTS.TILE_SIZE;
  
  return {
    id: generateId('hero'),
    type: 'hero',
    team: team,
    definitionId: heroId,
    position: { x: spawnX, y: spawnY },
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

function getRandomEnemyHeroId(excludeId: string): string {
  const heroes = getAllHeroes();
  const available = heroes.filter(h => h.id !== excludeId);
  return available[Math.floor(Math.random() * available.length)].id;
}

function GameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const heroId = searchParams.get('hero') || 'warrior';
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const heroRef = useRef<HeroEntity | null>(null);
  const enemyHeroRef = useRef<HeroEntity | null>(null);
  const [heroState, setHeroState] = useState<HeroEntity | null>(null);
  const [gameTime, setGameTime] = useState(0);
  const [isNight, setIsNight] = useState(false);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [radiantScore, setRadiantScore] = useState(0);
  const [direScore, setDireScore] = useState(0);
  const [isShopOpen, setIsShopOpen] = useState(false);
  
  // Initialize heroes once
  const initialHero = useMemo(() => createHero(heroId, 'radiant'), [heroId]);
  const enemyHeroId = useMemo(() => getRandomEnemyHeroId(heroId), [heroId]);
  const initialEnemyHero = useMemo(() => createHero(enemyHeroId, 'dire'), [enemyHeroId]);
  
  useEffect(() => {
    if (!initialHero) {
      console.error(`Hero ${heroId} not found`);
      router.push('/select-hero');
      return;
    }
    heroRef.current = initialHero;
    if (initialEnemyHero) {
      enemyHeroRef.current = initialEnemyHero;
    }
  }, [initialHero, initialEnemyHero, heroId, router]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    const enemyHero = enemyHeroRef.current;
    if (!canvas || !hero) return;
    
    // Initialize engine
    const newEngine = new GameEngine();
    newEngine.init(canvas);
    engineRef.current = newEngine;
    
    // Add player hero
    newEngine.addHero(hero);
    newEngine.setPlayerHero(hero.id);
    newEngine.setPlayerTeam('radiant');
    
    // Add enemy bot hero
    if (enemyHero) {
      newEngine.addHero(enemyHero);
    }
    
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
      setIsNight(newEngine.isNight);
      
      // Calculate scores (kills)
      let rScore = 0;
      let dScore = 0;
      for (const h of newEngine.heroes.values()) {
        if (h.team === 'radiant') rScore += h.kills;
        else dScore += h.kills;
      }
      setRadiantScore(rScore);
      setDireScore(dScore);
    }, 100);
    
    // Keyboard handler for shop toggle
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'b') {
        setIsShopOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsShopOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      clearInterval(updateInterval);
      window.removeEventListener('keydown', handleKeyDown);
      newEngine.destroy();
    };
  }, [initialHero, initialEnemyHero]);
  
  const handleAbilityClick = useCallback((index: number) => {
    if (engineRef.current && heroState) {
      engineRef.current.useAbility(heroState.id, index);
    }
  }, [heroState]);
  
  const handleLevelUpAbility = useCallback((index: number) => {
    if (!engineRef.current || !heroState) return;
    if (heroState.abilityPoints <= 0) return;
    
    const hero = engineRef.current.getHero(heroState.id);
    if (!hero) return;
    
    const ability = hero.abilities[index];
    if (!ability) return;
    
    const isUltimate = index === 3;
    const maxLevel = isUltimate ? 3 : 4;
    
    if (ability.level >= maxLevel) return;
    
    // Ultimate requires level 6, 12, 18
    if (isUltimate) {
      const requiredLevels = [6, 12, 18];
      const nextAbilityLevel = ability.level + 1;
      if (hero.level < requiredLevels[nextAbilityLevel - 1]) return;
    }
    
    // Level up the ability
    ability.level += 1;
    hero.abilityPoints -= 1;
    
    setHeroState({ ...hero });
  }, [heroState]);
  
  const handleItemClick = useCallback((index: number) => {
    if (engineRef.current && heroState) {
      engineRef.current.useItem(heroState.id, index);
    }
  }, [heroState]);
  
  const handleShopClick = useCallback(() => {
    setIsShopOpen(true);
  }, []);
  
  const handleShopClose = useCallback(() => {
    setIsShopOpen(false);
  }, []);
  
  const handleBuyItem = useCallback((itemId: string) => {
    if (!engineRef.current || !heroState) return;
    
    const itemDef = getItemDefinition(itemId);
    if (!itemDef) return;
    
    // Check if can afford
    if (heroState.gold < itemDef.cost) return;
    
    // Find empty slot
    const emptySlot = heroState.inventory.findIndex(slot => slot === null);
    if (emptySlot === -1) return;
    
    // Create item instance
    const newItem: ItemInstance = {
      definitionId: itemId,
      charges: itemDef.charges,
      currentCooldown: 0,
    };
    
    // Update hero
    const hero = engineRef.current.getHero(heroState.id);
    if (hero) {
      hero.gold -= itemDef.cost;
      hero.inventory[emptySlot] = newItem;
      
      // Apply item stats immediately
      if (itemDef.stats) {
        if (itemDef.stats.maxHealth) hero.stats.maxHealth += itemDef.stats.maxHealth;
        if (itemDef.stats.maxMana) hero.stats.maxMana += itemDef.stats.maxMana;
        if (itemDef.stats.healthRegen) hero.stats.healthRegen += itemDef.stats.healthRegen;
        if (itemDef.stats.manaRegen) hero.stats.manaRegen += itemDef.stats.manaRegen;
        if (itemDef.stats.armor) hero.stats.armor += itemDef.stats.armor;
        if (itemDef.stats.attackDamage) hero.stats.attackDamage += itemDef.stats.attackDamage;
        if (itemDef.stats.attackSpeed) hero.stats.attackSpeed += itemDef.stats.attackSpeed;
        if (itemDef.stats.movementSpeed) hero.stats.movementSpeed += itemDef.stats.movementSpeed;
      }
      
      // Apply bonus attributes
      if (itemDef.bonusAttributes) {
        if (itemDef.bonusAttributes.strength) {
          hero.attributes.strength += itemDef.bonusAttributes.strength;
          hero.stats.maxHealth += itemDef.bonusAttributes.strength * GAME_CONSTANTS.STRENGTH_HP_BONUS;
          hero.stats.healthRegen += itemDef.bonusAttributes.strength * GAME_CONSTANTS.STRENGTH_REGEN_BONUS;
        }
        if (itemDef.bonusAttributes.agility) {
          hero.attributes.agility += itemDef.bonusAttributes.agility;
          hero.stats.armor += itemDef.bonusAttributes.agility * GAME_CONSTANTS.AGILITY_ARMOR_BONUS;
          hero.stats.attackSpeed += itemDef.bonusAttributes.agility * GAME_CONSTANTS.AGILITY_ATTACK_SPEED_BONUS / 100;
        }
        if (itemDef.bonusAttributes.intelligence) {
          hero.attributes.intelligence += itemDef.bonusAttributes.intelligence;
          hero.stats.maxMana += itemDef.bonusAttributes.intelligence * GAME_CONSTANTS.INTELLIGENCE_MANA_BONUS;
          hero.stats.manaRegen += itemDef.bonusAttributes.intelligence * GAME_CONSTANTS.INTELLIGENCE_REGEN_BONUS;
        }
      }
      
      setHeroState({ ...hero });
    }
  }, [heroState]);
  
  const handleSellItem = useCallback((slotIndex: number) => {
    if (!engineRef.current || !heroState) return;
    
    const item = heroState.inventory[slotIndex];
    if (!item) return;
    
    const itemDef = getItemDefinition(item.definitionId);
    if (!itemDef) return;
    
    const sellPrice = Math.floor(itemDef.cost * 0.5); // 50% sell value
    
    const hero = engineRef.current.getHero(heroState.id);
    if (hero) {
      hero.gold += sellPrice;
      hero.inventory[slotIndex] = null;
      
      // Remove item stats
      if (itemDef.stats) {
        if (itemDef.stats.maxHealth) hero.stats.maxHealth -= itemDef.stats.maxHealth;
        if (itemDef.stats.maxMana) hero.stats.maxMana -= itemDef.stats.maxMana;
        if (itemDef.stats.healthRegen) hero.stats.healthRegen -= itemDef.stats.healthRegen;
        if (itemDef.stats.manaRegen) hero.stats.manaRegen -= itemDef.stats.manaRegen;
        if (itemDef.stats.armor) hero.stats.armor -= itemDef.stats.armor;
        if (itemDef.stats.attackDamage) hero.stats.attackDamage -= itemDef.stats.attackDamage;
        if (itemDef.stats.attackSpeed) hero.stats.attackSpeed -= itemDef.stats.attackSpeed;
        if (itemDef.stats.movementSpeed) hero.stats.movementSpeed -= itemDef.stats.movementSpeed;
      }
      
      // Remove bonus attributes
      if (itemDef.bonusAttributes) {
        if (itemDef.bonusAttributes.strength) {
          hero.attributes.strength -= itemDef.bonusAttributes.strength;
          hero.stats.maxHealth -= itemDef.bonusAttributes.strength * GAME_CONSTANTS.STRENGTH_HP_BONUS;
          hero.stats.healthRegen -= itemDef.bonusAttributes.strength * GAME_CONSTANTS.STRENGTH_REGEN_BONUS;
        }
        if (itemDef.bonusAttributes.agility) {
          hero.attributes.agility -= itemDef.bonusAttributes.agility;
          hero.stats.armor -= itemDef.bonusAttributes.agility * GAME_CONSTANTS.AGILITY_ARMOR_BONUS;
          hero.stats.attackSpeed -= itemDef.bonusAttributes.agility * GAME_CONSTANTS.AGILITY_ATTACK_SPEED_BONUS / 100;
        }
        if (itemDef.bonusAttributes.intelligence) {
          hero.attributes.intelligence -= itemDef.bonusAttributes.intelligence;
          hero.stats.maxMana -= itemDef.bonusAttributes.intelligence * GAME_CONSTANTS.INTELLIGENCE_MANA_BONUS;
          hero.stats.manaRegen -= itemDef.bonusAttributes.intelligence * GAME_CONSTANTS.INTELLIGENCE_REGEN_BONUS;
        }
      }
      
      // Clamp health/mana to max
      hero.stats.health = Math.min(hero.stats.health, hero.stats.maxHealth);
      hero.stats.mana = Math.min(hero.stats.mana, hero.stats.maxMana);
      
      setHeroState({ ...hero });
    }
  }, [heroState]);
  
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
        <>
          <GameHUD
            hero={displayHero}
            gameTime={gameTime}
            radiantScore={radiantScore}
            direScore={direScore}
            isNight={isNight}
            onAbilityClick={handleAbilityClick}
            onLevelUpAbility={handleLevelUpAbility}
            onItemClick={handleItemClick}
            onShopClick={handleShopClick}
          />
          <Shop
            hero={displayHero}
            isOpen={isShopOpen}
            onClose={handleShopClose}
            onBuyItem={handleBuyItem}
            onSellItem={handleSellItem}
          />
        </>
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
