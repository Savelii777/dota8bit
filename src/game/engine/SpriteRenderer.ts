// Pixel art sprite renderer for 8-bit graphics
// This module handles drawing pixel art sprites without requiring external assets

import { Vector2, Team, Direction, AnimationState } from '@/types';

// Font constants
const FONTS = {
  pixel: '"Press Start 2P", monospace',
  pixelSmall: '10px "Press Start 2P", monospace',
  pixelMedium: '12px "Press Start 2P", monospace',
  pixelLarge: 'bold 14px "Press Start 2P", monospace',
};

// Pixel art color palettes
const COLORS = {
  // Radiant team colors
  radiantPrimary: '#4CAF50',
  radiantSecondary: '#2E7D32',
  radiantAccent: '#81C784',
  radiantSkin: '#FFD699',
  
  // Dire team colors
  direPrimary: '#f44336',
  direSecondary: '#c62828',
  direAccent: '#EF5350',
  direSkin: '#D4A06C',
  
  // Neutral colors
  neutralPrimary: '#9E9E9E',
  neutralSecondary: '#616161',
  
  // Tower colors
  towerRadiant: '#00BCD4',
  towerDire: '#FF5722',
  towerStone: '#5D4037',
  
  // Map colors
  grass: '#2d5a27',
  grassLight: '#3d6a37',
  road: '#8B7355',
  roadLight: '#A0876A',
  water: '#1565C0',
  waterLight: '#1976D2',
  tree: '#1B5E20',
  treeLeaves: '#2E7D32',
  rock: '#607D8B',
  
  // UI colors
  healthGreen: '#4CAF50',
  healthRed: '#f44336',
  manaBlue: '#2196F3',
  gold: '#FFD700',
  black: '#000000',
  white: '#FFFFFF',
};

export interface SpriteRenderOptions {
  scale?: number;
  flipX?: boolean;
  flipY?: boolean;
  opacity?: number;
  tint?: string;
}

export class SpriteRenderer {
  private ctx: CanvasRenderingContext2D;
  private animationTime: number = 0;
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  
  update(deltaTime: number): void {
    this.animationTime += deltaTime;
  }
  
