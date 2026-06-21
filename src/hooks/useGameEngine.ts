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
import type { Cart, Direction, OreColor, Cell, FailureDetails, FailureType } from '../types/game';

let cartIdCounter = 0;

const HIGH_SCORE_KEY = 'minecart_highscore';

const getColorName = (color: OreColor): string => {
  switch (color) {
    case 'red': return '红色';
    case 'blue': return '蓝色';
    case 'yellow': return '黄色';
  }
};

export const useGameEngine = () => {
  const status = useGameStore(s => s.status);
  const currentLevel = useGameStore(s => s.currentLevel);
  const message = useGameStore(s => s.message);
  const highScore = useGameStore(s => s.highScore);
  const settings = useGameStore(s => s.settings);
  const carts = useGameStore(s => s.carts);
  const grid = useGameStore(s => s.grid);

  const spawnTimerRef = useRef<number | null>(null);
  const moveTimerRef = useRef<number | null>(null);
  const gameTimerRef = useRef<number | null>(null);
  const hintTimerRef = useRef<number | null>(null);
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
    if (hintTimerRef.current) {
      clearInterval(hintTimerRef.current);
      hintTimerRef.current = null;
    }
    firstSpawnDoneRef.current = false;
  };

  const buildFailureDetails = (
    type: FailureType,
    cart: Cart | null,
    position: { x: number; y: number } | null,
    extra?: Partial<FailureDetails>
  ): FailureDetails => {
    const base: FailureDetails = {
      type,
      message: '',
      cartId: cart?.id,
      cartColor: cart?.color,
      position: position || (cart ? { x: cart.x, y: cart.y } : undefined)
    };

    switch (type) {
      case 'wrong_warehouse': {
        const actual = extra?.actualWarehouse;
        const target = cart?.targetWarehouse;
        base.message = `${getColorName(cart?.color || 'red')}矿车 #${cart?.id} 在 (${position?.x ?? cart?.x},${position?.y ?? cart?.y}) 被送进了${actual ? getColorName(actual.color) : '错误的'}仓库！应该送去${target ? getColorName(target.color) : '对应颜色'}仓库。`;
        base.targetWarehouse = target;
        base.actualWarehouse = actual;
        break;
      }
      case 'collision':
        base.message = `${getColorName(cart?.color || 'red')}矿车 #${cart?.id} 在 (${position?.x ?? cart?.x},${position?.y ?? cart?.y}) 与矿车 #${extra?.otherCartId ?? '?'} 相撞！`;
        base.otherCartId = extra?.otherCartId;
        break;
      case 'derail':
        base.message = `${getColorName(cart?.color || 'red')}矿车 #${cart?.id} 在 (${position?.x ?? cart?.x},${position?.y ?? cart?.y}) 驶出轨道！`;
        break;
      case 'timeout':
        base.message = `时间到了！还有矿车没有送达目标仓库。`;
        break;
    }

    return { ...base, ...extra };
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

  const checkHintSwitches = () => {
    const state = gameStore.getState();
    if (state.status !== 'playing' || isPausedRef.current) return;
    if (!state.settings.hintMode) {
      gameStore.getState().setHighlightedSwitches([]);
      return;
    }

    const level = levels.find(l => l.id === state.currentLevel) || levels[0];
    const currentGrid = state.grid;
    const currentCarts = state.carts;
    const highlighted: { x: number; y: number }[] = [];

    for (const cart of currentCarts) {
      let simX = cart.x;
      let simY = cart.y;
      let simDir: Direction = cart.direction;

      for (let step = 0; step < 5; step++) {
        const currentCell = getCell(currentGrid, simX, simY);
        if (!currentCell) break;

        if (currentCell.type === 'switch' && currentCell.switchConfig) {
          const switchDir = currentCell.switchConfig.current === 0
            ? currentCell.switchConfig.direction1
            : currentCell.switchConfig.direction2;

          let wouldReachTarget = false;
          let testX = simX;
          let testY = simY;
          let testDir: Direction = switchDir;
          const visited = new Set<string>();

          for (let i = 0; i < 20; i++) {
            const key = `${testX},${testY},${testDir}`;
            if (visited.has(key)) break;
            visited.add(key);

            const nextPos = getNextPosition(testX, testY, testDir);
            if (!isInBounds(nextPos.x, nextPos.y)) break;
            const nextCell = getCell(currentGrid, nextPos.x, nextPos.y);
            if (!nextCell || nextCell.type === 'empty') break;

            if (nextCell.type === 'warehouse') {
              if (nextCell.color === cart.color) {
                wouldReachTarget = true;
              }
              break;
            }

            if (nextCell.type === 'switch' && nextCell.switchConfig) {
              testDir = nextCell.switchConfig.current === 0
                ? nextCell.switchConfig.direction1
                : nextCell.switchConfig.direction2;
            }

            testX = nextPos.x;
            testY = nextPos.y;
          }

          if (!wouldReachTarget && step <= 2) {
            highlighted.push({ x: simX, y: simY });
          }
          break;
        }

        const nextPos = getNextPosition(simX, simY, simDir);
        if (!isInBounds(nextPos.x, nextPos.y)) break;
        const nextCell = getCell(currentGrid, nextPos.x, nextPos.y);
        if (!nextCell || nextCell.type === 'empty') break;

        if (nextCell.type === 'switch' && nextCell.switchConfig) {
          simDir = nextCell.switchConfig.current === 0
            ? nextCell.switchConfig.direction1
            : nextCell.switchConfig.direction2;
        }
        simX = nextPos.x;
        simY = nextPos.y;
      }
    }

    void level;
    gameStore.getState().setHighlightedSwitches(highlighted);
  };

  const moveCarts = () => {
    if (isProcessingRef.current) return;
    const state = gameStore.getState();
    if (state.status !== 'playing' || isPausedRef.current) return;

    isProcessingRef.current = true;

    try {
      const level = levels.find(l => l.id === state.currentLevel) || levels[0];
      const currentCarts = [...state.carts];
      const currentGrid: Cell[][] = state.grid;

      const updatedCarts: Cart[] = [];
      const cartsToRemove: number[] = [];
      let gameOver = false;
      let failureDetails: FailureDetails | null = null;
      let deliveredThisTick = 0;

      for (const cart of currentCarts) {
        const currentCell = getCell(currentGrid, cart.x, cart.y);
        if (!currentCell) {
          gameOver = true;
          failureDetails = buildFailureDetails('derail', cart, { x: cart.x, y: cart.y });
          break;
        }

        const nextDirection: Direction = getCartNextDirection(cart, currentCell);
        const nextPos = getNextPosition(cart.x, cart.y, nextDirection);

        if (!isInBounds(nextPos.x, nextPos.y)) {
          gameOver = true;
          failureDetails = buildFailureDetails('derail', cart, nextPos);
          break;
        }

        const nextCell = getCell(currentGrid, nextPos.x, nextPos.y);
        if (!nextCell || nextCell.type === 'empty') {
          gameOver = true;
          failureDetails = buildFailureDetails('derail', cart, nextPos);
          break;
        }

        const otherCartAtNext = currentCarts.find(c => c.id !== cart.id && c.x === nextPos.x && c.y === nextPos.y);
        const updatedCartAtNext = updatedCarts.find(c => c.x === nextPos.x && c.y === nextPos.y);
        if (otherCartAtNext || updatedCartAtNext) {
          const collidingCart = otherCartAtNext || updatedCartAtNext;
          gameOver = true;
          failureDetails = buildFailureDetails('collision', cart, nextPos, {
            otherCartId: collidingCart?.id
          });
          break;
        }

        const warehouseCheck = checkWarehouse(nextCell, cart.color);
        if (warehouseCheck.isWarehouse) {
          if (warehouseCheck.success) {
            cartsToRemove.push(cart.id);
            deliveredThisTick++;
            gameStore.getState().logEvent('cart_delivered',
              `${getColorName(cart.color)}矿车 #${cart.id} 成功送达${getColorName(cart.color)}仓库 (${nextPos.x},${nextPos.y})，+10分`,
              { cartId: cart.id, color: cart.color, position: nextPos }
            );
          } else {
            gameOver = true;
            failureDetails = buildFailureDetails('wrong_warehouse', cart, nextPos, {
              actualWarehouse: { x: nextPos.x, y: nextPos.y, color: nextCell.color as OreColor }
            });
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

      if (gameOver && failureDetails) {
        gameStore.getState().setStatus('lost');
        gameStore.getState().setFailureDetails(failureDetails);
        gameStore.getState().showMessage(failureDetails.message, 'error');
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
        const elapsed = newState.elapsedTime || Math.floor((Date.now() - (newState.levelStartTime || Date.now())) / 1000);
        const finalScore = newState.score;
        const isNewHigh = finalScore > (parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10));
        gameStore.getState().setStatus('won');
        gameStore.getState().setLevelCompleted(newState.currentLevel, finalScore, elapsed);
        gameStore.getState().showMessage(
          `恭喜通关！得分：${finalScore}${isNewHigh ? ' 🎉 新纪录！' : ''}`,
          'success'
        );
        clearAllTimers();

        const currentHighScoreStr = localStorage.getItem(HIGH_SCORE_KEY) || '0';
        const currentHighScore = parseInt(currentHighScoreStr, 10);
        if (finalScore > currentHighScore) {
          localStorage.setItem(HIGH_SCORE_KEY, finalScore.toString());
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
      const failureDetails: FailureDetails = {
        type: 'timeout',
        message: `时间到了！已配送 ${state.deliveries} 车，得分 ${state.score}，还需要再配送一些才能通关。`
      };
      gameStore.getState().setStatus('lost');
      gameStore.getState().setFailureDetails(failureDetails);
      gameStore.getState().showMessage(failureDetails.message, 'error');
      clearAllTimers();
    } else {
      gameStore.getState().updateTime();
      gameStore.getState().updateElapsedTime();
    }
  };

  const startAllTimers = () => {
    const level = levels.find(l => l.id === gameStore.getState().currentLevel) || levels[0];
    const slowFactor = gameStore.getState().settings.slowMode ? 2 : 1;

    gameTimerRef.current = window.setInterval(updateTimeTick, 1000);
    spawnTimerRef.current = window.setInterval(spawnCart, level.spawnInterval * slowFactor);
    moveTimerRef.current = window.setInterval(moveCarts, level.moveInterval * slowFactor);
    hintTimerRef.current = window.setInterval(checkHintSwitches, 200);

    if (!firstSpawnDoneRef.current) {
      firstSpawnDoneRef.current = true;
      window.setTimeout(() => {
        if (gameStore.getState().status === 'playing' && !isPausedRef.current) {
          spawnCart();
        }
      }, 800 / slowFactor);
    }
  };

  const restartTimersForSettings = () => {
    if (status !== 'playing') return;
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    if (hintTimerRef.current) clearInterval(hintTimerRef.current);

    const level = levels.find(l => l.id === gameStore.getState().currentLevel) || levels[0];
    const slowFactor = gameStore.getState().settings.slowMode ? 2 : 1;

    gameTimerRef.current = window.setInterval(updateTimeTick, 1000);
    spawnTimerRef.current = window.setInterval(spawnCart, level.spawnInterval * slowFactor);
    moveTimerRef.current = window.setInterval(moveCarts, level.moveInterval * slowFactor);
    hintTimerRef.current = window.setInterval(checkHintSwitches, 200);
  };

  useEffect(() => {
    restartTimersForSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.slowMode, settings.hintMode]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      }, 3000);
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

  void carts;
  void grid;

  return null;
};
