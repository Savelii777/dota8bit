import { Vector2, PathNode, GAME_CONSTANTS } from '@/types';

export class Pathfinding {
  private _grid: boolean[][];  // true = walkable
  private _width: number;
  private _height: number;
  
  constructor(width: number = GAME_CONSTANTS.MAP_WIDTH, height: number = GAME_CONSTANTS.MAP_HEIGHT) {
    this._width = width;
    this._height = height;
    this._grid = [];
    
    // Initialize grid as all walkable
    for (let y = 0; y < height; y++) {
      this._grid[y] = [];
      for (let x = 0; x < width; x++) {
        this._grid[y][x] = true;
      }
    }
  }
  
  setWalkable(x: number, y: number, walkable: boolean): void {
    if (this.isValidPosition(x, y)) {
      this._grid[y][x] = walkable;
    }
  }
  
  isWalkable(x: number, y: number): boolean {
    if (!this.isValidPosition(x, y)) return false;
    return this._grid[y][x];
  }
  
  isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this._width && y >= 0 && y < this._height;
  }
  
  // Convert world position to grid position
  worldToGrid(worldPos: Vector2): Vector2 {
    return {
      x: Math.floor(worldPos.x / GAME_CONSTANTS.TILE_SIZE),
      y: Math.floor(worldPos.y / GAME_CONSTANTS.TILE_SIZE),
    };
  }
  
  // Convert grid position to world position (center of tile)
  gridToWorld(gridPos: Vector2): Vector2 {
    return {
      x: gridPos.x * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2,
      y: gridPos.y * GAME_CONSTANTS.TILE_SIZE + GAME_CONSTANTS.TILE_SIZE / 2,
    };
  }
  
  // A* pathfinding algorithm
  findPath(startWorld: Vector2, endWorld: Vector2): Vector2[] {
    const start = this.worldToGrid(startWorld);
    const end = this.worldToGrid(endWorld);
    
    // If start or end is not walkable, return empty path
    if (!this.isWalkable(start.x, start.y) || !this.isWalkable(end.x, end.y)) {
      return [];
    }
    
    // If start equals end, return empty path
    if (start.x === end.x && start.y === end.y) {
      return [];
    }
    
    const openList: PathNode[] = [];
    const closedSet: Set<string> = new Set();
    
    const startNode: PathNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: this.heuristic(start, end),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;
    
    openList.push(startNode);
    
    while (openList.length > 0) {
      // Find node with lowest f score
      let lowestIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[lowestIndex].f) {
          lowestIndex = i;
        }
      }
      
      const current = openList[lowestIndex];
      
      // Check if we reached the goal
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(current);
      }
      
      // Move current from open to closed
      openList.splice(lowestIndex, 1);
      closedSet.add(`${current.x},${current.y}`);
      
      // Check neighbors
      const neighbors = this.getNeighbors(current.x, current.y);
      
      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        
        if (closedSet.has(key)) continue;
        if (!this.isWalkable(neighbor.x, neighbor.y)) continue;
        
        // Calculate tentative g score
        const isDiagonal = neighbor.x !== current.x && neighbor.y !== current.y;
        const moveCost = isDiagonal ? 1.414 : 1;
        const tentativeG = current.g + moveCost;
        
        // Find if neighbor is in open list
        const existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
        
        if (!existingNode) {
          // Add new node
          const newNode: PathNode = {
            x: neighbor.x,
            y: neighbor.y,
            g: tentativeG,
            h: this.heuristic(neighbor, end),
            f: 0,
            parent: current,
          };
          newNode.f = newNode.g + newNode.h;
          openList.push(newNode);
        } else if (tentativeG < existingNode.g) {
          // Update existing node
          existingNode.g = tentativeG;
          existingNode.f = existingNode.g + existingNode.h;
          existingNode.parent = current;
        }
      }
    }
    
    // No path found
    return [];
  }
  
  private getNeighbors(x: number, y: number): Vector2[] {
    const neighbors: Vector2[] = [];
    
    // 8-directional movement
    const directions = [
      { x: 0, y: -1 },  // up
      { x: 1, y: -1 },  // up-right
      { x: 1, y: 0 },   // right
      { x: 1, y: 1 },   // down-right
      { x: 0, y: 1 },   // down
      { x: -1, y: 1 },  // down-left
      { x: -1, y: 0 },  // left
      { x: -1, y: -1 }, // up-left
    ];
    
    for (const dir of directions) {
      const nx = x + dir.x;
      const ny = y + dir.y;
      
      if (this.isValidPosition(nx, ny)) {
        // For diagonal movement, check if we can move diagonally
        // (both adjacent tiles must be walkable to prevent corner cutting)
        if (dir.x !== 0 && dir.y !== 0) {
          if (this.isWalkable(x + dir.x, y) && this.isWalkable(x, y + dir.y)) {
            neighbors.push({ x: nx, y: ny });
          }
        } else {
          neighbors.push({ x: nx, y: ny });
        }
      }
    }
    
    return neighbors;
  }
  
  private heuristic(a: Vector2, b: Vector2): number {
    // Octile distance (better for 8-directional movement)
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
  }
  
  private reconstructPath(endNode: PathNode): Vector2[] {
    const path: Vector2[] = [];
    let current: PathNode | null = endNode;
    
    while (current !== null) {
      // Convert to world coordinates
      path.unshift(this.gridToWorld({ x: current.x, y: current.y }));
      current = current.parent;
    }
    
    // Remove start position from path
    if (path.length > 0) {
      path.shift();
    }
    
    return path;
  }
  
  // Update grid from map data
  updateFromMap(walkableGrid: boolean[][]): void {
    for (let y = 0; y < this._height && y < walkableGrid.length; y++) {
      for (let x = 0; x < this._width && x < walkableGrid[y].length; x++) {
        this._grid[y][x] = walkableGrid[y][x];
      }
    }
  }
  
  // Smooth path to reduce waypoints
  smoothPath(path: Vector2[]): Vector2[] {
    if (path.length <= 2) return path;
    
    const smoothed: Vector2[] = [path[0]];
    let current = 0;
    
    while (current < path.length - 1) {
      // Try to skip waypoints if there's a clear line of sight
      let farthest = current + 1;
      
      for (let i = path.length - 1; i > current + 1; i--) {
        if (this.hasLineOfSight(path[current], path[i])) {
          farthest = i;
          break;
        }
      }
      
      smoothed.push(path[farthest]);
      current = farthest;
    }
    
    return smoothed;
  }
  
  // Check if there's a clear line between two points
  hasLineOfSight(start: Vector2, end: Vector2): boolean {
    const startGrid = this.worldToGrid(start);
    const endGrid = this.worldToGrid(end);
    
    const dx = Math.abs(endGrid.x - startGrid.x);
    const dy = Math.abs(endGrid.y - startGrid.y);
    const sx = startGrid.x < endGrid.x ? 1 : -1;
    const sy = startGrid.y < endGrid.y ? 1 : -1;
    
    let err = dx - dy;
    let x = startGrid.x;
    let y = startGrid.y;
    
    while (true) {
      if (!this.isWalkable(x, y)) {
        return false;
      }
      
      if (x === endGrid.x && y === endGrid.y) {
        break;
      }
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
    
    return true;
  }
}
