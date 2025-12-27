import { Camera } from './Camera';
import { InputHandler, InputEvent } from './InputHandler';
import { Pathfinding } from './Pathfinding';
import { CollisionSystem } from './CollisionSystem';
import {
  Vector2,
  GAME_CONSTANTS,
  EntityBase,
  HeroEntity,
  CreepEntity,
  TowerEntity,
  BuildingEntity,
  ProjectileEntity,
  Team,
} from '@/types';
import { vectorDistance, vectorNormalize, vectorSubtract, vectorMultiply, vectorAdd } from '@/utils';

export type GameEngineEventCallback = (event: GameEngineEvent) => void;

export interface GameEngineEvent {
  type: 'heroMove' | 'heroAttack' | 'abilityUse' | 'entityDeath' | 'goldGained' | 'expGained';
  data?: Record<string, unknown>;
}

export class GameEngine {
  private _canvas: HTMLCanvasElement | null = null;
  private _ctx: CanvasRenderingContext2D | null = null;
  private _camera: Camera;
  private _inputHandler: InputHandler;
  private _pathfinding: Pathfinding;
  private _collisionSystem: CollisionSystem;
  
  private _isRunning: boolean = false;
  private _isPaused: boolean = false;
  private _lastTime: number = 0;
  private _gameTime: number = 0;
  private _deltaTime: number = 0;
  private _animationFrameId: number | null = null;
  
  // Entities
  private _heroes: Map<string, HeroEntity> = new Map();
  private _creeps: Map<string, CreepEntity> = new Map();
  private _towers: Map<string, TowerEntity> = new Map();
  private _buildings: Map<string, BuildingEntity> = new Map();
  private _projectiles: Map<string, ProjectileEntity> = new Map();
  
  // Player
  private _playerHeroId: string | null = null;
  private _playerTeam: Team = 'radiant';
  
  // Movement
  private _heroMovePath: Map<string, Vector2[]> = new Map();
  private _heroMoveTarget: Map<string, Vector2 | null> = new Map();
  
  // Event listeners
  private _eventListeners: GameEngineEventCallback[] = [];
  
  // Timers
  private _creepWaveTimer: number = 0;
  private _goldTimer: number = 0;
  
  constructor() {
    this._camera = new Camera();
    this._inputHandler = new InputHandler();
    this._pathfinding = new Pathfinding();
    this._collisionSystem = new CollisionSystem(
      GAME_CONSTANTS.MAP_WIDTH * GAME_CONSTANTS.TILE_SIZE,
      GAME_CONSTANTS.MAP_HEIGHT * GAME_CONSTANTS.TILE_SIZE
    );
  }
  
  init(canvas: HTMLCanvasElement): void {
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    
    if (!this._ctx) {
      throw new Error('Failed to get 2D context');
    }
    
    // Set canvas size
    this._camera.setViewportSize(canvas.width, canvas.height);
    
    // Initialize input handler
    this._inputHandler.init(canvas, this._camera);
    this._inputHandler.addEventListener(this.handleInput.bind(this));
    
    // Set pixel-perfect rendering
    this._ctx.imageSmoothingEnabled = false;
  }
  
  destroy(): void {
    this.stop();
    this._inputHandler.destroy();
    this._heroes.clear();
    this._creeps.clear();
    this._towers.clear();
    this._buildings.clear();
    this._projectiles.clear();
  }
  
  start(): void {
    if (this._isRunning) return;
    
    this._isRunning = true;
    this._lastTime = performance.now();
    this.gameLoop();
  }
  
  stop(): void {
    this._isRunning = false;
    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }
  
  pause(): void {
    this._isPaused = true;
  }
  
  resume(): void {
    this._isPaused = false;
    this._lastTime = performance.now();
  }
  
  private gameLoop(): void {
    if (!this._isRunning) return;
    
    const currentTime = performance.now();
    this._deltaTime = (currentTime - this._lastTime) / 1000;
    this._lastTime = currentTime;
    
    // Cap delta time to prevent huge jumps
    this._deltaTime = Math.min(this._deltaTime, 0.1);
    
    if (!this._isPaused) {
      this.update(this._deltaTime);
    }
    
    this.render();
    
    this._animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }
  
