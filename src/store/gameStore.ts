import { createStore, useStore } from 'zustand';
import type {
  GameState,
  Cart,
  Cell,
  GameStatus,
  FailureDetails,
  GameEvent,
  GameSettings,
  EventType,
  OreColor
} from '../types/game';
import { levels } from '../data/levels';
import { cloneGrid } from '../utils/gameLogic';

interface GameActions {
  startGame: (levelId: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  nextLevel: () => void;
  updateTime: () => void;
  addCart: (cart: Cart) => void;
  removeCart: (cartId: number) => void;
  updateCart: (cart: Cart) => void;
  updateCarts: (carts: Cart[]) => void;
  setGrid: (grid: Cell[][]) => void;
  toggleSwitch: (x: number, y: number) => void;
  addScore: (points: number) => void;
  incrementDeliveries: () => void;
  setStatus: (status: GameStatus) => void;
  showMessage: (message: string, type: 'success' | 'error' | 'info') => void;
  clearMessage: () => void;
  loadHighScore: () => void;
  setFailureDetails: (details: FailureDetails | null) => void;
  logEvent: (type: EventType, message: string, details?: Record<string, unknown>) => void;
  clearEventLog: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  loadSettings: () => void;
  loadLevelProgress: () => void;
  saveLevelProgress: () => void;
  unlockLevel: (levelId: number) => void;
  setLevelCompleted: (levelId: number, score: number, time: number) => void;
  setHighlightedSwitches: (switches: { x: number; y: number }[]) => void;
  updateElapsedTime: () => void;
}

export type GameStore = GameState & GameActions;

const EVENT_LOG_KEY = 'minecart_eventlog';
const SETTINGS_KEY = 'minecart_settings';
const PROGRESS_KEY = 'minecart_progress';

let eventIdCounter = 0;

const getDefaultLevelProgress = (): Record<number, GameState['levelProgress'][number]> => {
  const progress: Record<number, GameState['levelProgress'][number]> = {};
  levels.forEach((level, index) => {
    progress[level.id] = {
      unlocked: index === 0,
      bestScore: 0,
      bestTime: null,
      completed: false
    };
  });
  return progress;
};

const getInitialState = (): GameState => {
  const savedHighScore = localStorage.getItem('minecart_highscore');
  const savedProgress = localStorage.getItem(PROGRESS_KEY);
  const savedSettings = localStorage.getItem(SETTINGS_KEY);

  let levelProgress = getDefaultLevelProgress();
  if (savedProgress) {
    try {
      const parsed = JSON.parse(savedProgress);
      levelProgress = { ...getDefaultLevelProgress(), ...parsed };
    } catch {
      // ignore parse error
    }
  }

  let settings: GameSettings = {
    hintMode: false,
    slowMode: false,
    showDestination: true
  };
  if (savedSettings) {
    try {
      settings = { ...settings, ...JSON.parse(savedSettings) };
    } catch {
      // ignore parse error
    }
  }

  return {
    currentLevel: 1,
    status: 'idle',
    score: 0,
    highScore: savedHighScore ? parseInt(savedHighScore, 10) : 0,
    deliveries: 0,
    timeRemaining: levels[0].timeLimit,
    levelStartTime: null,
    elapsedTime: 0,
    carts: [],
    grid: cloneGrid(levels[0].grid),
    message: null,
    messageType: null,
    failureDetails: null,
    eventLog: [],
    settings,
    levelProgress,
    highlightedSwitches: []
  };
};

const getColorName = (color: OreColor): string => {
  switch (color) {
    case 'red': return '红色';
    case 'blue': return '蓝色';
    case 'yellow': return '黄色';
  }
};

export const gameStore = createStore<GameStore>((set, get) => ({
  ...getInitialState(),

  startGame: (levelId: number) => {
    const level = levels.find(l => l.id === levelId) || levels[0];
    const settings = get().settings;
    set({
      currentLevel: levelId,
      status: 'playing',
      score: 0,
      deliveries: 0,
      timeRemaining: level.timeLimit,
      levelStartTime: Date.now(),
      elapsedTime: 0,
      carts: [],
      grid: cloneGrid(level.grid),
      message: null,
      messageType: null,
      failureDetails: null,
      eventLog: [],
      highlightedSwitches: [],
      settings
    });
    get().logEvent('game_start', `开始第 ${levelId} 关：${level.name}`, { levelId, levelName: level.name });
  },

  pauseGame: () => {
    if (get().status === 'playing') {
      set({ status: 'paused' });
      get().logEvent('game_pause', '游戏已暂停');
    }
  },

  resumeGame: () => {
    if (get().status === 'paused') {
      set({ status: 'playing' });
      get().logEvent('game_resume', '游戏已继续');
    }
  },

  restartGame: () => {
    const { currentLevel, settings } = get();
    const level = levels.find(l => l.id === currentLevel) || levels[0];
    set({
      status: 'playing',
      score: 0,
      deliveries: 0,
      timeRemaining: level.timeLimit,
      levelStartTime: Date.now(),
      elapsedTime: 0,
      carts: [],
      grid: cloneGrid(level.grid),
      message: null,
      messageType: null,
      failureDetails: null,
      eventLog: [],
      highlightedSwitches: [],
      settings
    });
    get().logEvent('game_restart', `重新开始第 ${currentLevel} 关`, { levelId: currentLevel });
  },

  nextLevel: () => {
    const { currentLevel } = get();
    const nextLevelId = currentLevel + 1;
    const level = levels.find(l => l.id === nextLevelId);
    if (level) {
      get().logEvent('game_start', `进入第 ${nextLevelId} 关：${level.name}`, { levelId: nextLevelId, levelName: level.name });
      set({
        currentLevel: nextLevelId,
        status: 'playing',
        score: 0,
        deliveries: 0,
        timeRemaining: level.timeLimit,
        levelStartTime: Date.now(),
        elapsedTime: 0,
        carts: [],
        grid: cloneGrid(level.grid),
        message: null,
        messageType: null,
        failureDetails: null,
        eventLog: [],
        highlightedSwitches: []
      });
    }
  },

  updateTime: () => {
    const { timeRemaining, status } = get();
    if (status === 'playing' && timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },

  updateElapsedTime: () => {
    const { levelStartTime, status } = get();
    if (status === 'playing' && levelStartTime) {
      set({ elapsedTime: Math.floor((Date.now() - levelStartTime) / 1000) });
    }
  },

  addCart: (cart: Cart) => {
    const level = levels.find(l => l.id === get().currentLevel) || levels[0];
    const targetWarehouse = level.warehouses.find(w => w.color === cart.color);
    const cartWithTarget: Cart = {
      ...cart,
      targetWarehouse
    };
    set(state => ({ carts: [...state.carts, cartWithTarget] }));
    get().logEvent('cart_spawn',
      `${getColorName(cart.color)}矿车 #${cart.id} 从入口 (${cart.x},${cart.y}) 驶出，目标：${getColorName(cart.color)}仓库`,
      { cartId: cart.id, color: cart.color, position: { x: cart.x, y: cart.y }, targetWarehouse }
    );
  },

  removeCart: (cartId: number) => {
    set(state => ({ carts: state.carts.filter(c => c.id !== cartId) }));
  },

  updateCart: (cart: Cart) => {
    set(state => ({
      carts: state.carts.map(c => c.id === cart.id ? cart : c)
    }));
  },

  updateCarts: (carts: Cart[]) => {
    set({ carts });
  },

  setGrid: (grid: Cell[][]) => {
    set({ grid });
  },

  toggleSwitch: (x: number, y: number) => {
    const { grid } = get();
    const newGrid = grid.map(row => [...row]);
    const cell = newGrid[y][x];

    if (cell.type === 'switch' && cell.switchConfig) {
      const newCurrent = cell.switchConfig.current === 0 ? 1 : 0;
      const newDirection = newCurrent === 0 ? cell.switchConfig.direction1 : cell.switchConfig.direction2;
      newGrid[y][x] = {
        ...cell,
        switchConfig: {
          ...cell.switchConfig,
          current: newCurrent
        }
      };
      set({ grid: newGrid });
      get().logEvent('switch_toggle',
        `道岔 (${x},${y}) 切换方向 → ${newDirection === 'up' ? '↑' : newDirection === 'down' ? '↓' : newDirection === 'left' ? '←' : '→'}`,
        { position: { x, y }, direction: newDirection }
      );
    }
  },

  addScore: (points: number) => {
    const { score, highScore } = get();
    const newScore = score + points;
    const newHighScore = Math.max(highScore, newScore);

    if (newHighScore > highScore) {
      localStorage.setItem('minecart_highscore', newHighScore.toString());
    }

    set({
      score: newScore,
      highScore: newHighScore
    });
  },

  incrementDeliveries: () => {
    set(state => ({ deliveries: state.deliveries + 1 }));
  },

  setStatus: (status: GameStatus) => {
    set({ status });
  },

  showMessage: (message: string, type: 'success' | 'error' | 'info') => {
    set({ message, messageType: type });
  },

  clearMessage: () => {
    set({ message: null, messageType: null });
  },

  loadHighScore: () => {
    const savedHighScore = localStorage.getItem('minecart_highscore');
    if (savedHighScore) {
      set({ highScore: parseInt(savedHighScore, 10) });
    }
  },

  setFailureDetails: (details: FailureDetails | null) => {
    set({ failureDetails: details });
    if (details) {
      get().logEvent('game_lost', details.message, details as unknown as Record<string, unknown>);
    }
  },

  logEvent: (type: EventType, message: string, details?: Record<string, unknown>) => {
    const event: GameEvent = {
      id: ++eventIdCounter,
      timestamp: Date.now(),
      type,
      message,
      details
    };
    set(state => ({
      eventLog: [event, ...state.eventLog].slice(0, 50)
    }));
    try {
      localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(get().eventLog.slice(0, 100)));
    } catch {
      // ignore storage error
    }
  },

  clearEventLog: () => {
    set({ eventLog: [] });
    try {
      localStorage.removeItem(EVENT_LOG_KEY);
    } catch {
      // ignore
    }
  },

  updateSettings: (newSettings: Partial<GameSettings>) => {
    set(state => {
      const merged = { ...state.settings, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }
      return { settings: merged };
    });
  },

  loadSettings: () => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        set(state => ({ settings: { ...state.settings, ...parsed } }));
      } catch {
        // ignore
      }
    }
  },

