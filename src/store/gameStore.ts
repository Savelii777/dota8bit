import { create } from 'zustand';
import {
  GameState,
  GamePhase,
  HeroEntity,
  CreepEntity,
  TowerEntity,
  BuildingEntity,
  ProjectileEntity,
  CameraState,
  Team,
  Vector2,
  GAME_CONSTANTS,
} from '@/types';

// =====================
// GAME STORE STATE
// =====================
interface GameStoreState {
  // Game state
  gameState: GameState;
  
  // Entities
  heroes: Map<string, HeroEntity>;
  creeps: Map<string, CreepEntity>;
  towers: Map<string, TowerEntity>;
  buildings: Map<string, BuildingEntity>;
  projectiles: Map<string, ProjectileEntity>;
  
  // Camera
  camera: CameraState;
  
  // Player
  playerId: string | null;
  selectedHeroId: string | null;
  
  // UI State
  isShopOpen: boolean;
  selectedAbilityIndex: number | null;
  hoveredEntityId: string | null;
  
  // Actions
  setGamePhase: (phase: GamePhase) => void;
  updateGameTime: (deltaTime: number) => void;
  
  // Entity actions
  addHero: (hero: HeroEntity) => void;
  updateHero: (id: string, updates: Partial<HeroEntity>) => void;
  removeHero: (id: string) => void;
  
  addCreep: (creep: CreepEntity) => void;
  updateCreep: (id: string, updates: Partial<CreepEntity>) => void;
  removeCreep: (id: string) => void;
  
  addTower: (tower: TowerEntity) => void;
  updateTower: (id: string, updates: Partial<TowerEntity>) => void;
  removeTower: (id: string) => void;
  
  addBuilding: (building: BuildingEntity) => void;
  updateBuilding: (id: string, updates: Partial<BuildingEntity>) => void;
  removeBuilding: (id: string) => void;
  
  addProjectile: (projectile: ProjectileEntity) => void;
  removeProjectile: (id: string) => void;
  
  // Camera actions
  setCameraPosition: (position: Vector2) => void;
  setCameraZoom: (zoom: number) => void;
  
  // Player actions
  setPlayerId: (id: string) => void;
  selectHero: (id: string) => void;
  
  // UI actions
  toggleShop: () => void;
  selectAbility: (index: number | null) => void;
  setHoveredEntity: (id: string | null) => void;
  
  // Score actions
  incrementScore: (team: Team) => void;
  setWinner: (team: Team) => void;
  
  // Reset
  resetGame: () => void;
}

// Initial state
const initialGameState: GameState = {
  phase: 'menu',
  gameTime: 0,
  radiantScore: 0,
  direScore: 0,
};

const initialCameraState: CameraState = {
  position: { x: 0, y: 0 },
  zoom: 1,
  viewportWidth: GAME_CONSTANTS.VIEWPORT_TILES_X * GAME_CONSTANTS.TILE_SIZE,
  viewportHeight: GAME_CONSTANTS.VIEWPORT_TILES_Y * GAME_CONSTANTS.TILE_SIZE,
};