  private update(deltaTime: number): void {
    this._gameTime += deltaTime;
    
    // Update camera
    this.updateCamera(deltaTime);
    
    // Update input world position
    this._inputHandler.updateWorldPosition();
    
    // Update entities
    this.updateHeroes(deltaTime);
    this.updateCreeps(deltaTime);
    this.updateProjectiles(deltaTime);
    
    // Update collision system
    this.updateCollisionSystem();
    
    // Update timers
    this.updateTimers(deltaTime);
  }
  
  private updateCamera(deltaTime: number): void {
    // Get player hero position
    const playerHero = this._playerHeroId ? this._heroes.get(this._playerHeroId) : null;
    
    if (playerHero) {
      // Camera follows player
      this._camera.setTarget({
        x: playerHero.position.x - this._camera.viewportWidth / 2,
        y: playerHero.position.y - this._camera.viewportHeight / 2,
      });
    }
    
    // Handle camera pan with WASD
    const panSpeed = 500;
    let panX = 0;
    let panY = 0;
    
    if (this._inputHandler.isKeyPressed('w') || this._inputHandler.isKeyPressed('arrowup')) {
      panY -= panSpeed * deltaTime;
    }
    if (this._inputHandler.isKeyPressed('s') || this._inputHandler.isKeyPressed('arrowdown')) {
      panY += panSpeed * deltaTime;
    }
    if (this._inputHandler.isKeyPressed('a') || this._inputHandler.isKeyPressed('arrowleft')) {
      panX -= panSpeed * deltaTime;
    }
    if (this._inputHandler.isKeyPressed('d') || this._inputHandler.isKeyPressed('arrowright')) {
      panX += panSpeed * deltaTime;
    }
    
    if (panX !== 0 || panY !== 0) {
      this._camera.pan({ x: panX, y: panY });
    }
    
    // Center on hero with space
    if (this._inputHandler.isKeyPressed(' ') && playerHero) {
      this._camera.centerOn(playerHero.position);
    }
    
    this._camera.update(deltaTime);
  }
  
  private updateHeroes(deltaTime: number): void {
    for (const [id, hero] of this._heroes) {
      if (!hero.isAlive) {
        // Update respawn timer
        if (hero.respawnTime > 0) {
          hero.respawnTime -= deltaTime;
          if (hero.respawnTime <= 0) {
            this.respawnHero(id);
          }
        }
        continue;
      }
      
      // Update movement
      this.updateHeroMovement(id, hero, deltaTime);
      
      // Update regeneration
      hero.stats.health = Math.min(
        hero.stats.maxHealth,
        hero.stats.health + hero.stats.healthRegen * deltaTime
      );
      hero.stats.mana = Math.min(
        hero.stats.maxMana,
        hero.stats.mana + hero.stats.manaRegen * deltaTime
      );
      
      // Update ability cooldowns
      for (const ability of hero.abilities) {
        if (ability.currentCooldown > 0) {
          ability.currentCooldown = Math.max(0, ability.currentCooldown - deltaTime);
        }
      }
      
      // Update item cooldowns
      for (const item of hero.inventory) {
        if (item && item.currentCooldown > 0) {
          item.currentCooldown = Math.max(0, item.currentCooldown - deltaTime);
        }
      }
    }
  }
  
  private updateHeroMovement(id: string, hero: HeroEntity, deltaTime: number): void {
    const path = this._heroMovePath.get(id);
    
    if (!path || path.length === 0) return;
    
    const target = path[0];
    const direction = vectorSubtract(target, hero.position);
    const distance = vectorDistance(hero.position, target);
    const moveDistance = hero.stats.movementSpeed * deltaTime;
    
    if (distance <= moveDistance) {
      // Reached waypoint
      hero.position = { ...target };
      path.shift();
      
      if (path.length === 0) {
        this._heroMovePath.delete(id);
        this._heroMoveTarget.delete(id);
      }
    } else {
      // Move towards waypoint
      const normalizedDir = vectorNormalize(direction);
      hero.position = vectorAdd(
        hero.position,
        vectorMultiply(normalizedDir, moveDistance)
      );
      hero.rotation = Math.atan2(normalizedDir.y, normalizedDir.x);
    }
  }
  
