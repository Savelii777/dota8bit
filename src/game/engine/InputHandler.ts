import { Vector2, InputState } from '@/types';
import { Camera } from './Camera';

export type InputEventCallback = (event: InputEvent) => void;

export interface InputEvent {
  type: 'click' | 'rightClick' | 'keyDown' | 'keyUp' | 'mouseMove';
  position?: Vector2;
  worldPosition?: Vector2;
  key?: string;
  button?: number;
}

export class InputHandler {
  private _canvas: HTMLCanvasElement | null = null;
  private _camera: Camera | null = null;
  private _keys: Map<string, boolean> = new Map();
  private _mousePosition: Vector2 = { x: 0, y: 0 };
  private _mouseWorldPosition: Vector2 = { x: 0, y: 0 };
  private _leftClick: boolean = false;
  private _rightClick: boolean = false;
  private _eventListeners: InputEventCallback[] = [];
  
  // Bound event handlers for proper cleanup
  private _boundHandleKeyDown: (e: KeyboardEvent) => void;
  private _boundHandleKeyUp: (e: KeyboardEvent) => void;
  private _boundHandleMouseMove: (e: MouseEvent) => void;
  private _boundHandleMouseDown: (e: MouseEvent) => void;
  private _boundHandleMouseUp: (e: MouseEvent) => void;
  private _boundHandleContextMenu: (e: Event) => void;
  
  constructor() {
    this._boundHandleKeyDown = this.handleKeyDown.bind(this);
    this._boundHandleKeyUp = this.handleKeyUp.bind(this);
    this._boundHandleMouseMove = this.handleMouseMove.bind(this);
    this._boundHandleMouseDown = this.handleMouseDown.bind(this);
    this._boundHandleMouseUp = this.handleMouseUp.bind(this);
    this._boundHandleContextMenu = (e: Event) => e.preventDefault();
  }
  
  init(canvas: HTMLCanvasElement, camera: Camera): void {
    this._canvas = canvas;
    this._camera = camera;
    
    // Add event listeners
    window.addEventListener('keydown', this._boundHandleKeyDown);
    window.addEventListener('keyup', this._boundHandleKeyUp);
    canvas.addEventListener('mousemove', this._boundHandleMouseMove);
    canvas.addEventListener('mousedown', this._boundHandleMouseDown);
    canvas.addEventListener('mouseup', this._boundHandleMouseUp);
    canvas.addEventListener('contextmenu', this._boundHandleContextMenu);
  }
  
  destroy(): void {
    window.removeEventListener('keydown', this._boundHandleKeyDown);
    window.removeEventListener('keyup', this._boundHandleKeyUp);
    
    if (this._canvas) {
      this._canvas.removeEventListener('mousemove', this._boundHandleMouseMove);
      this._canvas.removeEventListener('mousedown', this._boundHandleMouseDown);
      this._canvas.removeEventListener('mouseup', this._boundHandleMouseUp);
      this._canvas.removeEventListener('contextmenu', this._boundHandleContextMenu);
    }
  }
  
  addEventListener(callback: InputEventCallback): void {
    this._eventListeners.push(callback);
  }
  
  removeEventListener(callback: InputEventCallback): void {
    const index = this._eventListeners.indexOf(callback);
    if (index > -1) {
      this._eventListeners.splice(index, 1);
    }
  }
  
  private emit(event: InputEvent): void {
    for (const listener of this._eventListeners) {
      listener(event);
    }
  }
  
  private handleKeyDown(e: KeyboardEvent): void {
    this._keys.set(e.key.toLowerCase(), true);
    this.emit({ type: 'keyDown', key: e.key.toLowerCase() });
  }
  
  private handleKeyUp(e: KeyboardEvent): void {
    this._keys.set(e.key.toLowerCase(), false);
    this.emit({ type: 'keyUp', key: e.key.toLowerCase() });
  }
  
  private handleMouseMove(e: MouseEvent): void {
    if (!this._canvas) return;
    
    const rect = this._canvas.getBoundingClientRect();
    this._mousePosition = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    
    if (this._camera) {
      this._mouseWorldPosition = this._camera.screenToWorld(this._mousePosition);
    }
    
    this.emit({
      type: 'mouseMove',
      position: { ...this._mousePosition },
      worldPosition: { ...this._mouseWorldPosition },
    });
  }
  
  private handleMouseDown(e: MouseEvent): void {
    if (e.button === 0) {
      this._leftClick = true;
      this.emit({
        type: 'click',
        position: { ...this._mousePosition },
        worldPosition: { ...this._mouseWorldPosition },
        button: 0,
      });
    } else if (e.button === 2) {
      this._rightClick = true;
      this.emit({
        type: 'rightClick',
        position: { ...this._mousePosition },
        worldPosition: { ...this._mouseWorldPosition },
        button: 2,
      });
    }
  }
  
  private handleMouseUp(e: MouseEvent): void {
    if (e.button === 0) {
      this._leftClick = false;
    } else if (e.button === 2) {
      this._rightClick = false;
    }
  }
  
  get state(): InputState {
    return {
      mousePosition: { ...this._mousePosition },
      mouseWorldPosition: { ...this._mouseWorldPosition },
      leftClick: this._leftClick,
      rightClick: this._rightClick,
      keys: Object.fromEntries(this._keys),
    };
  }
  
  isKeyPressed(key: string): boolean {
    return this._keys.get(key.toLowerCase()) || false;
  }
  
  get mousePosition(): Vector2 {
    return { ...this._mousePosition };
  }
  
  get mouseWorldPosition(): Vector2 {
    return { ...this._mouseWorldPosition };
  }
  
  // Update mouse world position (call each frame)
  updateWorldPosition(): void {
    if (this._camera) {
      this._mouseWorldPosition = this._camera.screenToWorld(this._mousePosition);
    }
  }
}