  loadLevelProgress: () => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        set(() => ({ levelProgress: { ...getDefaultLevelProgress(), ...parsed } }));
      } catch {
        // ignore
      }
    }
  },

  saveLevelProgress: () => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(get().levelProgress));
    } catch {
      // ignore
    }
  },

  unlockLevel: (levelId: number) => {
    set(state => {
      const progress = { ...state.levelProgress };
      if (progress[levelId]) {
        progress[levelId] = { ...progress[levelId], unlocked: true };
      }
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      } catch {
        // ignore
      }
      return { levelProgress: progress };
    });
  },

  setLevelCompleted: (levelId: number, score: number, time: number) => {
    set(state => {
      const progress = { ...state.levelProgress };
      if (progress[levelId]) {
        const prevProgress = progress[levelId];
        progress[levelId] = {
          ...prevProgress,
          completed: true,
          unlocked: true,
          bestScore: Math.max(prevProgress.bestScore, score),
          bestTime: prevProgress.bestTime === null ? time : Math.min(prevProgress.bestTime, time)
        };
      }
      const nextId = levelId + 1;
      if (progress[nextId]) {
        progress[nextId] = { ...progress[nextId], unlocked: true };
      }
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
      } catch {
        // ignore
      }
      return { levelProgress: progress };
    });
    get().logEvent('game_won', `第 ${levelId} 关通关！得分 ${score}，用时 ${time}s`, { levelId, score, time });
  },

  setHighlightedSwitches: (switches: { x: number; y: number }[]) => {
    set({ highlightedSwitches: switches });
  }
}));

export const useGameStore = <T,>(selector: (state: GameStore) => T): T => {
  return useStore(gameStore, selector);
};
