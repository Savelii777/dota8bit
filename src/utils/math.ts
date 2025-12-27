import { Vector2 } from '@/types';

// =====================
// VECTOR MATH
// =====================
export function vectorAdd(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vectorSubtract(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function vectorMultiply(v: Vector2, scalar: number): Vector2 {
  return { x: v.x * scalar, y: v.y * scalar };
}

export function vectorMagnitude(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function vectorNormalize(v: Vector2): Vector2 {
  const mag = vectorMagnitude(v);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

export function vectorDistance(a: Vector2, b: Vector2): number {
  return vectorMagnitude(vectorSubtract(b, a));
}

export function vectorLerp(a: Vector2, b: Vector2, t: number): Vector2 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

export function vectorAngle(v: Vector2): number {
  return Math.atan2(v.y, v.x);
}

export function vectorFromAngle(angle: number, magnitude: number = 1): Vector2 {
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  };
}

// =====================
// NUMBER UTILITIES
// =====================
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

// =====================
// DAMAGE CALCULATIONS
// =====================
export function calculatePhysicalDamageReduction(armor: number): number {
  // Formula: multiplier = 1 - (0.06 * armor) / (1 + 0.06 * |armor|)
  return 1 - (0.06 * armor) / (1 + 0.06 * Math.abs(armor));
}

export function calculateMagicalDamageReduction(magicResistance: number): number {
  return 1 - magicResistance / 100;
}

export function calculateDamage(
  baseDamage: number,
  damageType: 'physical' | 'magical' | 'pure',
  armor: number,
  magicResistance: number
): number {
  switch (damageType) {
    case 'physical':
      return baseDamage * calculatePhysicalDamageReduction(armor);
    case 'magical':
      return baseDamage * calculateMagicalDamageReduction(magicResistance);
    case 'pure':
      return baseDamage;
    default:
      return baseDamage;
  }
}

// =====================
// ATTRIBUTE CALCULATIONS
// =====================
import { Attributes, UnitStats, GAME_CONSTANTS } from '@/types';

export function calculateDerivedStats(
  baseStats: UnitStats,
  attributes: Attributes,
  primaryAttribute: 'strength' | 'agility' | 'intelligence'
): UnitStats {
  const { STRENGTH_HP_BONUS, STRENGTH_REGEN_BONUS, AGILITY_ARMOR_BONUS, INTELLIGENCE_MANA_BONUS, INTELLIGENCE_REGEN_BONUS } = GAME_CONSTANTS;
  
  // Primary attribute adds to attack damage
  let primaryAttrValue = 0;
  switch (primaryAttribute) {
    case 'strength':
      primaryAttrValue = attributes.strength;
      break;
    case 'agility':
      primaryAttrValue = attributes.agility;
      break;
    case 'intelligence':
      primaryAttrValue = attributes.intelligence;
      break;
  }
  
  return {
    ...baseStats,
    maxHealth: baseStats.maxHealth + attributes.strength * STRENGTH_HP_BONUS,
    health: baseStats.health,
    maxMana: baseStats.maxMana + attributes.intelligence * INTELLIGENCE_MANA_BONUS,
    mana: baseStats.mana,
    healthRegen: baseStats.healthRegen + attributes.strength * STRENGTH_REGEN_BONUS,
    manaRegen: baseStats.manaRegen + attributes.intelligence * INTELLIGENCE_REGEN_BONUS,
    armor: baseStats.armor + attributes.agility * AGILITY_ARMOR_BONUS,
    attackDamage: baseStats.attackDamage + primaryAttrValue,
  };
}

// =====================
// ID GENERATION
// =====================
let idCounter = 0;

export function generateId(prefix: string = 'entity'): string {
  idCounter++;
  return `${prefix}_${idCounter}_${Date.now()}`;
}

export function resetIdCounter(): void {
  idCounter = 0;
}

// =====================
// TIME FORMATTING
// =====================
export function formatGameTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// =====================
// DIRECTION UTILITIES
// =====================
import { Direction } from '@/types';

export function getDirectionFromAngle(angle: number): Direction {
  // Normalize angle to 0-2π
  const normalized = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  
  // Up: -π/4 to π/4 (around 0)
  // Right: π/4 to 3π/4
  // Down: 3π/4 to 5π/4
  // Left: 5π/4 to 7π/4
  
  if (normalized > 7 * Math.PI / 4 || normalized <= Math.PI / 4) {
    return 'right';
  } else if (normalized > Math.PI / 4 && normalized <= 3 * Math.PI / 4) {
    return 'down';
  } else if (normalized > 3 * Math.PI / 4 && normalized <= 5 * Math.PI / 4) {
    return 'left';
  } else {
    return 'up';
  }
}

export function getDirectionFromVector(v: Vector2): Direction {
  if (Math.abs(v.x) > Math.abs(v.y)) {
    return v.x > 0 ? 'right' : 'left';
  } else {
    return v.y > 0 ? 'down' : 'up';
  }
}
