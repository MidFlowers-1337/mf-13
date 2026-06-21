import { useEffect, useRef } from 'react';
import { gameStore, useGameStore } from '../store/gameStore';
import { levels } from '../data/levels';
import {
  getNextPosition,
  isInBounds,
  getCell,
  getCartNextDirection,
  checkCollision,
  checkWarehouse,
  getRandomOreColor
} from '../utils/gameLogic';
import type { Cart, Direction, OreColor, Cell } from '../types/game';

let cartIdCounter = 0;

const HIGH_SCORE_KEY = 'minecart_highscore';

export const useGameEngine = () => {
  const status = useGameStore(s => s.status);
  const currentLevel = useGameStore(s => s.currentLevel);
  const message = useGameStore(s => s.message);
  const highScore = useGameStore(s => s.highScore);

  const spawnTimerRef = useRef<number | null>(null);
  const moveTimerRef = useRef<number | null>(null);
  const gameTimerRef = useRef<number | null>(null);
  const messageTimerRef = useRef<number | null>(null);
  const isPausedRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);
  const firstSpawnDoneRef = useRef<boolean>(false);

  const clearAllTimers = () => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
    if (moveTimerRef.current) {
      clearInterval(moveTimerRef.current);
      moveTimerRef.current = null;
    }
    firstSpawnDoneRef.current = false;
  };

  const spawnCart = () => {
    const state = gameStore.getState();
    if (state.status !== 'playing' || isPausedRef.current) return;

    const level = levels.find(l => l.id === state.currentLevel) || levels[0];

    const availableEntrances = level.entrances.filter(
      entrance => !checkCollision(state.carts, entrance.x, entrance.y)
    );

    if (availableEntrances.length === 0) return;

    const entrance = availableEntrances[Math.floor(Math.random() * availableEntrances.length)];
    const color: OreColor = getRandomOreColor();

    const newCart: Cart = {
      id: ++cartIdCounter,
      x: entrance.x,
      prevX: entrance.x,
      prevY: entrance.y,
      y: entrance.y,
      color,
      direction: entrance.direction,
      moving: true
    };

    gameStore.getState().addCart(newCart);
  };

  const moveCarts = () => {
    if (isProcessingRef.current) return;
    const state = gameStore.getState();
    if (state.status !== 'playing' || isPausedRef.current) return;

    isProcessingRef.current = true;

    try {
      const level = levels.find(l => l.id === state.currentLevel) || levels[0];
      const carts = [...state.carts];
      const grid: Cell[][] = state.grid;

      const updatedCarts: Cart[] = [];
      const cartsToRemove: number[] = [];
      let gameOver = false;
      let gameOverReason = '';
      let deliveredThisTick = 0;

      for (const cart of carts) {
        const currentCell = getCell(grid, cart.x, cart.y);
        if (!currentCell) {
          gameOver = true;
          gameOverReason = '矿车驶出轨道！';
          break;
        }

        const nextDirection: Direction = getCartNextDirection(cart, currentCell);
        const nextPos = getNextPosition(cart.x, cart.y, nextDirection);

        if (!isInBounds(nextPos.x, nextPos.y)) {
          gameOver = true;
          gameOverReason = '矿车驶出轨道！';
          break;
        }

        const nextCell = getCell(grid, nextPos.x, nextPos.y);
        if (!nextCell || nextCell.type === 'empty') {
          gameOver = true;
          gameOverReason = '矿车驶出轨道！';
          break;
        }

        const otherCartsAtNext = carts.filter(c => c.id !== cart.id).some(c => c.x === nextPos.x && c.y === nextPos.y);
        const updatedCartsAtNext = updatedCarts.some(c => c.x === nextPos.x && c.y === nextPos.y);
        if (otherCartsAtNext || updatedCartsAtNext) {
          gameOver = true;
          gameOverReason = '两辆矿车相撞了！';
          break;
        }

        const warehouseCheck = checkWarehouse(nextCell, cart.color);
        if (warehouseCheck.isWarehouse) {
          if (warehouseCheck.success) {
            cartsToRemove.push(cart.id);
            deliveredThisTick++;
          } else {
            gameOver = true;
            gameOverReason = '矿石送错仓库了！';
            break;
          }
        } else {
          updatedCarts.push({
            ...cart,
            prevX: cart.x,
            prevY: cart.y,
            x: nextPos.x,
            y: nextPos.y,
            direction: nextDirection
          });
        }
      }

      if (gameOver) {
        gameStore.getState().setStatus('lost');
        gameStore.getState().showMessage(gameOverReason, 'error');
        clearAllTimers();
        return;
      }

      if (deliveredThisTick > 0) {
        const points = deliveredThisTick * 10;
        gameStore.getState().addScore(points);
        for (let i = 0; i < deliveredThisTick; i++) {
          gameStore.getState().incrementDeliveries();
        }
        gameStore.getState().showMessage(`+${points} 分！矿石送达！`, 'success');
      }

      const finalCarts = updatedCarts.filter(c => !cartsToRemove.includes(c.id));
      gameStore.getState().updateCarts(finalCarts);

      const newState = gameStore.getState();
      if (newState.score >= level.targetScore || newState.deliveries >= level.targetDeliveries) {
        gameStore.getState().setStatus('won');
        gameStore.getState().showMessage(`恭喜通关！得分：${newState.score}`, 'success');
        clearAllTimers();

        const currentHighScoreStr = localStorage.getItem(HIGH_SCORE_KEY) || '0';
        const currentHighScore = parseInt(currentHighScoreStr, 10);
        if (newState.score > currentHighScore) {
          localStorage.setItem(HIGH_SCORE_KEY, newState.score.toString());
        }
      }
    } finally {
      isProcessingRef.current = false;
    }
  };

  const updateTimeTick = () => {
    const state = gameStore.getState();
    if (state.status !== 'playing' || isPausedRef.current) return;

    if (state.timeRemaining <= 1) {
      gameStore.getState().setStatus('lost');
      gameStore.getState().showMessage('时间到！任务失败！', 'error');
      clearAllTimers();
    } else {
      gameStore.getState().updateTime();
    }
  };

  const startAllTimers = () => {
    const level = levels.find(l => l.id === gameStore.getState().currentLevel) || levels[0];

    gameTimerRef.current = window.setInterval(updateTimeTick, 1000);
    spawnTimerRef.current = window.setInterval(spawnCart, level.spawnInterval);
    moveTimerRef.current = window.setInterval(moveCarts, level.moveInterval);

    if (!firstSpawnDoneRef.current) {
      firstSpawnDoneRef.current = true;
      window.setTimeout(() => {
        if (gameStore.getState().status === 'playing' && !isPausedRef.current) {
          spawnCart();
        }
      }, 800);
    }
  };

  useEffect(() => {
    if (status === 'playing') {
      isPausedRef.current = false;
      if (spawnTimerRef.current === null && moveTimerRef.current === null && gameTimerRef.current === null) {
        startAllTimers();
      }
    } else if (status === 'paused') {
      isPausedRef.current = true;
    } else if (status === 'idle' || status === 'won' || status === 'lost') {
      isPausedRef.current = false;
      clearAllTimers();
    }
  }, [status, currentLevel]);

  useEffect(() => {
    if (status === 'idle' || status === 'won' || status === 'lost') {
      clearAllTimers();
    }
  }, [status]);

  useEffect(() => {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }
    if (message) {
      messageTimerRef.current = window.setTimeout(() => {
        gameStore.getState().clearMessage();
      }, 2000);
    }

    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, [message]);

  useEffect(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    if (saved) {
      const savedScore = parseInt(saved, 10);
      if (savedScore > highScore) {
        gameStore.setState({ highScore: savedScore });
      }
    }
  }, [highScore]);

  return null;
};
