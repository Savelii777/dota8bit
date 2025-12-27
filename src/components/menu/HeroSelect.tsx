'use client';

import React from 'react';
import Link from 'next/link';
import { PixelButton, PixelPanel } from '../ui';
import { getAllHeroes } from '@/game/data';

interface HeroSelectProps {
  onHeroSelect: (heroId: string) => void;
  selectedHeroId: string | null;
}

export function HeroSelect({ onHeroSelect, selectedHeroId }: HeroSelectProps) {
  const heroes = getAllHeroes();
  const selectedHero = selectedHeroId ? heroes.find(h => h.id === selectedHeroId) : null;
  
  const getAttributeColor = (attr: string) => {
    switch (attr) {
      case 'strength': return 'text-red-400';
      case 'agility': return 'text-green-400';
      case 'intelligence': return 'text-blue-400';
      default: return 'text-white';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 
          className="text-4xl text-yellow-400 mb-2 [text-shadow:3px_3px_0px_#000]"
          style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
        >
          SELECT YOUR HERO
        </h1>
      </div>
      
      <div className="flex gap-8 justify-center">
        {/* Hero Grid */}
        <div className="grid grid-cols-5 gap-4">
          {heroes.map((hero) => (
            <div
              key={hero.id}
              onClick={() => onHeroSelect(hero.id)}
              className={`
                w-24 h-24 border-4 cursor-pointer transition-all
                [image-rendering:pixelated]
                ${selectedHeroId === hero.id 
                  ? 'border-yellow-400 bg-yellow-400/20 scale-110' 
                  : 'border-gray-600 bg-gray-800 hover:border-gray-400'
                }
              `}
            >
              <div className="w-full h-full flex flex-col items-center justify-center p-1">
                <div className={`text-2xl ${getAttributeColor(hero.primaryAttribute)}`}>
                  {hero.primaryAttribute === 'strength' ? '💪' : 
                   hero.primaryAttribute === 'agility' ? '🏃' : '🧠'}
                </div>
                <span 
                  className="text-white text-center mt-1"
                  style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '6px' }}
                >
                  {hero.name}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Hero Info Panel */}
        <div className="w-80">
          {selectedHero ? (
            <PixelPanel title={selectedHero.name}>
              <div 
                className="text-gray-400 mb-4"
                style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '10px' }}
              >
                {selectedHero.title}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span 
                    className="text-gray-400"
                    style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}
                  >
                    PRIMARY:
                  </span>
                  <span 
                    className={`${getAttributeColor(selectedHero.primaryAttribute)} uppercase`}
                    style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}
                  >
                    {selectedHero.primaryAttribute}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span 
                    className="text-gray-400"
                    style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}
                  >
                    ATTACK:
                  </span>
                  <span 
                    className="text-white uppercase"
                    style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}
                  >
                    {selectedHero.attackType}
                  </span>
                </div>
                
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-red-400" style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}>
                      STR
                    </span>
                    <span className="text-white" style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}>
                      {selectedHero.baseAttributes.strength} (+{selectedHero.attributeGain.strength})
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-green-400" style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}>
                      AGI
                    </span>
                    <span className="text-white" style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}>
                      {selectedHero.baseAttributes.agility} (+{selectedHero.attributeGain.agility})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400" style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}>
                      INT
                    </span>
                    <span className="text-white" style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}>
                      {selectedHero.baseAttributes.intelligence} (+{selectedHero.attributeGain.intelligence})
                    </span>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400" style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}>
                      DAMAGE
                    </span>
                    <span className="text-white" style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}>
                      {selectedHero.baseStats.attackDamage[0]}-{selectedHero.baseStats.attackDamage[1]}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400" style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}>
                      ARMOR
                    </span>
                    <span className="text-white" style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}>
                      {selectedHero.baseStats.armor}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400" style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}>
                      SPEED
                    </span>
                    <span className="text-white" style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '8px' }}>
                      {selectedHero.baseStats.movementSpeed}
                    </span>
                  </div>
                </div>
              </div>
              
              <Link href={`/game?hero=${selectedHero.id}`}>
                <PixelButton variant="primary" size="md" className="w-full">
                  PICK HERO
                </PixelButton>
              </Link>
            </PixelPanel>
          ) : (
            <PixelPanel title="No Hero Selected">
              <p 
                className="text-gray-400 text-center"
                style={{ fontFamily: '"Press Start 2P", cursive, monospace', fontSize: '10px' }}
              >
                Click on a hero to view details
              </p>
            </PixelPanel>
          )}
        </div>
      </div>
      
      {/* Back button */}
      <div className="fixed bottom-8 left-8">
        <Link href="/">
          <PixelButton variant="secondary" size="md">
            BACK
          </PixelButton>
        </Link>
      </div>
    </div>
  );
}