// =====================
// GAME STORE
// =====================
export const useGameStore = create<GameStoreState>((set) => ({
  // Initial state
  gameState: initialGameState,
  heroes: new Map(),
  creeps: new Map(),
  towers: new Map(),
  buildings: new Map(),
  projectiles: new Map(),
  camera: initialCameraState,
  playerId: null,
  selectedHeroId: null,
  isShopOpen: false,
  selectedAbilityIndex: null,
  hoveredEntityId: null,
  
  // Game state actions
  setGamePhase: (phase) =>
    set((state) => ({
      gameState: { ...state.gameState, phase },
    })),
  
  updateGameTime: (deltaTime) =>
    set((state) => ({
      gameState: { ...state.gameState, gameTime: state.gameState.gameTime + deltaTime },
    })),
  
  // Hero actions
  addHero: (hero) =>
    set((state) => {
      const newHeroes = new Map(state.heroes);
      newHeroes.set(hero.id, hero);
      return { heroes: newHeroes };
    }),
  
  updateHero: (id, updates) =>
    set((state) => {
      const hero = state.heroes.get(id);
      if (!hero) return state;
      const newHeroes = new Map(state.heroes);
      newHeroes.set(id, { ...hero, ...updates });
      return { heroes: newHeroes };
    }),
  
  removeHero: (id) =>
    set((state) => {
      const newHeroes = new Map(state.heroes);
      newHeroes.delete(id);
      return { heroes: newHeroes };
    }),
  
  // Creep actions
  addCreep: (creep) =>
    set((state) => {
      const newCreeps = new Map(state.creeps);
      newCreeps.set(creep.id, creep);
      return { creeps: newCreeps };
    }),
  
  updateCreep: (id, updates) =>
    set((state) => {
      const creep = state.creeps.get(id);
      if (!creep) return state;
      const newCreeps = new Map(state.creeps);
      newCreeps.set(id, { ...creep, ...updates });
      return { creeps: newCreeps };
    }),
  
  removeCreep: (id) =>
    set((state) => {
      const newCreeps = new Map(state.creeps);
      newCreeps.delete(id);
      return { creeps: newCreeps };
    }),
  
  // Tower actions
  addTower: (tower) =>
    set((state) => {
      const newTowers = new Map(state.towers);
      newTowers.set(tower.id, tower);
      return { towers: newTowers };
    }),
  
  updateTower: (id, updates) =>
    set((state) => {
      const tower = state.towers.get(id);
      if (!tower) return state;
      const newTowers = new Map(state.towers);
      newTowers.set(id, { ...tower, ...updates });
      return { towers: newTowers };
    }),
  
  removeTower: (id) =>
    set((state) => {
      const newTowers = new Map(state.towers);
      newTowers.delete(id);
      return { towers: newTowers };
    }),
  
  // Building actions
  addBuilding: (building) =>
    set((state) => {
      const newBuildings = new Map(state.buildings);
      newBuildings.set(building.id, building);
      return { buildings: newBuildings };
    }),
  
  updateBuilding: (id, updates) =>
    set((state) => {
      const building = state.buildings.get(id);
      if (!building) return state;
      const newBuildings = new Map(state.buildings);
      newBuildings.set(id, { ...building, ...updates });
      return { buildings: newBuildings };
    }),
  
  removeBuilding: (id) =>
    set((state) => {
      const newBuildings = new Map(state.buildings);
      newBuildings.delete(id);
      return { buildings: newBuildings };
    }),
  
  // Projectile actions
  addProjectile: (projectile) =>
    set((state) => {
      const newProjectiles = new Map(state.projectiles);
      newProjectiles.set(projectile.id, projectile);
      return { projectiles: newProjectiles };
    }),
  
  removeProjectile: (id) =>
    set((state) => {
      const newProjectiles = new Map(state.projectiles);
      newProjectiles.delete(id);
      return { projectiles: newProjectiles };
    }),
  
  // Camera actions
  setCameraPosition: (position) =>
    set((state) => ({
      camera: { ...state.camera, position },
    })),
  
  setCameraZoom: (zoom) =>
    set((state) => ({
      camera: { ...state.camera, zoom: Math.max(0.5, Math.min(2, zoom)) },
    })),
  
  // Player actions
  setPlayerId: (id) => set({ playerId: id }),
  selectHero: (id) => set({ selectedHeroId: id }),
  
  // UI actions
  toggleShop: () => set((state) => ({ isShopOpen: !state.isShopOpen })),
  selectAbility: (index) => set({ selectedAbilityIndex: index }),
  setHoveredEntity: (id) => set({ hoveredEntityId: id }),
  
  // Score actions
  incrementScore: (team) =>
    set((state) => ({
      gameState: {
        ...state.gameState,
        radiantScore: team === 'radiant' ? state.gameState.radiantScore + 1 : state.gameState.radiantScore,
        direScore: team === 'dire' ? state.gameState.direScore + 1 : state.gameState.direScore,
      },
    })),
  
  setWinner: (team) =>
    set((state) => ({
      gameState: { ...state.gameState, winner: team, phase: 'ended' },
    })),
  
  // Reset
  resetGame: () =>
    set({
      gameState: initialGameState,
      heroes: new Map(),
      creeps: new Map(),
      towers: new Map(),
      buildings: new Map(),
      projectiles: new Map(),
      camera: initialCameraState,
      playerId: null,
      selectedHeroId: null,
      isShopOpen: false,
      selectedAbilityIndex: null,
      hoveredEntityId: null,
    }),
}));
