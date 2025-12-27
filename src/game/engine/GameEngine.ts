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
  
  // Attack system
  private _heroAttackTarget: Map<string, string | null> = new Map();
  private _heroAttackCooldown: Map<string, number> = new Map();
  private _creepAttackTarget: Map<string, string | null> = new Map();
  private _creepAttackCooldown: Map<string, number> = new Map();
  private _towerAttackTarget: Map<string, string | null> = new Map();
  private _towerAttackCooldown: Map<string, number> = new Map();
  
  // Event listeners
  private _eventListeners: GameEngineEventCallback[] = [];
  
  // Timers
  private _creepWaveTimer: number = 0;
  private _goldTimer: number = 0;
  
  // Day/Night cycle (5 minute cycles)
  private _isNight: boolean = false;
  
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
    
    // Initialize game world (spawn towers, etc.)
    this.initializeGameWorld();
    
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
  
  // Initialize the game world with towers, buildings, etc.
  private initializeGameWorld(): void {
    // Only initialize if not already done
    if (this._towers.size > 0) return;
    
    const tileSize = GAME_CONSTANTS.TILE_SIZE;
    const mapWidth = GAME_CONSTANTS.MAP_WIDTH * tileSize;
    const mapHeight = GAME_CONSTANTS.MAP_HEIGHT * tileSize;
    
    // Spawn towers for both teams on all lanes
    const lanes: Array<'top' | 'mid' | 'bot'> = ['top', 'mid', 'bot'];
    const tiers: Array<1 | 2 | 3> = [1, 2, 3];
    
    for (const lane of lanes) {
      for (const tier of tiers) {
        // Radiant towers
        this.spawnTower('radiant', lane, tier, mapWidth, mapHeight, tileSize);
        // Dire towers
        this.spawnTower('dire', lane, tier, mapWidth, mapHeight, tileSize);
      }
    }
    
    // Spawn T4 towers (ancient protectors)
    this.spawnTower('radiant', 'mid', 4, mapWidth, mapHeight, tileSize);
    this.spawnTower('dire', 'mid', 4, mapWidth, mapHeight, tileSize);
  }
  
  // Spawn a tower at appropriate position
  private spawnTower(
    team: 'radiant' | 'dire',
    lane: 'top' | 'mid' | 'bot',
    tier: 1 | 2 | 3 | 4,
    mapWidth: number,
    mapHeight: number,
    tileSize: number
  ): void {
    // Calculate tower position based on team, lane, and tier
    let x: number, y: number;
    
    if (team === 'radiant') {
      // Radiant towers are on the left/bottom side
      if (lane === 'top') {
        const baseX = 5 * tileSize;
        x = baseX;
        y = mapHeight * (0.4 - tier * 0.1);
      } else if (lane === 'mid') {
        if (tier === 4) {
          x = 8 * tileSize;
          y = mapHeight - 8 * tileSize;
        } else {
          x = mapWidth * (0.2 + tier * 0.1);
          y = mapHeight - mapWidth * (0.2 + tier * 0.1);
        }
      } else { // bot
        const baseY = mapHeight - 5 * tileSize;
        x = mapWidth * (0.2 + tier * 0.1);
        y = baseY;
      }
    } else {
      // Dire towers are on the right/top side
      if (lane === 'top') {
        const baseY = 5 * tileSize;
        x = mapWidth * (0.8 - tier * 0.1);
        y = baseY;
      } else if (lane === 'mid') {
        if (tier === 4) {
          x = mapWidth - 8 * tileSize;
          y = 8 * tileSize;
        } else {
          x = mapWidth - mapWidth * (0.2 + tier * 0.1);
          y = mapWidth * (0.2 + tier * 0.1);
        }
      } else { // bot
        const baseX = mapWidth - 5 * tileSize;
        x = baseX;
        y = mapHeight * (0.6 + tier * 0.1);
      }
    }
    
    // Tower stats scale with tier
    const baseHealth = 1300 + tier * 200;
    const baseDamage = 100 + tier * 30;
    const baseArmor = 12 + tier * 4;
    
    const tower: TowerEntity = {
      id: `tower_${team}_${lane}_t${tier}`,
      type: 'tower',
      team: team,
      position: { x, y },
      rotation: 0,
      isAlive: true,
      tier: tier,
      lane: lane,
      hasBackdoorProtection: tier > 1, // T2+ have backdoor protection
      stats: {
        maxHealth: baseHealth,
        health: baseHealth,
        maxMana: 0,
        mana: 0,
        healthRegen: 0,
        manaRegen: 0,
        armor: baseArmor,
        magicResistance: 0,
        attackDamage: baseDamage,
        attackSpeed: 1.0,
        attackRange: 700, // Tower attack range
        movementSpeed: 0,
      },
      buffs: [],
    };
    
    this._towers.set(tower.id, tower);
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
    this.updateTowers(deltaTime);
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
      
      // Update attack cooldown
      const currentCooldown = this._heroAttackCooldown.get(id) || 0;
      if (currentCooldown > 0) {
        this._heroAttackCooldown.set(id, Math.max(0, currentCooldown - deltaTime));
      }
      
      // Update movement
      this.updateHeroMovement(id, hero, deltaTime);
      
      // Update attack (if hero has target and is in range)
      this.updateHeroAttack(id, hero);
      
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
  
  // Handle hero auto-attack
  private updateHeroAttack(id: string, hero: HeroEntity): void {
    const targetId = this._heroAttackTarget.get(id);
    if (!targetId) return;
    
    // Find target
    let target: EntityBase | undefined;
    target = this._creeps.get(targetId);
    if (!target) target = this._heroes.get(targetId);
    if (!target) target = this._towers.get(targetId);
    
    // Check if target is valid
    if (!target || !target.isAlive) {
      this._heroAttackTarget.set(id, null);
      return;
    }
    
    // Check if can attack target (enemy or valid deny target)
    if (!this.canAttackTarget(hero, target)) {
      this._heroAttackTarget.set(id, null);
      return;
    }
    
    // Check range
    const distance = vectorDistance(hero.position, target.position);
    if (distance > hero.stats.attackRange) {
      // Move towards target
      const path = this._heroMovePath.get(id);
      if (!path || path.length === 0) {
        this.moveHeroTo(id, target.position);
      }
      return;
    }
    
    // Check attack cooldown
    const cooldown = this._heroAttackCooldown.get(id) || 0;
    if (cooldown > 0) return;
    
    // Perform attack
    this.performHeroAttack(hero, target);
    
    // Set attack cooldown (based on attack speed - higher is faster)
    const baseAttackTime = 1.7; // Base attack time in seconds
    const attackCooldown = baseAttackTime / hero.stats.attackSpeed;
    this._heroAttackCooldown.set(id, attackCooldown);
  }
  
  // Check if attacker can attack target (handles deny mechanics)
  private canAttackTarget(attacker: EntityBase, target: EntityBase): boolean {
    // Can always attack enemies
    if (target.team !== attacker.team) {
      return true;
    }
    
    // Allied creeps can be denied (attacked) at any health
    if (target.type === 'creep') {
      return true;
    }
    
    // Allied heroes can only be denied below 25% health
    if (target.type === 'hero') {
      const targetHero = target as HeroEntity;
      return targetHero.stats.health / targetHero.stats.maxHealth <= 0.25;
    }
    
    // Cannot attack allied buildings/towers
    return false;
  }
  
  // Perform a hero attack
  private performHeroAttack(hero: HeroEntity, target: EntityBase): void {
    // Get hero definition for attack type
    const heroDef = this.getHeroDefinition(hero.definitionId);
    const isRanged = heroDef ? hero.stats.attackRange > 100 : false;
    
    // Calculate damage with some variance (±10%)
    const baseDamage = hero.stats.attackDamage;
    const variance = baseDamage * 0.1;
    const damage = baseDamage + (Math.random() * 2 - 1) * variance;
    
    if (isRanged) {
      // Create projectile
      const projectile: ProjectileEntity = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        type: 'projectile',
        sourceId: hero.id,
        targetId: target.id,
        position: { ...hero.position },
        speed: 1200,
        damage: damage,
        damageType: 'physical',
        sprite: '/assets/sprites/projectiles/arrow.png',
      };
      this._projectiles.set(projectile.id, projectile);
    } else {
      // Instant melee attack
      const actualDamage = this.calculateDamage(
        damage,
        'physical',
        target.stats.armor,
        target.stats.magicResistance
      );
      this.applyDamage(target, actualDamage, hero.id);
    }
    
    // Face towards target
    const direction = vectorSubtract(target.position, hero.position);
    hero.rotation = Math.atan2(direction.y, direction.x);
    
    this.emit({ type: 'heroAttack', data: { heroId: hero.id, targetId: target.id } });
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
      
      // Update attack cooldown
      const currentCooldown = this._creepAttackCooldown.get(id) || 0;
      if (currentCooldown > 0) {
        this._creepAttackCooldown.set(id, Math.max(0, currentCooldown - deltaTime));
      }
      
      // AI: Find target (aggro system)
      const targetId = this._creepAttackTarget.get(id);
      let target: EntityBase | undefined;
      
      if (targetId) {
        target = this._creeps.get(targetId);
        if (!target) target = this._heroes.get(targetId);
        if (!target) target = this._towers.get(targetId);
        
        // Clear target if dead
        if (!target || !target.isAlive) {
          this._creepAttackTarget.set(id, null);
          target = undefined;
        }
      }
      
      // If no target, find nearest enemy
      if (!target) {
        target = this.findNearestEnemy(creep, 500); // Aggro range: 500 units
        if (target) {
          this._creepAttackTarget.set(id, target.id);
        }
      }
      
      if (target) {
        // Check if in attack range
        const distance = vectorDistance(creep.position, target.position);
        if (distance <= creep.stats.attackRange) {
          // Attack if cooldown is ready
          if ((this._creepAttackCooldown.get(id) || 0) <= 0) {
            this.performCreepAttack(creep, target);
            const attackCooldown = 1.7 / creep.stats.attackSpeed;
            this._creepAttackCooldown.set(id, attackCooldown);
          }
        } else {
          // Move towards target
          const direction = vectorSubtract(target.position, creep.position);
          const normalizedDir = vectorNormalize(direction);
          const moveDistance = creep.stats.movementSpeed * deltaTime;
          creep.position = vectorAdd(
            creep.position,
            vectorMultiply(normalizedDir, moveDistance)
          );
          creep.rotation = Math.atan2(normalizedDir.y, normalizedDir.x);
        }
      } else {
        // No target, follow waypoints
        if (creep.waypoints.length > creep.currentWaypointIndex) {
          const waypoint = creep.waypoints[creep.currentWaypointIndex];
          const direction = vectorSubtract(waypoint, creep.position);
          const distance = vectorDistance(creep.position, waypoint);
          const moveDistance = creep.stats.movementSpeed * deltaTime;
          
          if (distance <= moveDistance) {
            creep.position = { ...waypoint };
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
  }
  
  // Find nearest enemy for AI targeting
  private findNearestEnemy(entity: EntityBase, range: number): EntityBase | undefined {
    let nearest: EntityBase | undefined;
    let nearestDistance = range;
    
    // Check creeps
    for (const creep of this._creeps.values()) {
      if (creep.team !== entity.team && creep.isAlive) {
        const distance = vectorDistance(entity.position, creep.position);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = creep;
        }
      }
    }
    
    // Check heroes
    for (const hero of this._heroes.values()) {
      if (hero.team !== entity.team && hero.isAlive) {
        const distance = vectorDistance(entity.position, hero.position);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = hero;
        }
      }
    }
    
    // Check towers
    for (const tower of this._towers.values()) {
      if (tower.team !== entity.team && tower.isAlive) {
        const distance = vectorDistance(entity.position, tower.position);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = tower;
        }
      }
    }
    
    return nearest;
  }
  
  // Perform creep attack
  private performCreepAttack(creep: CreepEntity, target: EntityBase): void {
    const damage = creep.stats.attackDamage;
    const isRanged = creep.stats.attackRange > 100;
    
    if (isRanged) {
      // Create projectile
      const projectile: ProjectileEntity = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        type: 'projectile',
        sourceId: creep.id,
        targetId: target.id,
        position: { ...creep.position },
        speed: 900,
        damage: damage,
        damageType: 'physical',
        sprite: '/assets/sprites/projectiles/creep_arrow.png',
      };
      this._projectiles.set(projectile.id, projectile);
    } else {
      // Instant melee attack
      const actualDamage = this.calculateDamage(
        damage,
        'physical',
        target.stats.armor,
        target.stats.magicResistance
      );
      this.applyDamage(target, actualDamage, creep.id);
    }
    
    // Face towards target
    const direction = vectorSubtract(target.position, creep.position);
    creep.rotation = Math.atan2(direction.y, direction.x);
  }
  
  // Update tower attacks
  private updateTowers(deltaTime: number): void {
    for (const [id, tower] of this._towers) {
      if (!tower.isAlive) continue;
      
      // Update attack cooldown
      const currentCooldown = this._towerAttackCooldown.get(id) || 0;
      if (currentCooldown > 0) {
        this._towerAttackCooldown.set(id, Math.max(0, currentCooldown - deltaTime));
      }
      
      // Find target
      const targetId = this._towerAttackTarget.get(id);
      let target: EntityBase | undefined;
      
      if (targetId) {
        target = this._creeps.get(targetId);
        if (!target) target = this._heroes.get(targetId);
        
        // Clear target if dead
        if (!target || !target.isAlive) {
          this._towerAttackTarget.set(id, null);
          target = undefined;
        }
      }
      
      // Tower targeting priority: 
      // 1. Enemy heroes attacking allied heroes in range
      // 2. Enemy creeps
      // 3. Enemy heroes
      if (!target) {
        // First check for creeps (priority)
        let nearestCreep: CreepEntity | undefined;
        let nearestCreepDistance = tower.stats.attackRange;
        
        for (const creep of this._creeps.values()) {
          if (creep.team !== tower.team && creep.isAlive) {
            const distance = vectorDistance(tower.position, creep.position);
            if (distance < nearestCreepDistance) {
              nearestCreepDistance = distance;
              nearestCreep = creep;
            }
          }
        }
        
        if (nearestCreep) {
          target = nearestCreep;
          this._towerAttackTarget.set(id, nearestCreep.id);
        } else {
          // No creeps, check for heroes
          let nearestHero: HeroEntity | undefined;
          let nearestHeroDistance = tower.stats.attackRange;
          
          for (const hero of this._heroes.values()) {
            if (hero.team !== tower.team && hero.isAlive) {
              const distance = vectorDistance(tower.position, hero.position);
              if (distance < nearestHeroDistance) {
                nearestHeroDistance = distance;
                nearestHero = hero;
              }
            }
          }
          
          if (nearestHero) {
            target = nearestHero;
            this._towerAttackTarget.set(id, nearestHero.id);
          }
        }
      }
      
      if (target) {
        // Check if in attack range
        const distance = vectorDistance(tower.position, target.position);
        if (distance <= tower.stats.attackRange) {
          // Attack if cooldown is ready
          if ((this._towerAttackCooldown.get(id) || 0) <= 0) {
            this.performTowerAttack(tower, target);
            const attackCooldown = 1.0; // Tower attacks once per second
            this._towerAttackCooldown.set(id, attackCooldown);
          }
        } else {
          // Target out of range, clear it
          this._towerAttackTarget.set(id, null);
        }
      }
    }
  }
  
  // Perform tower attack
  private performTowerAttack(tower: TowerEntity, target: EntityBase): void {
    // Towers always shoot projectiles
    const projectile: ProjectileEntity = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      type: 'projectile',
      sourceId: tower.id,
      targetId: target.id,
      position: { ...tower.position },
      speed: 1500,
      damage: tower.stats.attackDamage,
      damageType: 'physical',
      sprite: '/assets/sprites/projectiles/tower_shot.png',
    };
    this._projectiles.set(projectile.id, projectile);
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
    // Find target and apply damage
    let target: HeroEntity | CreepEntity | TowerEntity | undefined;
    
    // Check heroes
    for (const hero of this._heroes.values()) {
      if (hero.id === projectile.targetId) {
        target = hero;
        break;
      }
    }
    
    // Check creeps
    if (!target) {
      for (const creep of this._creeps.values()) {
        if (creep.id === projectile.targetId) {
          target = creep;
          break;
        }
      }
    }
    
    // Check towers
    if (!target) {
      for (const tower of this._towers.values()) {
        if (tower.id === projectile.targetId) {
          target = tower;
          break;
        }
      }
    }
    
    if (!target || !target.isAlive) return;
    
    // Calculate and apply damage
    const damage = this.calculateDamage(
      projectile.damage,
      projectile.damageType,
      target.stats.armor,
      target.stats.magicResistance
    );
    
    this.applyDamage(target, damage, projectile.sourceId);
  }
  
  // Calculate damage after reductions
  private calculateDamage(
    baseDamage: number,
    damageType: 'physical' | 'magical' | 'pure',
    armor: number,
    magicResistance: number
  ): number {
    switch (damageType) {
      case 'physical':
        // Dota 2 armor formula: multiplier = 1 - (0.06 * armor) / (1 + 0.06 * |armor|)
        const armorMultiplier = 1 - (0.06 * armor) / (1 + 0.06 * Math.abs(armor));
        return baseDamage * armorMultiplier;
      case 'magical':
        // Magic resistance is percentage-based
        return baseDamage * (1 - magicResistance / 100);
      case 'pure':
        // Pure damage is not reduced
        return baseDamage;
      default:
        return baseDamage;
    }
  }
  
  // Apply damage to an entity
  private applyDamage(target: EntityBase, damage: number, sourceId: string): void {
    target.stats.health = Math.max(0, target.stats.health - damage);
    
    if (target.stats.health <= 0) {
      this.onEntityDeath(target, sourceId);
    }
  }
  
  // Handle entity death
  private onEntityDeath(entity: EntityBase, killerId: string): void {
    entity.isAlive = false;
    
    // Get killer
    const killer = this._heroes.get(killerId);
    
    if (entity.type === 'hero') {
      const deadHero = entity as HeroEntity;
      deadHero.deaths++;
      
      // Calculate respawn time (based on level)
      deadHero.respawnTime = 5 + deadHero.level * 2;
      
      if (killer) {
        killer.kills++;
        // Gold reward for hero kill (base + level bonus)
        const goldReward = 200 + deadHero.level * 10;
        killer.gold += goldReward;
        
        // Experience reward
        const expReward = 100 + deadHero.level * 50;
        this.grantExperience(killer, expReward);
        
        this.emit({ type: 'goldGained', data: { heroId: killer.id, amount: goldReward } });
        this.emit({ type: 'expGained', data: { heroId: killer.id, amount: expReward } });
      }
    } else if (entity.type === 'creep') {
      const creep = entity as CreepEntity;
      const creepDef = this.getCreepDefinition(creep.definitionId);
      
      if (killer && creepDef) {
        // Grant gold and experience
        killer.gold += creepDef.goldReward;
        this.grantExperience(killer, creepDef.expReward);
        
        this.emit({ type: 'goldGained', data: { heroId: killer.id, amount: creepDef.goldReward } });
        this.emit({ type: 'expGained', data: { heroId: killer.id, amount: creepDef.expReward } });
      }
    }
    
    this.emit({ type: 'entityDeath', data: { entityId: entity.id, killerId } });
  }
  
  // Get creep definition by ID
  private getCreepDefinition(id: string): { goldReward: number; expReward: number } | undefined {
    // Import creep data dynamically to avoid circular dependency
    const creepRewards: Record<string, { goldReward: number; expReward: number }> = {
      melee_creep: { goldReward: 40, expReward: 60 },
      ranged_creep: { goldReward: 45, expReward: 90 },
      siege_creep: { goldReward: 75, expReward: 125 },
      kobold: { goldReward: 20, expReward: 30 },
      ghost: { goldReward: 30, expReward: 45 },
      satyr: { goldReward: 50, expReward: 80 },
      centaur: { goldReward: 60, expReward: 100 },
      troll: { goldReward: 80, expReward: 140 },
      golem: { goldReward: 90, expReward: 160 },
      dragon: { goldReward: 130, expReward: 220 },
      thunderhide: { goldReward: 120, expReward: 200 },
    };
    return creepRewards[id];
  }
  
  // Grant experience to a hero and handle level-ups
  private grantExperience(hero: HeroEntity, amount: number): void {
    hero.experience += amount;
    
    // Check for level up
    while (hero.level < GAME_CONSTANTS.MAX_LEVEL) {
      const expForNextLevel = this.getExpForLevel(hero.level + 1);
      if (hero.experience >= expForNextLevel) {
        this.levelUp(hero);
      } else {
        break;
      }
    }
  }
  
  // Get experience required for a level
  private getExpForLevel(level: number): number {
    // Experience table from types
    const expTable = [
      0, 0, 200, 500, 900, 1400, 2000, 2700, 3500, 4400, 5400,
      6500, 7700, 9000, 10400, 11900, 13500, 15200, 17000, 18900,
      20900, 23000, 25200, 27500, 29900, 32400
    ];
    return expTable[level] || 99999;
  }
  
  // Level up a hero
  private levelUp(hero: HeroEntity): void {
    hero.level++;
    hero.abilityPoints++;
    
    // Get hero definition for attribute gain
    const heroDef = this.getHeroDefinition(hero.definitionId);
    if (heroDef) {
      // Apply attribute gains
      hero.attributes.strength += heroDef.attributeGain.strength;
      hero.attributes.agility += heroDef.attributeGain.agility;
      hero.attributes.intelligence += heroDef.attributeGain.intelligence;
      
      // Recalculate derived stats
      const oldMaxHealth = hero.stats.maxHealth;
      const oldMaxMana = hero.stats.maxMana;
      
      hero.stats.maxHealth = heroDef.baseStats.health + 
        hero.attributes.strength * GAME_CONSTANTS.STRENGTH_HP_BONUS;
      hero.stats.maxMana = heroDef.baseStats.mana + 
        hero.attributes.intelligence * GAME_CONSTANTS.INTELLIGENCE_MANA_BONUS;
      hero.stats.healthRegen = heroDef.baseStats.healthRegen + 
        hero.attributes.strength * GAME_CONSTANTS.STRENGTH_REGEN_BONUS;
      hero.stats.manaRegen = heroDef.baseStats.manaRegen + 
        hero.attributes.intelligence * GAME_CONSTANTS.INTELLIGENCE_REGEN_BONUS;
      hero.stats.armor = heroDef.baseStats.armor + 
        hero.attributes.agility * GAME_CONSTANTS.AGILITY_ARMOR_BONUS;
      
      // Update attack damage based on primary attribute
      const primaryAttr = heroDef.primaryAttribute === 'strength' 
        ? hero.attributes.strength
        : heroDef.primaryAttribute === 'agility'
          ? hero.attributes.agility
          : hero.attributes.intelligence;
      hero.stats.attackDamage = (heroDef.baseStats.attackDamage[0] + heroDef.baseStats.attackDamage[1]) / 2 + primaryAttr;
      
      // Increase current health/mana proportionally
      hero.stats.health += hero.stats.maxHealth - oldMaxHealth;
      hero.stats.mana += hero.stats.maxMana - oldMaxMana;
    }
  }
  
  // Get hero definition (simplified to avoid circular imports)
  private getHeroDefinition(id: string): {
    attributeGain: { strength: number; agility: number; intelligence: number };
    baseStats: {
      health: number;
      mana: number;
      healthRegen: number;
      manaRegen: number;
      armor: number;
      attackDamage: [number, number];
    };
    primaryAttribute: 'strength' | 'agility' | 'intelligence';
  } | undefined {
    const heroes: Record<string, {
      attributeGain: { strength: number; agility: number; intelligence: number };
      baseStats: {
        health: number;
        mana: number;
        healthRegen: number;
        manaRegen: number;
        armor: number;
        attackDamage: [number, number];
      };
      primaryAttribute: 'strength' | 'agility' | 'intelligence';
    }> = {
      warrior: {
        attributeGain: { strength: 3.2, agility: 1.5, intelligence: 1.4 },
        baseStats: { health: 200, mana: 75, healthRegen: 1.0, manaRegen: 0.5, armor: 2, attackDamage: [52, 60] },
        primaryAttribute: 'strength',
      },
      archer: {
        attributeGain: { strength: 1.7, agility: 3.3, intelligence: 1.4 },
        baseStats: { health: 200, mana: 75, healthRegen: 0.75, manaRegen: 0.6, armor: 1, attackDamage: [44, 50] },
        primaryAttribute: 'agility',
      },
      ice_mage: {
        attributeGain: { strength: 1.5, agility: 1.4, intelligence: 3.5 },
        baseStats: { health: 200, mana: 150, healthRegen: 0.5, manaRegen: 1.5, armor: 0, attackDamage: [40, 46] },
        primaryAttribute: 'intelligence',
      },
      assassin: {
        attributeGain: { strength: 1.9, agility: 3.4, intelligence: 1.2 },
        baseStats: { health: 200, mana: 75, healthRegen: 0.6, manaRegen: 0.5, armor: 3, attackDamage: [48, 54] },
        primaryAttribute: 'agility',
      },
      tank: {
        attributeGain: { strength: 3.8, agility: 1.0, intelligence: 1.2 },
        baseStats: { health: 300, mana: 100, healthRegen: 1.5, manaRegen: 0.4, armor: 5, attackDamage: [45, 50] },
        primaryAttribute: 'strength',
      },
      support: {
        attributeGain: { strength: 1.6, agility: 1.6, intelligence: 3.2 },
        baseStats: { health: 200, mana: 120, healthRegen: 0.6, manaRegen: 1.2, armor: 0, attackDamage: [38, 44] },
        primaryAttribute: 'intelligence',
      },
      swordsman: {
        attributeGain: { strength: 2.2, agility: 2.8, intelligence: 1.4 },
        baseStats: { health: 200, mana: 75, healthRegen: 0.8, manaRegen: 0.5, armor: 2, attackDamage: [50, 56] },
        primaryAttribute: 'agility',
      },
      thunderer: {
        attributeGain: { strength: 1.8, agility: 1.5, intelligence: 3.6 },
        baseStats: { health: 200, mana: 140, healthRegen: 0.5, manaRegen: 1.4, armor: 0, attackDamage: [42, 48] },
        primaryAttribute: 'intelligence',
      },
      earth_shaman: {
        attributeGain: { strength: 2.9, agility: 1.3, intelligence: 1.8 },
        baseStats: { health: 200, mana: 100, healthRegen: 0.9, manaRegen: 0.7, armor: 2, attackDamage: [48, 54] },
        primaryAttribute: 'strength',
      },
      druid: {
        attributeGain: { strength: 1.8, agility: 1.8, intelligence: 3.0 },
        baseStats: { health: 200, mana: 130, healthRegen: 0.6, manaRegen: 1.0, armor: 1, attackDamage: [40, 48] },
        primaryAttribute: 'intelligence',
      },
    };
    return heroes[id];
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
    
    // Day/Night cycle (every 5 minutes = 300 seconds)
    const dayNightCycleLength = 300; // 5 minutes
    const cyclePosition = (this._gameTime % (dayNightCycleLength * 2)) / dayNightCycleLength;
    const wasNight = this._isNight;
    this._isNight = cyclePosition >= 1;
    
    // Night reduces vision (visual indicator in render, actual mechanics in game logic)
    if (wasNight !== this._isNight) {
      // Day/night changed - this can trigger special abilities or effects
    }
  }
  
  // Getter for day/night status
  get isNight(): boolean {
    return this._isNight;
  }
  
  private spawnCreepWave(): void {
    // Spawn creeps on all three lanes for both teams
    const lanes: Array<'top' | 'mid' | 'bot'> = ['top', 'mid', 'bot'];
    const teams: Array<'radiant' | 'dire'> = ['radiant', 'dire'];
    
    for (const team of teams) {
      for (const lane of lanes) {
        this.spawnLaneCreeps(team, lane);
      }
    }
  }
  
  // Spawn creeps for a specific lane
  private spawnLaneCreeps(team: 'radiant' | 'dire', lane: 'top' | 'mid' | 'bot'): void {
    const tileSize = GAME_CONSTANTS.TILE_SIZE;
    const mapWidth = GAME_CONSTANTS.MAP_WIDTH * tileSize;
    const mapHeight = GAME_CONSTANTS.MAP_HEIGHT * tileSize;
    
    // Starting positions for each team
    const radiantSpawn = { x: 5 * tileSize, y: (GAME_CONSTANTS.MAP_HEIGHT - 5) * tileSize };
    const direSpawn = { x: (GAME_CONSTANTS.MAP_WIDTH - 5) * tileSize, y: 5 * tileSize };
    
    const startPos = team === 'radiant' ? radiantSpawn : direSpawn;
    
    // Waypoints for each lane (simplified)
    const waypoints = this.getLaneWaypoints(team, lane, mapWidth, mapHeight, tileSize);
    
    // Spawn 3 melee creeps
    for (let i = 0; i < 3; i++) {
      const creep: CreepEntity = {
        id: `creep_${team}_${lane}_${Date.now()}_${i}`,
        type: 'creep',
        team: team,
        definitionId: 'melee_creep',
        position: { 
          x: startPos.x + (i - 1) * 20, 
          y: startPos.y + (i - 1) * 20 
        },
        rotation: 0,
        isAlive: true,
        stats: {
          maxHealth: 550,
          health: 550,
          maxMana: 0,
          mana: 0,
          healthRegen: 0.5,
          manaRegen: 0,
          armor: 2,
          magicResistance: 0,
          attackDamage: 21,
          attackSpeed: 1.0,
          attackRange: 32,
          movementSpeed: 325,
        },
        buffs: [],
        lane: lane,
        waypoints: waypoints,
        currentWaypointIndex: 0,
      };
      this._creeps.set(creep.id, creep);
    }
    
    // Spawn 1 ranged creep
    const rangedCreep: CreepEntity = {
      id: `creep_${team}_${lane}_${Date.now()}_ranged`,
      type: 'creep',
      team: team,
      definitionId: 'ranged_creep',
      position: { x: startPos.x, y: startPos.y - 30 },
      rotation: 0,
      isAlive: true,
      stats: {
        maxHealth: 300,
        health: 300,
        maxMana: 0,
        mana: 0,
        healthRegen: 0.5,
        manaRegen: 0,
        armor: 0,
        magicResistance: 0,
        attackDamage: 25,
        attackSpeed: 1.0,
        attackRange: 128,
        movementSpeed: 325,
      },
      buffs: [],
      lane: lane,
      waypoints: waypoints,
      currentWaypointIndex: 0,
    };
    this._creeps.set(rangedCreep.id, rangedCreep);
  }
  
  // Get waypoints for a lane
  private getLaneWaypoints(
    team: 'radiant' | 'dire', 
    lane: 'top' | 'mid' | 'bot',
    mapWidth: number,
    mapHeight: number,
    tileSize: number
  ): Vector2[] {
    const waypoints: Vector2[] = [];
    
    // Define lane paths (simplified)
    if (lane === 'mid') {
      // Mid lane goes diagonally
      if (team === 'radiant') {
        waypoints.push({ x: mapWidth * 0.3, y: mapHeight * 0.7 });
        waypoints.push({ x: mapWidth * 0.5, y: mapHeight * 0.5 });
        waypoints.push({ x: mapWidth * 0.7, y: mapHeight * 0.3 });
        waypoints.push({ x: mapWidth - 5 * tileSize, y: 5 * tileSize }); // Dire base
      } else {
        waypoints.push({ x: mapWidth * 0.7, y: mapHeight * 0.3 });
        waypoints.push({ x: mapWidth * 0.5, y: mapHeight * 0.5 });
        waypoints.push({ x: mapWidth * 0.3, y: mapHeight * 0.7 });
        waypoints.push({ x: 5 * tileSize, y: mapHeight - 5 * tileSize }); // Radiant base
      }
    } else if (lane === 'top') {
      // Top lane goes left then up
      if (team === 'radiant') {
        waypoints.push({ x: 5 * tileSize, y: mapHeight * 0.5 });
        waypoints.push({ x: 5 * tileSize, y: 5 * tileSize });
        waypoints.push({ x: mapWidth * 0.5, y: 5 * tileSize });
        waypoints.push({ x: mapWidth - 5 * tileSize, y: 5 * tileSize }); // Dire base
      } else {
        waypoints.push({ x: mapWidth * 0.5, y: 5 * tileSize });
        waypoints.push({ x: 5 * tileSize, y: 5 * tileSize });
        waypoints.push({ x: 5 * tileSize, y: mapHeight * 0.5 });
        waypoints.push({ x: 5 * tileSize, y: mapHeight - 5 * tileSize }); // Radiant base
      }
    } else { // bot lane
      // Bot lane goes right then down
      if (team === 'radiant') {
        waypoints.push({ x: mapWidth * 0.5, y: mapHeight - 5 * tileSize });
        waypoints.push({ x: mapWidth - 5 * tileSize, y: mapHeight - 5 * tileSize });
        waypoints.push({ x: mapWidth - 5 * tileSize, y: mapHeight * 0.5 });
        waypoints.push({ x: mapWidth - 5 * tileSize, y: 5 * tileSize }); // Dire base
      } else {
        waypoints.push({ x: mapWidth - 5 * tileSize, y: mapHeight * 0.5 });
        waypoints.push({ x: mapWidth - 5 * tileSize, y: mapHeight - 5 * tileSize });
        waypoints.push({ x: mapWidth * 0.5, y: mapHeight - 5 * tileSize });
        waypoints.push({ x: 5 * tileSize, y: mapHeight - 5 * tileSize }); // Radiant base
      }
    }
    
    return waypoints;
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
    
    // Clear canvas with day/night tinted background
    const bgColor = this._isNight ? '#0f0f1e' : '#1a1a2e';
    this._ctx.fillStyle = bgColor;
    this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    
    // Render map (placeholder grid)
    this.renderMap();
    
    // Render entities
    this.renderEntities();
    
    // Render night overlay
    if (this._isNight) {
      this._ctx.fillStyle = 'rgba(0, 0, 30, 0.3)';
      this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }
    
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
        
        // Alternate tile colors for grass pattern (darker at night)
        const isLight = (tx + ty) % 2 === 0;
        if (this._isNight) {
          this._ctx.fillStyle = isLight ? '#1e3d1a' : '#172f14';
        } else {
          this._ctx.fillStyle = isLight ? '#2d5a27' : '#234d20';
        }
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
      case 'click':
        // Left click - select target for attack if clicking on enemy
        if (event.worldPosition) {
          const target = this.findEntityAtPosition(event.worldPosition);
          if (target && target.team !== hero.team) {
            this._heroAttackTarget.set(this._playerHeroId, target.id);
            // Stop current movement path
            this._heroMovePath.delete(this._playerHeroId);
            this._heroMoveTarget.delete(this._playerHeroId);
          }
        }
        break;
        
      case 'rightClick':
        // Move or attack-move
        if (event.worldPosition) {
          // Check if clicking on enemy unit
          const target = this.findEntityAtPosition(event.worldPosition);
          if (target && target.team !== hero.team) {
            // Attack target
            this._heroAttackTarget.set(this._playerHeroId, target.id);
          } else {
            // Move to position (clear attack target)
            this._heroAttackTarget.set(this._playerHeroId, null);
            this.moveHeroTo(this._playerHeroId, event.worldPosition);
          }
        }
        break;
        
      case 'keyDown':
        // Ability hotkeys (skip W for movement)
        if (event.key === 'q') {
          this.useAbility(this._playerHeroId, 0);
        } else if (event.key === 'e') {
          this.useAbility(this._playerHeroId, 2);
        } else if (event.key === 'r') {
          this.useAbility(this._playerHeroId, 3);
        }
        // 'A' key for attack-move
        else if (event.key === 'a') {
          // Set attack mode - next click will be attack-move
          // For now, just stop and attack nearest enemy
          const nearestEnemy = this.findNearestEnemy(hero, 1000);
          if (nearestEnemy) {
            this._heroAttackTarget.set(this._playerHeroId, nearestEnemy.id);
          }
        }
        // 'S' key to stop
        else if (event.key === 's') {
          this._heroMovePath.delete(this._playerHeroId);
          this._heroMoveTarget.delete(this._playerHeroId);
          this._heroAttackTarget.set(this._playerHeroId, null);
        }
        // 'H' key to hold position
        else if (event.key === 'h') {
          this._heroMovePath.delete(this._playerHeroId);
          this._heroMoveTarget.delete(this._playerHeroId);
        }
        // Item hotkeys
        else if (event.key && event.key >= '1' && event.key <= '6') {
          this.useItem(this._playerHeroId, parseInt(event.key) - 1);
        }
        break;
    }
  }
  
  // Find entity at world position
  private findEntityAtPosition(position: Vector2): EntityBase | undefined {
    const clickRadius = 24; // Click tolerance in pixels
    
    // Check heroes
    for (const hero of this._heroes.values()) {
      if (hero.isAlive && vectorDistance(position, hero.position) <= clickRadius) {
        return hero;
      }
    }
    
    // Check creeps
    for (const creep of this._creeps.values()) {
      if (creep.isAlive && vectorDistance(position, creep.position) <= clickRadius) {
        return creep;
      }
    }
    
    // Check towers
    for (const tower of this._towers.values()) {
      if (tower.isAlive && vectorDistance(position, tower.position) <= clickRadius * 2) {
        return tower;
      }
    }
    
    return undefined;
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
