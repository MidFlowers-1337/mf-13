import type { Cell, ValidationError, Direction, OreColor } from '../types/game';
import { getNextPosition, isInBounds, getCell } from './gameLogic';

const GRID_SIZE = 6;

const oppositeDirection = (dir: Direction): Direction => {
  switch (dir) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
};

const hasPathFromEntrance = (
  grid: Cell[][],
  startX: number,
  startY: number,
  direction: Direction,
  visited: Set<string>
): boolean => {
  let x = startX;
  let y = startY;
  let dir = direction;
  const localVisited = new Set<string>();

  for (let steps = 0; steps < 100; steps++) {
    const key = `${x},${y},${dir}`;
    if (localVisited.has(key)) return true;
    localVisited.add(key);
    visited.add(`${x},${y}`);

    const nextPos = getNextPosition(x, y, dir);
    if (!isInBounds(nextPos.x, nextPos.y)) return false;

    const nextCell = getCell(grid, nextPos.x, nextPos.y);
    if (!nextCell || nextCell.type === 'empty') return false;

    if (nextCell.type === 'warehouse') {
      visited.add(`${nextPos.x},${nextPos.y}`);
      return true;
    }

    if (nextCell.type === 'entrance') {
      visited.add(`${nextPos.x},${nextPos.y}`);
      return true;
    }

    if (nextCell.type === 'switch' && nextCell.switchConfig) {
      const switchDir1 = nextCell.switchConfig.direction1;
      const switchDir2 = nextCell.switchConfig.direction2;
      const enterDir = oppositeDirection(dir);

      if (switchDir1 === enterDir || switchDir2 === enterDir) {
        const exitDir = switchDir1 === enterDir ? switchDir2 : switchDir1;
        x = nextPos.x;
        y = nextPos.y;
        dir = exitDir;
        continue;
      }
      return false;
    }

    x = nextPos.x;
    y = nextPos.y;
  }

  return true;
};

export const validateLevel = (grid: Cell[][]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const entrances: { x: number; y: number; direction: Direction }[] = [];
  const warehouses: { x: number; y: number; color: OreColor }[] = [];
  const allTrackCells: { x: number; y: number }[] = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = grid[y][x];
      if (cell.type === 'entrance' && cell.entranceDirection) {
        entrances.push({ x, y, direction: cell.entranceDirection });
      }
      if (cell.type === 'warehouse' && cell.color) {
        warehouses.push({ x, y, color: cell.color });
      }
      if (cell.type !== 'empty') {
        allTrackCells.push({ x, y });
      }
    }
  }

  if (entrances.length === 0) {
    errors.push({
      type: 'no_entrance',
      message: '关卡至少需要一个入口（绿色轨道）'
    });
  }

  if (warehouses.length === 0) {
    errors.push({
      type: 'no_warehouse',
      message: '关卡至少需要一个仓库'
    });
  }

  const colors = new Set(warehouses.map(w => w.color));
  if (warehouses.length > 0 && colors.size < warehouses.length) {
    errors.push({
      type: 'missing_colors',
      message: '每个仓库颜色都应该是唯一的，避免重复颜色'
    });
  }

  const reachableCells = new Set<string>();

  for (const entrance of entrances) {
    const visited = new Set<string>();
    const canReach = hasPathFromEntrance(
      grid,
      entrance.x,
      entrance.y,
      entrance.direction,
      visited
    );

    if (!canReach) {
      errors.push({
        type: 'entrance_no_exit',
        message: `入口 (${entrance.x},${entrance.y}) 的轨道无法到达任何仓库`,
        position: { x: entrance.x, y: entrance.y }
      });
    }

    visited.forEach(v => reachableCells.add(v));
  }

  for (const cell of allTrackCells) {
    const key = `${cell.x},${cell.y}`;
    if (!reachableCells.has(key)) {
      const cellType = grid[cell.y][cell.x].type;
      if (cellType === 'warehouse') {
        errors.push({
          type: 'warehouse_no_entry',
          message: `仓库 (${cell.x},${cell.y}) 没有轨道连通到入口`,
          position: { x: cell.x, y: cell.y }
        });
      } else if (cellType !== 'entrance') {
        errors.push({
          type: 'orphan_track',
          message: `轨道 (${cell.x},${cell.y}) 是孤立的，没有与入口连通`,
          position: { x: cell.x, y: cell.y }
        });
      }
    }
  }

  return errors;
};

export const extractLevelData = (grid: Cell[][]) => {
  const entrances: { x: number; y: number; direction: Direction }[] = [];
  const warehouses: { x: number; y: number; color: OreColor }[] = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = grid[y][x];
      if (cell.type === 'entrance' && cell.entranceDirection) {
        entrances.push({ x, y, direction: cell.entranceDirection });
      }
      if (cell.type === 'warehouse' && cell.color) {
        warehouses.push({ x, y, color: cell.color });
      }
    }
  }

  return { entrances, warehouses };
};