  private updateCreeps(deltaTime: number): void {
    for (const [id, creep] of this._creeps) {
      if (!creep.isAlive) {
        this._creeps.delete(id);
        continue;
      }
      
      // Move towards next waypoint
      if (creep.waypoints.length > creep.currentWaypointIndex) {
        const target = creep.waypoints[creep.currentWaypointIndex];
        const direction = vectorSubtract(target, creep.position);
        const distance = vectorDistance(creep.position, target);
        const moveDistance = creep.stats.movementSpeed * deltaTime;
        
        if (distance <= moveDistance) {
          creep.position = { ...target };
          creep.currentWaypointIndex++;
        } else {
          const normalizedDir = vectorNormalize(direction);
          creep.position = vectorAdd(
            creep.position,
            vectorMultiply(normalizedDir, moveDistance)
          );
          creep.rotation = Math.atan2(normalizedDir.y, normalizedDir.x);
        }
      }
    }
  }
  
  private updateProjectiles(deltaTime: number): void {
    const projectilesToRemove: string[] = [];
    
    for (const [id, projectile] of this._projectiles) {
      // Find target
      let targetPos: Vector2 | null = null;
      
      // Check heroes
      for (const hero of this._heroes.values()) {
        if (hero.id === projectile.targetId) {
          targetPos = hero.position;
          break;
        }
      }
      
      // Check creeps
      if (!targetPos) {
        for (const creep of this._creeps.values()) {
          if (creep.id === projectile.targetId) {
            targetPos = creep.position;
            break;
          }
        }
      }
      
      if (!targetPos) {
        projectilesToRemove.push(id);
        continue;
      }
      
      // Move towards target
      const direction = vectorSubtract(targetPos, projectile.position);
      const distance = vectorDistance(projectile.position, targetPos);
      const moveDistance = projectile.speed * deltaTime;
      
      if (distance <= moveDistance) {
        // Hit target
        this.onProjectileHit(projectile);
        projectilesToRemove.push(id);
      } else {
        const normalizedDir = vectorNormalize(direction);
        projectile.position = vectorAdd(
          projectile.position,
          vectorMultiply(normalizedDir, moveDistance)
        );
      }
    }
    
    for (const id of projectilesToRemove) {
      this._projectiles.delete(id);
    }
  }
  
  private onProjectileHit(projectile: ProjectileEntity): void {
    // Apply damage to target
    // This would be expanded with proper damage calculation
  }
  
  private updateCollisionSystem(): void {
    this._collisionSystem.clear();
    
    for (const hero of this._heroes.values()) {
      if (hero.isAlive) {
        this._collisionSystem.addEntity(hero);
      }
    }
    
    for (const creep of this._creeps.values()) {
      if (creep.isAlive) {
        this._collisionSystem.addEntity(creep);
      }
    }
    
    for (const tower of this._towers.values()) {
      if (tower.isAlive) {
        this._collisionSystem.addEntity(tower);
      }
    }
    
    for (const building of this._buildings.values()) {
      if (building.isAlive) {
        this._collisionSystem.addEntity(building);
      }
    }
  }
  
  private updateTimers(deltaTime: number): void {
    // Gold per second
    this._goldTimer += deltaTime;
    if (this._goldTimer >= 1) {
      this._goldTimer -= 1;
      for (const hero of this._heroes.values()) {
        hero.gold += GAME_CONSTANTS.GOLD_PER_SECOND;
      }
    }
    
    // Creep wave timer
    this._creepWaveTimer += deltaTime;
    if (this._creepWaveTimer >= GAME_CONSTANTS.CREEP_WAVE_INTERVAL) {
      this._creepWaveTimer -= GAME_CONSTANTS.CREEP_WAVE_INTERVAL;
      this.spawnCreepWave();
    }
  }
  
  private spawnCreepWave(): void {
    // This would spawn creep waves on all lanes
    // Implementation would depend on map data
  }
  
  private respawnHero(id: string): void {
    const hero = this._heroes.get(id);
    if (!hero) return;
    
    hero.isAlive = true;
    hero.stats.health = hero.stats.maxHealth;
    hero.stats.mana = hero.stats.maxMana;
    
    // Move to fountain
    const fountainPos = hero.team === 'radiant' 
      ? { x: 5 * GAME_CONSTANTS.TILE_SIZE, y: (GAME_CONSTANTS.MAP_HEIGHT - 5) * GAME_CONSTANTS.TILE_SIZE }
      : { x: (GAME_CONSTANTS.MAP_WIDTH - 5) * GAME_CONSTANTS.TILE_SIZE, y: 5 * GAME_CONSTANTS.TILE_SIZE };
    
    hero.position = fountainPos;
  }
  
