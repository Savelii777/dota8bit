import { Vector2, Rectangle, EntityBase } from '@/types';
import { vectorDistance } from '@/utils';

// =====================
// COLLISION DETECTION
// =====================

// Circle-circle collision
export function checkCircleCollision(
  pos1: Vector2,
  radius1: number,
  pos2: Vector2,
  radius2: number
): boolean {
  const distance = vectorDistance(pos1, pos2);
  return distance < radius1 + radius2;
}

// Point-rectangle collision
export function checkPointInRectangle(point: Vector2, rect: Rectangle): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

// Rectangle-rectangle collision
export function checkRectangleCollision(rect1: Rectangle, rect2: Rectangle): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// Point-circle collision
export function checkPointInCircle(point: Vector2, center: Vector2, radius: number): boolean {
  return vectorDistance(point, center) <= radius;
}

// =====================
// QUADTREE FOR SPATIAL PARTITIONING
// =====================

interface QuadTreeNode<T extends { position: Vector2; id: string }> {
  bounds: Rectangle;
  objects: T[];
  children: QuadTreeNode<T>[] | null;
  maxObjects: number;
  maxLevels: number;
  level: number;
}

export class QuadTree<T extends { position: Vector2; id: string }> {
  private _root: QuadTreeNode<T>;
  
  constructor(bounds: Rectangle, maxObjects: number = 10, maxLevels: number = 4) {
    this._root = {
      bounds,
      objects: [],
      children: null,
      maxObjects,
      maxLevels,
      level: 0,
    };
  }
  
  clear(): void {
    this._root.objects = [];
    this._root.children = null;
  }
  
  insert(object: T): void {
    this.insertIntoNode(this._root, object);
  }
  
  private insertIntoNode(node: QuadTreeNode<T>, object: T): void {
    // If we have children, insert into appropriate child
    if (node.children !== null) {
      const index = this.getIndex(node, object.position);
      if (index !== -1) {
        this.insertIntoNode(node.children[index], object);
        return;
      }
    }
    
    // Add to this node
    node.objects.push(object);
    
    // Check if we need to split
    if (node.children === null && node.objects.length > node.maxObjects && node.level < node.maxLevels) {
      this.split(node);
      
      // Move objects to children
      const objectsToMove = [...node.objects];
      node.objects = [];
      
      for (const obj of objectsToMove) {
        const index = this.getIndex(node, obj.position);
        if (index !== -1 && node.children) {
          this.insertIntoNode(node.children[index], obj);
        } else {
          node.objects.push(obj);
        }
      }
    }
  }
  
  private split(node: QuadTreeNode<T>): void {
    const x = node.bounds.x;
    const y = node.bounds.y;
    const subWidth = node.bounds.width / 2;
    const subHeight = node.bounds.height / 2;
    
    node.children = [
      // Top-right
      {
        bounds: { x: x + subWidth, y, width: subWidth, height: subHeight },
        objects: [],
        children: null,
        maxObjects: node.maxObjects,
        maxLevels: node.maxLevels,
        level: node.level + 1,
      },
      // Top-left
      {
        bounds: { x, y, width: subWidth, height: subHeight },
        objects: [],
        children: null,
        maxObjects: node.maxObjects,
        maxLevels: node.maxLevels,
        level: node.level + 1,
      },
      // Bottom-left
      {
        bounds: { x, y: y + subHeight, width: subWidth, height: subHeight },
        objects: [],
        children: null,
        maxObjects: node.maxObjects,
        maxLevels: node.maxLevels,
        level: node.level + 1,
      },
      // Bottom-right
      {
        bounds: { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
        objects: [],
        children: null,
        maxObjects: node.maxObjects,
        maxLevels: node.maxLevels,
        level: node.level + 1,
      },
    ];
  }
  
  private getIndex(node: QuadTreeNode<T>, position: Vector2): number {
    const midX = node.bounds.x + node.bounds.width / 2;
    const midY = node.bounds.y + node.bounds.height / 2;
    
    const top = position.y < midY;
    const left = position.x < midX;
    
    if (left) {
      return top ? 1 : 2;
    } else {
      return top ? 0 : 3;
    }
  }
  
  // Get all objects that might collide with given bounds
  query(range: Rectangle): T[] {
    const found: T[] = [];
    this.queryNode(this._root, range, found);
    return found;
  }
  
  private queryNode(node: QuadTreeNode<T>, range: Rectangle, found: T[]): void {
    // Check if range intersects with node bounds
    if (!checkRectangleCollision(range, node.bounds)) {
      return;
    }
    
    // Add all objects from this node
    for (const obj of node.objects) {
      if (checkPointInRectangle(obj.position, range)) {
        found.push(obj);
      }
    }
    
    // Query children
    if (node.children !== null) {
      for (const child of node.children) {
        this.queryNode(child, range, found);
      }
    }
  }
  
  // Query objects within a circle
  queryCircle(center: Vector2, radius: number): T[] {
    // First get rough candidates from rectangle
    const range: Rectangle = {
      x: center.x - radius,
      y: center.y - radius,
      width: radius * 2,
      height: radius * 2,
    };
    
    const candidates = this.query(range);
    
    // Filter to those actually in circle
    return candidates.filter(obj => 
      vectorDistance(obj.position, center) <= radius
    );
  }
}

// =====================
// COLLISION SYSTEM
// =====================

export class CollisionSystem {
  private _quadTree: QuadTree<EntityBase>;
  private _mapWidth: number;
  private _mapHeight: number;
  
  constructor(mapWidth: number, mapHeight: number) {
    this._mapWidth = mapWidth;
    this._mapHeight = mapHeight;
    this._quadTree = new QuadTree<EntityBase>({
      x: 0,
      y: 0,
      width: mapWidth,
      height: mapHeight,
    });
  }
  
  clear(): void {
    this._quadTree.clear();
  }
  
  addEntity(entity: EntityBase): void {
    this._quadTree.insert(entity);
  }
  
  // Get entities within range of a position
  getEntitiesInRange(position: Vector2, range: number): EntityBase[] {
    return this._quadTree.queryCircle(position, range);
  }
  
  // Get entities in a rectangle
  getEntitiesInRect(rect: Rectangle): EntityBase[] {
    return this._quadTree.query(rect);
  }
  
  // Find nearest entity to a position
  findNearest(position: Vector2, entities: EntityBase[]): EntityBase | null {
    if (entities.length === 0) return null;
    
    let nearest: EntityBase | null = null;
    let nearestDistance = Infinity;
    
    for (const entity of entities) {
      const distance = vectorDistance(position, entity.position);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = entity;
      }
    }
    
    return nearest;
  }
  
  // Check if two entities are colliding (using circle collision)
  areColliding(entity1: EntityBase, entity2: EntityBase, radius1: number = 16, radius2: number = 16): boolean {
    return checkCircleCollision(entity1.position, radius1, entity2.position, radius2);
  }
}
