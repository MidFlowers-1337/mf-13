export type Direction = 'up' | 'down' | 'left' | 'right';

export type OreColor = 'red' | 'blue' | 'yellow';

export type CellType = 'track' | 'switch' | 'entrance' | 'warehouse' | 'empty';

export interface SwitchConfig {
  direction1: Direction;
  direction2: Direction;
  current: 0 | 1;
}

export interface Cell {
  type: CellType;
  switchConfig?: SwitchConfig;
  color?: OreColor;
  entranceDirection?: Direction;
}

export interface Cart {
  id: number;
  x: number;
  y: number;
  color: OreColor;
  direction: Direction;
  moving: boolean;
  prevX: number;
  prevY: number;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  grid: Cell[][];
  entrances: { x: number; y: number; direction: Direction }[];
  warehouses: { x: number; y: number; color: OreColor }[];
  spawnInterval: number;
  moveInterval: number;
  targetScore: number;
  targetDeliveries: number;
  timeLimit: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'lost';

export interface GameState {
  currentLevel: number;
  status: GameStatus;
  score: number;
  highScore: number;
  deliveries: number;
  timeRemaining: number;
  carts: Cart[];
  grid: Cell[][];
  message: string | null;
  messageType: 'success' | 'error' | 'info' | null;
}