  private render(): void {
    if (!this._ctx || !this._canvas) return;
    
    // Clear canvas
    this._ctx.fillStyle = '#1a1a2e';
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    
    // Render map (placeholder grid)
    this.renderMap();
    
    // Render entities
    this.renderEntities();
    
    // Render UI elements (health bars, etc.)
    this.renderUI();
  }
  
  private renderMap(): void {
    if (!this._ctx) return;
    
    const tileSize = GAME_CONSTANTS.TILE_SIZE;
    const startTileX = Math.floor(this._camera.position.x / tileSize);
    const startTileY = Math.floor(this._camera.position.y / tileSize);
    const tilesX = Math.ceil(this._camera.viewportWidth / tileSize) + 1;
    const tilesY = Math.ceil(this._camera.viewportHeight / tileSize) + 1;
    
    for (let ty = startTileY; ty < startTileY + tilesY; ty++) {
      for (let tx = startTileX; tx < startTileX + tilesX; tx++) {
        if (tx < 0 || ty < 0 || tx >= GAME_CONSTANTS.MAP_WIDTH || ty >= GAME_CONSTANTS.MAP_HEIGHT) {
          continue;
        }
        
        const screenPos = this._camera.worldToScreen({
          x: tx * tileSize,
          y: ty * tileSize,
        });
        
        // Alternate tile colors for grass pattern
        const isLight = (tx + ty) % 2 === 0;
        this._ctx.fillStyle = isLight ? '#2d5a27' : '#234d20';
        this._ctx.fillRect(
          Math.floor(screenPos.x),
          Math.floor(screenPos.y),
          tileSize * this._camera.zoom,
          tileSize * this._camera.zoom
        );
      }
    }
  }
  
  private renderEntities(): void {
    if (!this._ctx) return;
    
    // Render towers
    for (const tower of this._towers.values()) {
      this.renderEntity(tower, '#666666', 24);
    }
    
    // Render buildings
    for (const building of this._buildings.values()) {
      this.renderEntity(building, '#888888', 32);
    }
    
    // Render creeps
    for (const creep of this._creeps.values()) {
      const color = creep.team === 'radiant' ? '#4CAF50' : '#f44336';
      this.renderEntity(creep, color, 12);
    }
    
    // Render heroes
    for (const hero of this._heroes.values()) {
      if (!hero.isAlive) continue;
      const color = hero.team === 'radiant' ? '#00ff00' : '#ff0000';
      this.renderEntity(hero, color, 16);
    }
    
    // Render projectiles
    for (const projectile of this._projectiles.values()) {
      const screenPos = this._camera.worldToScreen(projectile.position);
      this._ctx.fillStyle = '#ffff00';
      this._ctx.beginPath();
      this._ctx.arc(screenPos.x, screenPos.y, 4 * this._camera.zoom, 0, Math.PI * 2);
      this._ctx.fill();
    }
  }
  
