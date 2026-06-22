export type Direction = 'up' | 'down' | 'left' | 'right';

export type OreColor = 'red' | 'blue' | 'yellow';

export type CellType = 'track' | 'switch' | 'entrance' | 'warehouse' | 'empty';

export type FailureType = 'wrong_warehouse' | 'collision' | 'derail' | 'timeout';

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
  targetWarehouse?: { x: number; y: number; color: OreColor };
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

export type EventType =
  | 'cart_spawn'
  | 'cart_delivered'
  | 'switch_toggle'
  | 'game_start'
  | 'game_pause'
  | 'game_resume'
  | 'game_restart'
  | 'game_lost'
  | 'game_won';

export interface GameEvent {
  id: number;
  timestamp: number;
  type: EventType;
  message: string;
  details?: Record<string, unknown>;
}

export interface FailureDetails {
  type: FailureType;
  message: string;
  cartId?: number;
  cartColor?: OreColor;
  position?: { x: number; y: number };
  targetWarehouse?: { x: number; y: number; color: OreColor };
  actualWarehouse?: { x: number; y: number; color: OreColor };
  otherCartId?: number;
}

export interface GameSettings {
  hintMode: boolean;
  slowMode: boolean;
  showDestination: boolean;
}

export interface LevelProgress {
  unlocked: boolean;
  bestScore: number;
  bestTime: number | null;
  completed: boolean;
}

export type EditorTool = 'empty' | 'track' | 'switch' | 'entrance' | 'warehouse';

export interface ValidationError {
  type: 'no_entrance' | 'no_warehouse' | 'missing_colors' | 'disconnected_track' | 'orphan_track' | 'entrance_no_exit' | 'warehouse_no_entry';
  message: string;
  position?: { x: number; y: number };
}

export interface CustomLevelMeta {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  oreColors: OreColor[];
  spawnInterval: number;
  moveInterval: number;
  targetScore: number;
  targetDeliveries: number;
  timeLimit: number;
}

export interface CustomLevel extends CustomLevelMeta {
  grid: Cell[][];
  entrances: { x: number; y: number; direction: Direction }[];
  warehouses: { x: number; y: number; color: OreColor }[];
}

export interface TrainingState {
  isTraining: boolean;
  history: TrainingSnapshot[];
  historyIndex: number;
  customLevelId?: string;
}

export interface TrainingSnapshot {
  carts: Cart[];
  grid: Cell[][];
  score: number;
  deliveries: number;
}

export type PageView = 'home' | 'editor' | 'training' | 'levelSelect';

export interface GameState {
  currentLevel: number;
  status: GameStatus;
  score: number;
  highScore: number;
  deliveries: number;
  timeRemaining: number;
  levelStartTime: number | null;
  elapsedTime: number;
  carts: Cart[];
  grid: Cell[][];
  message: string | null;
  messageType: 'success' | 'error' | 'info' | null;
  failureDetails: FailureDetails | null;
  eventLog: GameEvent[];
  settings: GameSettings;
  levelProgress: Record<number, LevelProgress>;
  highlightedSwitches: { x: number; y: number }[];
  currentView: PageView;
  training: TrainingState;
}