  // Draw a pixel (used for creating sprites)
  private drawPixel(x: number, y: number, color: string, scale: number = 1): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), scale, scale);
  }
  
  // Draw a pixel art hero
  drawHero(
    position: Vector2,
    team: Team,
    heroType: string,
    direction: Direction,
    animState: AnimationState,
    scale: number = 1,
    isAttacking: boolean = false
  ): void {
    const colors = team === 'radiant' 
      ? { primary: COLORS.radiantPrimary, secondary: COLORS.radiantSecondary, accent: COLORS.radiantAccent, skin: COLORS.radiantSkin }
      : { primary: COLORS.direPrimary, secondary: COLORS.direSecondary, accent: COLORS.direAccent, skin: COLORS.direSkin };
    
    const frame = Math.floor(this.animationTime * 4) % 4;
    const bobOffset = (animState === 'walk' || animState === 'attack') ? Math.sin(frame * Math.PI / 2) * 2 : 0;
    
    const px = Math.floor(position.x);
    const py = Math.floor(position.y + bobOffset);
    const s = scale;
    
    // Base hero sprite (16x16 scaled)
    // Draw body
    this.ctx.fillStyle = colors.primary;
    this.ctx.fillRect(px - 4*s, py - 6*s, 8*s, 8*s);
    
    // Draw body outline
    this.ctx.fillStyle = colors.secondary;
    this.ctx.fillRect(px - 5*s, py - 6*s, 1*s, 8*s);
    this.ctx.fillRect(px + 4*s, py - 6*s, 1*s, 8*s);
    
    // Draw head
    this.ctx.fillStyle = colors.skin;
    this.ctx.fillRect(px - 3*s, py - 10*s, 6*s, 4*s);
    
    // Draw eyes based on direction
    this.ctx.fillStyle = COLORS.black;
    if (direction === 'right' || direction === 'down') {
      this.ctx.fillRect(px + 0*s, py - 9*s, 1*s, 1*s);
      this.ctx.fillRect(px + 2*s, py - 9*s, 1*s, 1*s);
    } else {
      this.ctx.fillRect(px - 1*s, py - 9*s, 1*s, 1*s);
      this.ctx.fillRect(px - 3*s, py - 9*s, 1*s, 1*s);
    }
    
    // Draw helmet/hair based on hero type
    this.ctx.fillStyle = colors.accent;
    this.ctx.fillRect(px - 4*s, py - 12*s, 8*s, 2*s);
    
    // Draw legs with animation
    this.ctx.fillStyle = colors.secondary;
    if (animState === 'walk') {
      const legFrame = frame % 2;
      if (legFrame === 0) {
        this.ctx.fillRect(px - 3*s, py + 2*s, 2*s, 4*s);
        this.ctx.fillRect(px + 1*s, py + 2*s, 2*s, 4*s);
      } else {
        this.ctx.fillRect(px - 4*s, py + 2*s, 2*s, 4*s);
        this.ctx.fillRect(px + 2*s, py + 2*s, 2*s, 4*s);
      }
    } else {
      this.ctx.fillRect(px - 3*s, py + 2*s, 2*s, 4*s);
      this.ctx.fillRect(px + 1*s, py + 2*s, 2*s, 4*s);
    }
    
    // Draw weapon for melee heroes
    if (isAttacking || animState === 'attack') {
      this.ctx.fillStyle = '#C0C0C0';
      if (direction === 'right') {
        this.ctx.fillRect(px + 5*s, py - 8*s, 8*s, 2*s);
      } else if (direction === 'left') {
        this.ctx.fillRect(px - 13*s, py - 8*s, 8*s, 2*s);
      } else if (direction === 'up') {
        this.ctx.fillRect(px + 3*s, py - 14*s, 2*s, 8*s);
      } else {
        this.ctx.fillRect(px + 3*s, py + 2*s, 2*s, 8*s);
      }
    }
    
    // Add team glow effect
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = colors.primary;
    this.ctx.beginPath();
    this.ctx.arc(px, py - 4*s, 12*s, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;
  }
  
  // Draw a creep (smaller than hero)
  drawCreep(
    position: Vector2,
    team: Team,
    creepType: 'melee' | 'ranged' | 'siege',
    direction: Direction,
    scale: number = 1
  ): void {
    const colors = team === 'radiant'
      ? { primary: COLORS.radiantPrimary, secondary: COLORS.radiantSecondary }
      : { primary: COLORS.direPrimary, secondary: COLORS.direSecondary };
    
    const frame = Math.floor(this.animationTime * 6) % 4;
    const bobOffset = Math.sin(frame * Math.PI / 2) * 1;
    
    const px = Math.floor(position.x);
    const py = Math.floor(position.y + bobOffset);
    const s = scale;
    
    if (creepType === 'melee') {
      // Melee creep - small warrior
      this.ctx.fillStyle = colors.primary;
      this.ctx.fillRect(px - 3*s, py - 4*s, 6*s, 6*s);
      
      this.ctx.fillStyle = colors.secondary;
      this.ctx.fillRect(px - 2*s, py - 6*s, 4*s, 2*s);
      
      // Eyes
      this.ctx.fillStyle = COLORS.white;
      this.ctx.fillRect(px - 2*s, py - 3*s, 2*s, 2*s);
      this.ctx.fillRect(px + 0*s, py - 3*s, 2*s, 2*s);
      
      this.ctx.fillStyle = COLORS.black;
      this.ctx.fillRect(px - 1*s, py - 2*s, 1*s, 1*s);
      this.ctx.fillRect(px + 1*s, py - 2*s, 1*s, 1*s);
      
      // Legs
      this.ctx.fillStyle = colors.secondary;
      this.ctx.fillRect(px - 2*s, py + 2*s, 2*s, 2*s);
      this.ctx.fillRect(px + 0*s, py + 2*s, 2*s, 2*s);
    } else if (creepType === 'ranged') {
      // Ranged creep - archer style
      this.ctx.fillStyle = colors.primary;
      this.ctx.fillRect(px - 3*s, py - 5*s, 6*s, 7*s);
      
      // Hood
      this.ctx.fillStyle = colors.secondary;
      this.ctx.fillRect(px - 3*s, py - 7*s, 6*s, 3*s);
      
      // Bow
      this.ctx.fillStyle = '#8B4513';
      if (direction === 'right') {
        this.ctx.fillRect(px + 3*s, py - 5*s, 1*s, 6*s);
      } else {
        this.ctx.fillRect(px - 4*s, py - 5*s, 1*s, 6*s);
      }
    } else {
      // Siege creep - catapult
      this.ctx.fillStyle = '#8B4513';
      this.ctx.fillRect(px - 5*s, py - 3*s, 10*s, 5*s);
      
      this.ctx.fillStyle = colors.primary;
      this.ctx.fillRect(px - 4*s, py - 6*s, 4*s, 3*s);
      
      // Wheels
      this.ctx.fillStyle = '#5D4037';
      this.ctx.fillRect(px - 5*s, py + 2*s, 3*s, 3*s);
      this.ctx.fillRect(px + 2*s, py + 2*s, 3*s, 3*s);
    }
  }
  
  // Draw a tower
  drawTower(
    position: Vector2,
    team: Team,
    tier: number,
    healthPercent: number,
    scale: number = 1
  ): void {
    const colors = team === 'radiant'
      ? { primary: COLORS.towerRadiant, secondary: '#00838F', stone: '#607D8B' }
      : { primary: COLORS.towerDire, secondary: '#BF360C', stone: '#795548' };
    
    const px = Math.floor(position.x);
    const py = Math.floor(position.y);
    const s = scale;
    
    // Tower height based on tier
    const height = (12 + tier * 4) * s;
    const width = (8 + tier * 2) * s;
    
    // Stone base
    this.ctx.fillStyle = colors.stone;
    this.ctx.fillRect(px - width/2, py - height, width, height);
    
    // Stone texture
    this.ctx.fillStyle = '#424242';
    for (let row = 0; row < Math.floor(height / (4*s)); row++) {
      const offset = (row % 2) * 4 * s;
      for (let col = 0; col < Math.floor(width / (8*s)); col++) {
        this.ctx.fillRect(
          px - width/2 + offset + col * 8 * s, 
          py - height + row * 4 * s, 
          1*s, 
          4*s
        );
      }
    }
    
    // Tower top (crystal/fire)
    const topSize = 6 * s;
    this.ctx.fillStyle = colors.primary;
    
    // Animated glow
    const glowOffset = Math.sin(this.animationTime * 4) * 2;
    this.ctx.fillRect(px - topSize/2, py - height - topSize - glowOffset, topSize, topSize);
    
    // Glow effect
    this.ctx.globalAlpha = 0.4 + Math.sin(this.animationTime * 4) * 0.2;
    this.ctx.fillStyle = colors.primary;
    this.ctx.beginPath();
    this.ctx.arc(px, py - height - topSize/2, topSize * 1.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;
    
    // Health bar above tower
    const barWidth = width + 8*s;
    const barHeight = 4*s;
    const barY = py - height - topSize - 10*s;
    
    this.ctx.fillStyle = COLORS.black;
    this.ctx.fillRect(px - barWidth/2 - 1*s, barY - 1*s, barWidth + 2*s, barHeight + 2*s);
    
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(px - barWidth/2, barY, barWidth, barHeight);
    
    this.ctx.fillStyle = healthPercent > 0.3 ? COLORS.healthGreen : COLORS.healthRed;
    this.ctx.fillRect(px - barWidth/2, barY, barWidth * healthPercent, barHeight);
  }
  
  // Draw a building (Ancient, Barracks)
  drawBuilding(
    position: Vector2,
    team: Team,
    buildingType: 'ancient' | 'barracks_melee' | 'barracks_ranged' | 'fountain',
    healthPercent: number,
    scale: number = 1
  ): void {
    const colors = team === 'radiant'
      ? { primary: COLORS.radiantPrimary, secondary: COLORS.radiantSecondary, stone: '#607D8B' }
      : { primary: COLORS.direPrimary, secondary: COLORS.direSecondary, stone: '#795548' };
    
    const px = Math.floor(position.x);
    const py = Math.floor(position.y);
    const s = scale;
    
    if (buildingType === 'ancient') {
      // Large ancient building
      const size = 32 * s;
      
      // Base structure
      this.ctx.fillStyle = colors.stone;
      this.ctx.fillRect(px - size/2, py - size/2, size, size/2);
      
      // Ancient crystal
      this.ctx.fillStyle = colors.primary;
      const crystalHeight = size * 0.7;
      this.ctx.beginPath();
      this.ctx.moveTo(px, py - size/2 - crystalHeight);
      this.ctx.lineTo(px - size/3, py - size/2);
      this.ctx.lineTo(px + size/3, py - size/2);
      this.ctx.closePath();
      this.ctx.fill();
      
      // Glow
      this.ctx.globalAlpha = 0.5 + Math.sin(this.animationTime * 3) * 0.3;
      this.ctx.fillStyle = colors.primary;
      this.ctx.beginPath();
      this.ctx.arc(px, py - size/2 - crystalHeight/2, size/2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    } else if (buildingType === 'fountain') {
      // Fountain
      const size = 24 * s;
      
      // Base
      this.ctx.fillStyle = colors.stone;
      this.ctx.fillRect(px - size/2, py - size/4, size, size/2);
      
      // Water
      this.ctx.fillStyle = COLORS.water;
      this.ctx.fillRect(px - size/2 + 2*s, py - size/4 + 2*s, size - 4*s, size/2 - 4*s);
      
      // Water animation
      this.ctx.fillStyle = COLORS.waterLight;
      const waveOffset = Math.sin(this.animationTime * 4) * 2;
      this.ctx.fillRect(px - size/4 + waveOffset, py - size/4 + 4*s, size/4, 2*s);
    } else {
      // Barracks
      const size = 20 * s;
      
      // Building
      this.ctx.fillStyle = colors.stone;
      this.ctx.fillRect(px - size/2, py - size/2, size, size);
      
      // Roof
      this.ctx.fillStyle = colors.secondary;
      this.ctx.fillRect(px - size/2 - 2*s, py - size/2 - 4*s, size + 4*s, 6*s);
      
      // Door
      this.ctx.fillStyle = '#3E2723';
      this.ctx.fillRect(px - 3*s, py, 6*s, size/2);
      
      // Symbol based on type
      this.ctx.fillStyle = colors.primary;
      if (buildingType === 'barracks_melee') {
        // Sword symbol
        this.ctx.fillRect(px - 1*s, py - size/2 + 8*s, 2*s, 8*s);
        this.ctx.fillRect(px - 3*s, py - size/2 + 10*s, 6*s, 2*s);
      } else {
        // Arrow symbol
        this.ctx.fillRect(px - 1*s, py - size/2 + 8*s, 2*s, 10*s);
        this.ctx.fillRect(px - 3*s, py - size/2 + 8*s, 2*s, 3*s);
        this.ctx.fillRect(px + 1*s, py - size/2 + 8*s, 2*s, 3*s);
      }
    }
  }
  
  // Draw a projectile
  drawProjectile(
    position: Vector2,
    direction: Vector2,
    projectileType: 'arrow' | 'magic' | 'tower',
    team: Team,
    scale: number = 1
  ): void {
    const px = Math.floor(position.x);
    const py = Math.floor(position.y);
    const s = scale;
    
    // Calculate rotation from direction
    const angle = Math.atan2(direction.y, direction.x);
    
    this.ctx.save();
    this.ctx.translate(px, py);
    this.ctx.rotate(angle);
    
    if (projectileType === 'arrow') {
      // Arrow
      this.ctx.fillStyle = '#8B4513';
      this.ctx.fillRect(-6*s, -1*s, 10*s, 2*s);
      
      this.ctx.fillStyle = '#C0C0C0';
      this.ctx.fillRect(4*s, -2*s, 4*s, 4*s);
    } else if (projectileType === 'magic') {
      // Magic orb
      const color = team === 'radiant' ? COLORS.radiantPrimary : COLORS.direPrimary;
      
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 4*s, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.globalAlpha = 0.5;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 6*s, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    } else {
      // Tower shot
      const color = team === 'radiant' ? COLORS.towerRadiant : COLORS.towerDire;
      
      this.ctx.fillStyle = color;
      this.ctx.fillRect(-4*s, -2*s, 8*s, 4*s);
      
      this.ctx.globalAlpha = 0.6;
      this.ctx.fillRect(-6*s, -3*s, 12*s, 6*s);
      this.ctx.globalAlpha = 1.0;
    }
    
    this.ctx.restore();
  }
  
  // Draw attack effect
  drawAttackEffect(position: Vector2, type: 'melee' | 'ranged', progress: number): void {
    if (progress >= 1) return;
    
    const px = Math.floor(position.x);
    const py = Math.floor(position.y);
    
    this.ctx.globalAlpha = 1 - progress;
    
    if (type === 'melee') {
      // Slash effect
      const size = 20 + progress * 30;
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 3 - progress * 2;
      this.ctx.beginPath();
      this.ctx.arc(px, py, size, -Math.PI/4, Math.PI/4);
      this.ctx.stroke();
    } else {
      // Impact effect
      const size = 5 + progress * 15;
      this.ctx.fillStyle = '#FFEB3B';
      this.ctx.beginPath();
      this.ctx.arc(px, py, size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.globalAlpha = 1.0;
  }
  
  // Draw ability effect
  drawAbilityEffect(
    position: Vector2,
    radius: number,
    color: string,
    progress: number
  ): void {
    if (progress >= 1) return;
    
    const px = Math.floor(position.x);
    const py = Math.floor(position.y);
    
    this.ctx.globalAlpha = (1 - progress) * 0.6;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(px, py, radius * progress, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 1 - progress;
    this.ctx.stroke();
    
    this.ctx.globalAlpha = 1.0;
  }
  
  // Draw gold pickup effect
  drawGoldEffect(position: Vector2, amount: number, progress: number): void {
    if (progress >= 1) return;
    
    const px = Math.floor(position.x);
    const py = Math.floor(position.y - progress * 30);
    
    this.ctx.globalAlpha = 1 - progress;
    this.ctx.fillStyle = COLORS.gold;
    this.ctx.font = FONTS.pixelMedium;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`+${amount}`, px, py);
    this.ctx.globalAlpha = 1.0;
  }
  
  // Draw damage number
  drawDamageNumber(position: Vector2, damage: number, progress: number, isCrit: boolean = false): void {
    if (progress >= 1) return;
    
    const px = Math.floor(position.x);
    const py = Math.floor(position.y - progress * 40);
    
    this.ctx.globalAlpha = 1 - progress;
    this.ctx.fillStyle = isCrit ? '#FF5722' : '#FFFFFF';
    this.ctx.font = isCrit ? FONTS.pixelLarge : FONTS.pixelSmall;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${Math.floor(damage)}`, px, py);
    this.ctx.globalAlpha = 1.0;
  }
  
  // Draw a tree
  drawTree(position: Vector2, variant: number = 0, scale: number = 1): void {
    const px = Math.floor(position.x);
    const py = Math.floor(position.y);
    const s = scale;
    
    // Trunk
    this.ctx.fillStyle = '#5D4037';
    this.ctx.fillRect(px - 2*s, py - 4*s, 4*s, 8*s);
    
    // Leaves (different shapes based on variant)
    this.ctx.fillStyle = COLORS.tree;
    if (variant % 3 === 0) {
      // Round tree
      this.ctx.beginPath();
      this.ctx.arc(px, py - 10*s, 8*s, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = COLORS.treeLeaves;
      this.ctx.beginPath();
      this.ctx.arc(px - 2*s, py - 12*s, 4*s, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (variant % 3 === 1) {
      // Triangular tree
      this.ctx.beginPath();
      this.ctx.moveTo(px, py - 20*s);
      this.ctx.lineTo(px - 8*s, py - 4*s);
      this.ctx.lineTo(px + 8*s, py - 4*s);
      this.ctx.closePath();
      this.ctx.fill();
    } else {
      // Double layer tree
      this.ctx.beginPath();
      this.ctx.moveTo(px, py - 16*s);
      this.ctx.lineTo(px - 6*s, py - 8*s);
      this.ctx.lineTo(px + 6*s, py - 8*s);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.moveTo(px, py - 10*s);
      this.ctx.lineTo(px - 8*s, py - 2*s);
      this.ctx.lineTo(px + 8*s, py - 2*s);
      this.ctx.closePath();
      this.ctx.fill();
    }
  }
  
  // Draw terrain tile
  drawTerrainTile(
    x: number,
    y: number,
    tileSize: number,
    tileType: 'grass' | 'road' | 'water' | 'river',
    variant: number = 0
  ): void {
    const isLight = variant % 2 === 0;
    
    switch (tileType) {
      case 'grass':
        this.ctx.fillStyle = isLight ? COLORS.grass : COLORS.grassLight;
        this.ctx.fillRect(x, y, tileSize, tileSize);
        // Add grass detail
        if (variant % 5 === 0) {
          this.ctx.fillStyle = COLORS.treeLeaves;
          this.ctx.fillRect(x + 4, y + 4, 2, 3);
          this.ctx.fillRect(x + 10, y + 8, 2, 3);
        }
        break;
        
      case 'road':
        this.ctx.fillStyle = isLight ? COLORS.road : COLORS.roadLight;
        this.ctx.fillRect(x, y, tileSize, tileSize);
        // Add road detail
        this.ctx.fillStyle = '#6D5A45';
        if (variant % 4 === 0) {
          this.ctx.fillRect(x + 6, y + 6, 4, 4);
        }
        break;
        
      case 'water':
      case 'river':
        this.ctx.fillStyle = COLORS.water;
        this.ctx.fillRect(x, y, tileSize, tileSize);
        // Water animation
        const waveOffset = Math.sin(this.animationTime * 2 + x * 0.1) * 2;
        this.ctx.fillStyle = COLORS.waterLight;
        this.ctx.fillRect(x + 2 + waveOffset, y + 4, 6, 2);
        this.ctx.fillRect(x + 8 - waveOffset, y + 10, 4, 2);
        break;
    }
  }
}
