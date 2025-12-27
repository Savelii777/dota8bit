'use client';

import React, { useState, useMemo } from 'react';
import { HeroEntity, ItemDefinition, ItemCategory } from '@/types';
import { getAllItems, getItemsByCategory, getItemDefinition } from '@/game/data';
import { PixelPanel } from '../ui';

interface ShopProps {
  hero: HeroEntity;
  isOpen: boolean;
  onClose: () => void;
  onBuyItem: (itemId: string) => void;
  onSellItem: (slotIndex: number) => void;
}

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  consumable: 'CONSUMABLES',
  basic: 'BASIC',
  upgraded: 'UPGRADED',
  artifact: 'ARTIFACTS',
};

const CATEGORY_COLORS: Record<ItemCategory, string> = {
  consumable: 'border-green-500 bg-green-900',
  basic: 'border-gray-500 bg-gray-800',
  upgraded: 'border-blue-500 bg-blue-900',
  artifact: 'border-purple-500 bg-purple-900',
};

export function Shop({ hero, isOpen, onClose, onBuyItem, onSellItem }: ShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('basic');
  const [selectedItem, setSelectedItem] = useState<ItemDefinition | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const categories: ItemCategory[] = ['consumable', 'basic', 'upgraded', 'artifact'];
  
  const categoryItems = useMemo(() => {
    return getItemsByCategory(selectedCategory);
  }, [selectedCategory]);

  const canAfford = (item: ItemDefinition) => {
    return hero.gold >= item.cost;
  };

  const hasEmptySlot = () => {
    return hero.inventory.some(slot => slot === null);
  };

  const handleBuyItem = (item: ItemDefinition) => {
    if (canAfford(item) && hasEmptySlot()) {
      onBuyItem(item.id);
      setSelectedItem(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div 
        className="relative bg-gray-900 border-4 border-yellow-600 p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden"
        style={{ fontFamily: '"Press Start 2P", cursive, monospace' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b-4 border-gray-700 pb-4">
          <h2 className="text-yellow-400 text-xl">SHOP</h2>
          <div className="flex items-center gap-4">
            <span className="text-yellow-500 flex items-center gap-2">
              <span className="text-2xl">●</span>
              <span>{hero.gold}</span>
            </span>
            <button
              onClick={onClose}
              className="text-red-400 hover:text-red-300 text-xl px-2"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left side - Categories and Items */}
          <div className="flex-1">
            {/* Category tabs */}
            <div className="flex gap-2 mb-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedItem(null);
                  }}
                  className={`
                    px-3 py-2 border-2 text-xs transition-all
                    ${selectedCategory === cat 
                      ? 'border-yellow-400 bg-yellow-900 text-yellow-300' 
                      : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500'
                    }
                  `}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Items grid */}
            <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2 bg-gray-800 border-2 border-gray-700">
              {categoryItems.map((item) => {
                const affordable = canAfford(item);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    onDoubleClick={() => handleBuyItem(item)}
                    className={`
                      relative w-14 h-14 border-2 cursor-pointer transition-all
                      ${selectedItem?.id === item.id 
                        ? 'border-yellow-400 scale-110' 
                        : affordable 
                          ? `${CATEGORY_COLORS[item.category]} hover:border-yellow-300`
                          : 'border-red-800 bg-red-950 opacity-60'
                      }
                    `}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center p-1">
                      <span className="text-white text-center" style={{ fontSize: '6px' }}>
                        {item.name.substring(0, 6)}
                      </span>
                      <span 
                        className={`text-xs mt-1 ${affordable ? 'text-yellow-400' : 'text-red-400'}`}
                        style={{ fontSize: '6px' }}
                      >
                        {item.cost}
                      </span>
                    </div>
                    {item.isActive && (
                      <div className="absolute top-0 right-0 w-2 h-2 bg-blue-400"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Buy button */}
            {selectedItem && (
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => handleBuyItem(selectedItem)}
                  disabled={!canAfford(selectedItem) || !hasEmptySlot()}
                  className={`
                    px-6 py-3 border-4 text-sm
                    ${canAfford(selectedItem) && hasEmptySlot()
                      ? 'border-green-600 bg-green-700 text-white hover:bg-green-600'
                      : 'border-gray-600 bg-gray-700 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  BUY FOR {selectedItem.cost}
                </button>
              </div>
            )}
          </div>

          {/* Right side - Item details and Inventory */}
          <div className="w-64">
            {/* Selected item details */}
            <PixelPanel title={selectedItem?.name || 'SELECT ITEM'}>
              {selectedItem ? (
                <div className="text-xs space-y-2">
                  <p className="text-gray-400">{selectedItem.description}</p>
                  <p className="text-yellow-400">Cost: {selectedItem.cost}</p>
                  
                  {selectedItem.stats && (
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <p className="text-green-400 mb-1">Stats:</p>
                      {Object.entries(selectedItem.stats).map(([stat, value]) => (
                        <p key={stat} className="text-white" style={{ fontSize: '8px' }}>
                          +{value} {stat.replace(/([A-Z])/g, ' $1').toUpperCase()}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {selectedItem.bonusAttributes && (
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <p className="text-blue-400 mb-1">Attributes:</p>
                      {selectedItem.bonusAttributes.strength && (
                        <p className="text-red-400" style={{ fontSize: '8px' }}>
                          +{selectedItem.bonusAttributes.strength} STR
                        </p>
                      )}
                      {selectedItem.bonusAttributes.agility && (
                        <p className="text-green-400" style={{ fontSize: '8px' }}>
                          +{selectedItem.bonusAttributes.agility} AGI
                        </p>
                      )}
                      {selectedItem.bonusAttributes.intelligence && (
                        <p className="text-blue-400" style={{ fontSize: '8px' }}>
                          +{selectedItem.bonusAttributes.intelligence} INT
                        </p>
                      )}
                    </div>
                  )}

                  {selectedItem.components && selectedItem.components.length > 0 && (
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <p className="text-purple-400 mb-1">Requires:</p>
                      {selectedItem.components.map((compId, idx) => {
                        const comp = getItemDefinition(compId);
                        return (
                          <p key={idx} className="text-gray-300" style={{ fontSize: '8px' }}>
                            • {comp?.name || compId}
                          </p>
                        );
                      })}
                      {selectedItem.recipe && (
                        <p className="text-yellow-400 mt-1" style={{ fontSize: '8px' }}>
                          Recipe: {selectedItem.recipe}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-xs">Click an item to view details</p>
              )}
            </PixelPanel>

            {/* Inventory */}
            <div className="mt-4">
              <PixelPanel title="INVENTORY">
                <div className="grid grid-cols-3 gap-2">
                  {hero.inventory.map((item, index) => {
                    const def = item ? getItemDefinition(item.definitionId) : null;
                    return (
                      <div
                        key={index}
                        onMouseEnter={() => setHoveredSlot(index)}
                        onMouseLeave={() => setHoveredSlot(null)}
                        className={`
                          relative w-14 h-14 border-2 
                          ${item 
                            ? 'bg-amber-800 border-amber-600 cursor-pointer hover:border-red-400' 
                            : 'bg-gray-800 border-gray-600'
                          }
                        `}
                      >
                        {item && def && (
                          <>
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-white text-center" style={{ fontSize: '6px' }}>
                                {def.name.substring(0, 5)}
                              </span>
                            </div>
                            {hoveredSlot === index && (
                              <button
                                onClick={() => onSellItem(index)}
                                className="absolute inset-0 bg-red-600 bg-opacity-80 flex items-center justify-center"
                              >
                                <span className="text-white" style={{ fontSize: '8px' }}>
                                  SELL
                                </span>
                              </button>
                            )}
                          </>
                        )}
                        <div 
                          className="absolute -top-1 -right-1 bg-gray-900 border border-gray-600 px-1 text-white"
                          style={{ fontSize: '6px' }}
                        >
                          {index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </PixelPanel>
            </div>
          </div>
        </div>

        {/* Quick tips */}
        <div className="mt-4 text-gray-500 text-xs border-t border-gray-700 pt-2">
          <p>• Double-click to buy • Click inventory item to sell • Press B to toggle shop</p>
        </div>
      </div>
    </div>
  );
}
