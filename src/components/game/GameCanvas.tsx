'use client';

import React, { useRef, useEffect } from 'react';
import { GameEngine } from '@/game/engine';

interface GameCanvasProps {
  onEngineInit: (engine: GameEngine) => void;
  width?: number;
  height?: number;
}

export function GameCanvas({ onEngineInit, width = 800, height = 600 }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Initialize game engine
    const engine = new GameEngine();
    engine.init(canvas);
    engineRef.current = engine;
    
    onEngineInit(engine);
    
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [onEngineInit]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border-4 border-gray-700 bg-gray-900 [image-rendering:pixelated]"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