  private renderEntity(entity: EntityBase, color: string, size: number): void {
    if (!this._ctx) return;
    
    const screenPos = this._camera.worldToScreen(entity.position);
    const scaledSize = size * this._camera.zoom;
    
    // Draw entity as colored rectangle (placeholder for sprite)
    this._ctx.fillStyle = color;
    this._ctx.fillRect(
      screenPos.x - scaledSize / 2,
      screenPos.y - scaledSize / 2,
      scaledSize,
      scaledSize
    );
    
    // Draw health bar
    const healthPercent = entity.stats.health / entity.stats.maxHealth;
    const barWidth = scaledSize;
    const barHeight = 4 * this._camera.zoom;
    const barY = screenPos.y - scaledSize / 2 - barHeight - 2;
    
    // Background
    this._ctx.fillStyle = '#333333';
    this._ctx.fillRect(screenPos.x - barWidth / 2, barY, barWidth, barHeight);
    
    // Health
    this._ctx.fillStyle = healthPercent > 0.3 ? '#00ff00' : '#ff0000';
    this._ctx.fillRect(screenPos.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
  }
  
  private renderUI(): void {
    // UI is rendered by React components
  }
  
  // Input handling
  private handleInput(event: InputEvent): void {
    if (!this._playerHeroId) return;
    const hero = this._heroes.get(this._playerHeroId);
    if (!hero || !hero.isAlive) return;
    
    switch (event.type) {
      case 'rightClick':
        // Move or attack-move
        if (event.worldPosition) {
          this.moveHeroTo(this._playerHeroId, event.worldPosition);
        }
        break;
        
      case 'keyDown':
        // Ability hotkeys
        if (event.key === 'q') {
          this.useAbility(this._playerHeroId, 0);
        } else if (event.key === 'w') {
          this.useAbility(this._playerHeroId, 1);
        } else if (event.key === 'e') {
          this.useAbility(this._playerHeroId, 2);
        } else if (event.key === 'r') {
          this.useAbility(this._playerHeroId, 3);
        }
        // Item hotkeys
        else if (event.key >= '1' && event.key <= '6') {
          this.useItem(this._playerHeroId, parseInt(event.key) - 1);
        }
        break;
    }
  }
  
  moveHeroTo(heroId: string, target: Vector2): void {
    const hero = this._heroes.get(heroId);
    if (!hero) return;
    
    const path = this._pathfinding.findPath(hero.position, target);
    const smoothedPath = this._pathfinding.smoothPath(path);
    
    if (smoothedPath.length > 0) {
      this._heroMovePath.set(heroId, smoothedPath);
      this._heroMoveTarget.set(heroId, target);
    }
    
    this.emit({ type: 'heroMove', data: { heroId, target } });
  }
  
  useAbility(heroId: string, abilityIndex: number): void {
    const hero = this._heroes.get(heroId);
    if (!hero) return;
    
    const ability = hero.abilities[abilityIndex];
    if (!ability || ability.currentCooldown > 0) return;
    
    // Ability usage would be implemented here
    this.emit({ type: 'abilityUse', data: { heroId, abilityIndex } });
  }
  
  useItem(heroId: string, itemSlot: number): void {
    const hero = this._heroes.get(heroId);
    if (!hero) return;
    
    const item = hero.inventory[itemSlot];
    if (!item || item.currentCooldown > 0) return;
    
    // Item usage would be implemented here
  }
  
  // Event system
  addEventListener(callback: GameEngineEventCallback): void {
    this._eventListeners.push(callback);
  }
  
  removeEventListener(callback: GameEngineEventCallback): void {
    const index = this._eventListeners.indexOf(callback);
    if (index > -1) {
      this._eventListeners.splice(index, 1);
    }
  }
  
  private emit(event: GameEngineEvent): void {
    for (const listener of this._eventListeners) {
      listener(event);
    }
  }
  
  // Public API
  addHero(hero: HeroEntity): void {
    this._heroes.set(hero.id, hero);
  }
  
  addCreep(creep: CreepEntity): void {
    this._creeps.set(creep.id, creep);
  }
  
  addTower(tower: TowerEntity): void {
    this._towers.set(tower.id, tower);
  }
  
  addBuilding(building: BuildingEntity): void {
    this._buildings.set(building.id, building);
  }
  
  setPlayerHero(heroId: string): void {
    this._playerHeroId = heroId;
  }
  
  setPlayerTeam(team: Team): void {
    this._playerTeam = team;
  }
  
  get camera(): Camera {
    return this._camera;
  }
  
  get inputHandler(): InputHandler {
    return this._inputHandler;
  }
  
  get pathfinding(): Pathfinding {
    return this._pathfinding;
  }
  
  get gameTime(): number {
    return this._gameTime;
  }
  
  get heroes(): Map<string, HeroEntity> {
    return this._heroes;
  }
  
  get creeps(): Map<string, CreepEntity> {
    return this._creeps;
  }
  
  get towers(): Map<string, TowerEntity> {
    return this._towers;
  }
  
  get buildings(): Map<string, BuildingEntity> {
    return this._buildings;
  }
  
  getHero(id: string): HeroEntity | undefined {
    return this._heroes.get(id);
  }
  
  getPlayerHero(): HeroEntity | undefined {
    return this._playerHeroId ? this._heroes.get(this._playerHeroId) : undefined;
  }
}
