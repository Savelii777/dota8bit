import { Vector2, CameraState, GAME_CONSTANTS } from '@/types';
import { clamp, vectorLerp } from '@/utils';

export class Camera {
  private _position: Vector2;
  private _targetPosition: Vector2;
  private _zoom: number;
  private _viewportWidth: number;
  private _viewportHeight: number;
  private _lerpSpeed: number;
  
  constructor(
    viewportWidth: number = GAME_CONSTANTS.VIEWPORT_TILES_X * GAME_CONSTANTS.TILE_SIZE,
    viewportHeight: number = GAME_CONSTANTS.VIEWPORT_TILES_Y * GAME_CONSTANTS.TILE_SIZE
  ) {
    this._position = { x: 0, y: 0 };
    this._targetPosition = { x: 0, y: 0 };
    this._zoom = 1;
    this._viewportWidth = viewportWidth;
    this._viewportHeight = viewportHeight;
    this._lerpSpeed = 5; // How fast camera follows target
  }
  
  get position(): Vector2 {
    return { ...this._position };
  }
  
  get zoom(): number {
    return this._zoom;
  }
  
  get viewportWidth(): number {
    return this._viewportWidth / this._zoom;
  }
  
  get viewportHeight(): number {
    return this._viewportHeight / this._zoom;
  }
  
  get state(): CameraState {
    return {
      position: this.position,
      zoom: this._zoom,
      viewportWidth: this._viewportWidth,
      viewportHeight: this._viewportHeight,
    };
  }
  
  setViewportSize(width: number, height: number): void {
    this._viewportWidth = width;
    this._viewportHeight = height;
  }
  
  setZoom(zoom: number): void {
    this._zoom = clamp(zoom, 0.5, 2);
  }
  
  setTarget(target: Vector2): void {
    this._targetPosition = { ...target };
  }
  
  setPosition(position: Vector2): void {
    this._position = { ...position };
    this._targetPosition = { ...position };
  }
  
  centerOn(position: Vector2): void {
    // Center camera on position
    const centered: Vector2 = {
      x: position.x - this.viewportWidth / 2,
      y: position.y - this.viewportHeight / 2,
    };
    this.setPosition(centered);
  }
  
  update(deltaTime: number): void {
    // Smooth lerp towards target
    const t = 1 - Math.exp(-this._lerpSpeed * deltaTime);
    this._position = vectorLerp(this._position, this._targetPosition, t);
    
    // Clamp to map bounds
    const mapWidth = GAME_CONSTANTS.MAP_WIDTH * GAME_CONSTANTS.TILE_SIZE;
    const mapHeight = GAME_CONSTANTS.MAP_HEIGHT * GAME_CONSTANTS.TILE_SIZE;
    
    this._position.x = clamp(this._position.x, 0, mapWidth - this.viewportWidth);
    this._position.y = clamp(this._position.y, 0, mapHeight - this.viewportHeight);
  }
  
  // Convert world position to screen position
  worldToScreen(worldPos: Vector2): Vector2 {
    return {
      x: (worldPos.x - this._position.x) * this._zoom,
      y: (worldPos.y - this._position.y) * this._zoom,
    };
  }
  
  // Convert screen position to world position
  screenToWorld(screenPos: Vector2): Vector2 {
    return {
      x: screenPos.x / this._zoom + this._position.x,
      y: screenPos.y / this._zoom + this._position.y,
    };
  }
  
  // Check if a world position is visible on screen
  isVisible(worldPos: Vector2, padding: number = 32): boolean {
    const screenPos = this.worldToScreen(worldPos);
    return (
      screenPos.x >= -padding &&
      screenPos.x <= this._viewportWidth + padding &&
      screenPos.y >= -padding &&
      screenPos.y <= this._viewportHeight + padding
    );
  }
  
  // Move camera by delta
  pan(delta: Vector2): void {
    this._targetPosition.x += delta.x;
    this._targetPosition.y += delta.y;
  }
}
