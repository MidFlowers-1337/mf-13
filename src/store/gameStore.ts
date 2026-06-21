import { create } from 'zustand';
import type { GameState, Cart, Cell, GameStatus } from '../types/game';
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
}

const getInitialState = (): GameState => {
  const savedHighScore = localStorage.getItem('minecart_highscore');
  return {
    currentLevel: 1,
    status: 'idle',
    score: 0,
    highScore: savedHighScore ? parseInt(savedHighScore, 10) : 0,
    deliveries: 0,
    timeRemaining: levels[0].timeLimit,
    carts: [],
    grid: cloneGrid(levels[0].grid),
    message: null,
    messageType: null
  };
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...getInitialState(),

  startGame: (levelId: number) => {
    const level = levels.find(l => l.id === levelId) || levels[0];
    set({
      currentLevel: levelId,
      status: 'playing',
      score: 0,
      deliveries: 0,
      timeRemaining: level.timeLimit,
      carts: [],
      grid: cloneGrid(level.grid),
      message: null,
      messageType: null
    });
  },

  pauseGame: () => {
    if (get().status === 'playing') {
      set({ status: 'paused' });
    }
  },

  resumeGame: () => {
    if (get().status === 'paused') {
      set({ status: 'playing' });
    }
  },

  restartGame: () => {
    const { currentLevel } = get();
    const level = levels.find(l => l.id === currentLevel) || levels[0];
    set({
      status: 'playing',
      score: 0,
      deliveries: 0,
      timeRemaining: level.timeLimit,
      carts: [],
      grid: cloneGrid(level.grid),
      message: null,
      messageType: null
    });
  },

  nextLevel: () => {
    const { currentLevel } = get();
    const nextLevelId = currentLevel + 1;
    const level = levels.find(l => l.id === nextLevelId);
    if (level) {
      set({
        currentLevel: nextLevelId,
        status: 'playing',
        score: 0,
        deliveries: 0,
        timeRemaining: level.timeLimit,
        carts: [],
        grid: cloneGrid(level.grid),
        message: null,
        messageType: null
      });
    }
  },

  updateTime: () => {
    const { timeRemaining, status } = get();
    if (status === 'playing' && timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },

  addCart: (cart: Cart) => {
    set(state => ({ carts: [...state.carts, cart] }));
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
      newGrid[y][x] = {
        ...cell,
        switchConfig: {
          ...cell.switchConfig,
          current: cell.switchConfig.current === 0 ? 1 : 0
        }
      };
      set({ grid: newGrid });
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
  }
}));
