import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
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
import type { Cart } from '../types/game';

let cartIdCounter = 0;

export const useGameEngine = () => {
  const {
    status,
    currentLevel,
    carts,
    grid,
    timeRemaining,
    score,
    deliveries,
    setStatus,
    addCart,
    removeCart,
    updateCarts,
    addScore,
    incrementDeliveries,
    updateTime,
    showMessage,
    clearMessage
  } = useGameStore();

  const spawnTimerRef = useRef<number | null>(null);
  const moveTimerRef = useRef<number | null>(null);
  const gameTimerRef = useRef<number | null>(null);
  const messageTimerRef = useRef<number | null>(null);

  const level = levels.find(l => l.id === currentLevel) || levels[0];

  const spawnCart = useCallback(() => {
    if (status !== 'playing') return;

    const availableEntrances = level.entrances.filter(
      entrance => !checkCollision(carts, entrance.x, entrance.y)
    );

    if (availableEntrances.length === 0) return;

    const entrance = availableEntrances[Math.floor(Math.random() * availableEntrances.length)];
    const color = getRandomOreColor();

    const newCart: Cart = {
      id: ++cartIdCounter,
      x: entrance.x,
      y: entrance.y,
      prevX: entrance.x,
      prevY: entrance.y,
      color,
      direction: entrance.direction,
      moving: true
    };

    addCart(newCart);
  }, [status, level.entrances, carts, addCart]);

  const moveCarts = useCallback(() => {
    if (status !== 'playing') return;

    const updatedCarts: Cart[] = [];
    const cartsToRemove: number[] = [];
    let gameOver = false;
    let gameOverReason = '';

    for (const cart of carts) {
      const currentCell = getCell(grid, cart.x, cart.y);
      if (!currentCell) {
        gameOver = true;
        gameOverReason = '矿车驶出轨道！';
        break;
      }

      const nextDirection = getCartNextDirection(cart, currentCell);
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

      if (checkCollision(carts.filter(c => c.id !== cart.id), nextPos.x, nextPos.y)) {
        gameOver = true;
        gameOverReason = '两辆矿车相撞了！';
        break;
      }

      const warehouseCheck = checkWarehouse(nextCell, cart.color);
      if (warehouseCheck.isWarehouse) {
        if (warehouseCheck.success) {
          addScore(10);
          incrementDeliveries();
          cartsToRemove.push(cart.id);
          showMessage(`+10 分！矿石送达！`, 'success');
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
      setStatus('lost');
      showMessage(gameOverReason, 'error');
      return;
    }

    const finalCarts = updatedCarts.filter(c => !cartsToRemove.includes(c.id));
    updateCarts(finalCarts);
  }, [status, carts, grid, addScore, incrementDeliveries, updateCarts, setStatus, showMessage]);

  const checkWinCondition = useCallback(() => {
    if (status !== 'playing') return;

    if (score >= level.targetScore || deliveries >= level.targetDeliveries) {
      setStatus('won');
      showMessage(`恭喜通关！得分：${score}`, 'success');
    }
  }, [status, score, deliveries, level.targetScore, level.targetDeliveries, setStatus, showMessage]);

  const checkLoseCondition = useCallback(() => {
    if (status !== 'playing') return;

    if (timeRemaining <= 0) {
      setStatus('lost');
      showMessage('时间到！任务失败！', 'error');
    }
  }, [status, timeRemaining, setStatus, showMessage]);

  useEffect(() => {
    if (status === 'playing') {
      gameTimerRef.current = window.setInterval(() => {
        updateTime();
      }, 1000);

      spawnTimerRef.current = window.setInterval(() => {
        spawnCart();
      }, level.spawnInterval);

      moveTimerRef.current = window.setInterval(() => {
        moveCarts();
      }, level.moveInterval);

      spawnCart();
    }

    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
    };
  }, [status, level.spawnInterval, level.moveInterval, spawnCart, moveCarts, updateTime]);

  useEffect(() => {
    checkWinCondition();
    checkLoseCondition();
  }, [score, deliveries, timeRemaining, checkWinCondition, checkLoseCondition]);

  useEffect(() => {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
    }
    messageTimerRef.current = window.setTimeout(() => {
      clearMessage();
    }, 2000);

    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, [clearMessage]);

  return null;
};
