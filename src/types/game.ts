// Core game types for 8-bit Dota 2

// =====================
// POSITION & GEOMETRY
// =====================
export interface Vector2 {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// =====================
// TEAMS & FACTIONS
// =====================
export type Team = 'radiant' | 'dire' | 'neutral';

// =====================
// ATTRIBUTES
// =====================
export type PrimaryAttribute = 'strength' | 'agility' | 'intelligence';

export interface Attributes {
  strength: number;
  agility: number;
  intelligence: number;
}

// =====================
// DAMAGE TYPES
// =====================
export type DamageType = 'physical' | 'magical' | 'pure';

// =====================
// UNIT TYPES
// =====================
export type UnitType = 'hero' | 'creep' | 'tower' | 'building' | 'projectile';
export type CreepType = 'melee' | 'ranged' | 'siege';
export type AttackType = 'melee' | 'ranged';

// =====================
// CONTROL EFFECTS
// =====================
export type ControlEffect = 
  | 'stun'      // Cannot do anything
  | 'slow'      // Reduced movement/attack speed
  | 'silence'   // Cannot use abilities
  | 'disarm'    // Cannot attack
  | 'root'      // Cannot move but can attack/cast
  | 'sleep'     // Cannot do anything, removed on damage
  | 'hex';      // Transformed into harmless creature

// =====================
// ABILITY TARGETING
// =====================
export type AbilityTargetType = 
  | 'no_target'   // Activates immediately
  | 'point'       // Click on map location
  | 'unit'        // Click on unit
  | 'direction';  // Click to indicate direction

export type AbilityType = 'active' | 'passive';

// =====================
// BUFF/DEBUFF
// =====================
export interface Buff {
  id: string;
  name: string;
  duration: number;
  remainingDuration: number;
  isDebuff: boolean;
  stackable: boolean;
  maxStacks: number;
  currentStacks: number;
  effects: BuffEffect[];
  source: string; // Entity ID of the source
}

export interface BuffEffect {
  type: 'stat_modifier' | 'dot' | 'hot' | 'control';
  stat?: keyof UnitStats;
  value?: number;
  isPercentage?: boolean;
  damageType?: DamageType;
  controlEffect?: ControlEffect;
}

// =====================
// UNIT STATS
// =====================
export interface UnitStats {
  maxHealth: number;
  health: number;
  maxMana: number;
  mana: number;
  healthRegen: number;
  manaRegen: number;
  armor: number;
  magicResistance: number;
  attackDamage: number;
  attackSpeed: number;
  attackRange: number;
  movementSpeed: number;
}

// =====================
// HERO DEFINITION
// =====================
export interface HeroDefinition {
  id: string;
  name: string;
  title: string;
  primaryAttribute: PrimaryAttribute;
  attackType: AttackType;
  baseAttributes: Attributes;
  attributeGain: Attributes;
  baseStats: {
    health: number;
    mana: number;
    healthRegen: number;
    manaRegen: number;
    armor: number;
    magicResistance: number;
    attackDamage: [number, number]; // min, max
    attackSpeed: number;
    attackRange: number;
    movementSpeed: number;
  };
  abilities: string[]; // Ability IDs
  portrait: string;
  spriteSheet: string;
}

// =====================
// ABILITY DEFINITION
// =====================
export interface AbilityDefinition {
  id: string;
  name: string;
  description: string;
  abilityType: AbilityType;
  targetType: AbilityTargetType;
  maxLevel: number;
  manaCost: number[];      // Per level
  cooldown: number[];      // Per level
  castRange: number[];     // Per level
  radius?: number[];       // Per level (optional)
  damage?: number[];       // Per level (optional)
  duration?: number[];     // Per level (optional)
  effects: AbilityEffectDefinition[];
}

export interface AbilityEffectDefinition {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'summon' | 'teleport' | 'control';
  damageType?: DamageType;
  controlEffect?: ControlEffect;
  buffId?: string;
  value?: number[];  // Per level
}

// =====================
// ABILITY INSTANCE
// =====================
export interface AbilityInstance {
  definitionId: string;
  level: number;
  currentCooldown: number;
}

// =====================
// ITEM DEFINITION
// =====================
export type ItemCategory = 'consumable' | 'basic' | 'upgraded' | 'artifact';

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  cost: number;
  components?: string[]; // Item IDs required to build
  recipe?: number;       // Cost of recipe if needed
  charges?: number;      // For consumables
  isActive: boolean;
  cooldown?: number;
  stats?: Partial<UnitStats>;
  bonusAttributes?: Partial<Attributes>;
  passiveEffects?: ItemPassiveEffect[];
  activeEffect?: ItemActiveEffect;
}

export interface ItemPassiveEffect {
  type: 'on_attack' | 'on_hit' | 'aura';
  chance?: number;
  radius?: number;
  effect: BuffEffect;
}

export interface ItemActiveEffect {
  targetType: AbilityTargetType;
  castRange?: number;
  effects: BuffEffect[];
}

// =====================
// ITEM INSTANCE
// =====================
export interface ItemInstance {
  definitionId: string;
  charges?: number;
  currentCooldown: number;
}

// =====================
// CREEP DEFINITION
// =====================
export interface CreepDefinition {
  id: string;
  name: string;
  creepType: CreepType;
  attackType: AttackType;
  stats: UnitStats;
  goldReward: number;
  expReward: number;
  spriteSheet: string;
}

// =====================
// TOWER DEFINITION
// =====================
export interface TowerDefinition {
  tier: 1 | 2 | 3 | 4;  // T1, T2, T3, T4
  team: Team;
  lane: Lane;
  stats: UnitStats;
  backdoorProtection: boolean;
}

