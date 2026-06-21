import type { Direction, OreColor, Cell, Cart } from '../types/game';

export const getNextPosition = (
  x: number,
  y: number,
  direction: Direction
): { x: number; y: number } => {
  switch (direction) {
    case 'up':
      return { x, y: y - 1 };
    case 'down':
      return { x, y: y + 1 };
    case 'left':
      return { x: x - 1, y };
    case 'right':
      return { x: x + 1, y };
  }
};

export const isInBounds = (x: number, y: number): boolean => {
  return x >= 0 && x < 6 && y >= 0 && y < 6;
};

export const getCell = (grid: Cell[][], x: number, y: number): Cell | null => {
  if (!isInBounds(x, y)) return null;
  return grid[y][x];
};

export const getSwitchDirection = (cell: Cell): Direction | null => {
  if (cell.type !== 'switch' || !cell.switchConfig) return null;
  return cell.switchConfig.current === 0
    ? cell.switchConfig.direction1
    : cell.switchConfig.direction2;
};

export const toggleSwitch = (grid: Cell[][], x: number, y: number): Cell[][] => {
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
  }
  
  return newGrid;
};

export const getCartNextDirection = (
  cart: Cart,
  cell: Cell
): Direction => {
  if (cell.type === 'switch' && cell.switchConfig) {
    return getSwitchDirection(cell) || cart.direction;
  }
  return cart.direction;
};

export const checkCollision = (carts: Cart[], x: number, y: number): boolean => {
  return carts.some(cart => cart.x === x && cart.y === y);
};

export const checkWarehouse = (
  cell: Cell,
  cartColor: OreColor
): { success: boolean; isWarehouse: boolean } => {
  if (cell.type !== 'warehouse') {
    return { success: false, isWarehouse: false };
  }
  return {
    success: cell.color === cartColor,
    isWarehouse: true
  };
};

export const getRandomOreColor = (): OreColor => {
  const colors: OreColor[] = ['red', 'blue', 'yellow'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const cloneGrid = (grid: Cell[][]): Cell[][] => {
  return grid.map(row => row.map(cell => ({ ...cell })));
};

export const getDirectionArrow = (direction: Direction): string => {
  switch (direction) {
    case 'up': return '↑';
    case 'down': return '↓';
    case 'left': return '←';
    case 'right': return '→';
  }
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getColorClass = (color: OreColor): string => {
  switch (color) {
    case 'red': return 'bg-red-500';
    case 'blue': return 'bg-blue-500';
    case 'yellow': return 'bg-yellow-400';
  }
};

export const getColorBorderClass = (color: OreColor): string => {
  switch (color) {
    case 'red': return 'border-red-500';
    case 'blue': return 'border-blue-500';
    case 'yellow': return 'border-yellow-400';
  }
};

export const getColorTextClass = (color: OreColor): string => {
  switch (color) {
    case 'red': return 'text-red-500';
    case 'blue': return 'text-blue-500';
    case 'yellow': return 'text-yellow-400';
  }
};