// =====================
// MAP & TILES
// =====================
export type Lane = 'top' | 'mid' | 'bot';

export type TileType = 
  | 'grass'
  | 'road'
  | 'water'
  | 'tree'
  | 'rock'
  | 'building'
  | 'void';

export interface Tile {
  type: TileType;
  walkable: boolean;
  visionBlocker: boolean;
  x: number;
  y: number;
}

// =====================
// RUNES
// =====================
export type RuneType = 
  | 'double_damage'
  | 'invisibility'
  | 'haste'
  | 'regeneration'
  | 'arcane';

export interface Rune {
  type: RuneType;
  position: Vector2;
  respawnTime: number;
}

// =====================
// GAME STATE
// =====================
export type GamePhase = 'menu' | 'hero_select' | 'loading' | 'playing' | 'paused' | 'ended';

export interface GameState {
  phase: GamePhase;
  gameTime: number;           // In seconds
  radiantScore: number;
  direScore: number;
  winner?: Team;
}

// =====================
// ENTITY BASE
// =====================
export interface EntityBase {
  id: string;
  type: UnitType;
  team: Team;
  position: Vector2;
  rotation: number;          // In radians
  isAlive: boolean;
  stats: UnitStats;
  buffs: Buff[];
}

// =====================
// HERO ENTITY
// =====================
export interface HeroEntity extends EntityBase {
  type: 'hero';
  definitionId: string;
  level: number;
  experience: number;
  gold: number;
  attributes: Attributes;
  abilities: AbilityInstance[];
  inventory: (ItemInstance | null)[];  // 6 slots
  respawnTime: number;
  abilityPoints: number;
  kills: number;
  deaths: number;
  assists: number;
}

// =====================
// CREEP ENTITY
// =====================
export interface CreepEntity extends EntityBase {
  type: 'creep';
  definitionId: string;
  lane?: Lane;
  waypoints: Vector2[];
  currentWaypointIndex: number;
}

// =====================
// TOWER ENTITY
// =====================
export interface TowerEntity extends EntityBase {
  type: 'tower';
  tier: 1 | 2 | 3 | 4;
  lane: Lane;
  hasBackdoorProtection: boolean;
}

// =====================
// BUILDING ENTITY
// =====================
export type BuildingType = 'ancient' | 'barracks_melee' | 'barracks_ranged' | 'fountain';

export interface BuildingEntity extends EntityBase {
  type: 'building';
  buildingType: BuildingType;
  lane?: Lane;
}

// =====================
// PROJECTILE ENTITY
// =====================
export interface ProjectileEntity {
  id: string;
  type: 'projectile';
  sourceId: string;
  targetId: string;
  position: Vector2;
  speed: number;
  damage: number;
  damageType: DamageType;
  sprite: string;
}

// =====================
// CAMERA
// =====================
export interface CameraState {
  position: Vector2;
  zoom: number;
  viewportWidth: number;
  viewportHeight: number;
}

// =====================
// INPUT
// =====================
export interface InputState {
  mousePosition: Vector2;
  mouseWorldPosition: Vector2;
  leftClick: boolean;
  rightClick: boolean;
  keys: Record<string, boolean>;
}

// =====================
// SPRITE ANIMATION
// =====================
export type AnimationState = 'idle' | 'walk' | 'attack' | 'cast' | 'death';
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface SpriteAnimation {
  state: AnimationState;
  direction: Direction;
  currentFrame: number;
  frameCount: number;
  frameTime: number;
  elapsedTime: number;
}

// =====================
// PATHFINDING
// =====================
export interface PathNode {
  x: number;
  y: number;
  g: number;  // Cost from start
  h: number;  // Heuristic to end
  f: number;  // g + h
  parent: PathNode | null;
}

// =====================
// EXPERIENCE TABLE
// =====================
export const EXPERIENCE_TABLE: number[] = [
  0,      // Level 1
  200,    // Level 2
  500,    // Level 3
  900,    // Level 4
  1400,   // Level 5
  2000,   // Level 6
  2700,   // Level 7
  3500,   // Level 8
  4400,   // Level 9
  5400,   // Level 10
  6500,   // Level 11
  7700,   // Level 12
  9000,   // Level 13
  10400,  // Level 14
  11900,  // Level 15
  13500,  // Level 16
  15200,  // Level 17
  17000,  // Level 18
  18900,  // Level 19
  20900,  // Level 20
  23000,  // Level 21
  25200,  // Level 22
  27500,  // Level 23
  29900,  // Level 24
  32400,  // Level 25
];

// =====================
// GAME CONSTANTS
// =====================
export const GAME_CONSTANTS = {
  TILE_SIZE: 16,
  MAP_WIDTH: 128,
  MAP_HEIGHT: 128,
  VIEWPORT_TILES_X: 20,
  VIEWPORT_TILES_Y: 15,
  CREEP_WAVE_INTERVAL: 30,    // seconds
  RUNE_SPAWN_INTERVAL: 120,   // seconds
  GOLD_PER_SECOND: 1,
  STRENGTH_HP_BONUS: 22,
  STRENGTH_REGEN_BONUS: 0.1,
  AGILITY_ARMOR_BONUS: 1/6,   // ~0.167 armor per agi
  AGILITY_ATTACK_SPEED_BONUS: 1,
  INTELLIGENCE_MANA_BONUS: 12,
  INTELLIGENCE_REGEN_BONUS: 0.05,
  MAX_LEVEL: 25,
  INVENTORY_SLOTS: 6,
  FPS: 60,
};
