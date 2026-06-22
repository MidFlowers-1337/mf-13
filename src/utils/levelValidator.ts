import type { Cell, ValidationError, Direction, OreColor } from '../types/game';
import { getNextPosition, isInBounds, getCell } from './gameLogic';

const GRID_SIZE = 6;

const hasPathFromEntrance = (
  grid: Cell[][],
  startX: number,
  startY: number,
  direction: Direction,
  visited: Set<string>
): boolean => {
  let x = startX;
  let y = startY;
  const dir = direction;
  const localVisited = new Set<string>();

  for (let steps = 0; steps < 100; steps++) {
    const key = `${x},${y},${dir}`;
    if (localVisited.has(key)) return false;
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
      return false;
    }

    if (nextCell.type === 'switch' && nextCell.switchConfig) {
      const switchDir1 = nextCell.switchConfig.direction1;
      const switchDir2 = nextCell.switchConfig.direction2;
      
      const canReachFromDir = (exitDir: Direction): boolean => {
        const newVisited = new Set(visited);
        const result = hasPathFromEntrance(
          grid,
          nextPos.x,
          nextPos.y,
          exitDir,
          newVisited
        );
        if (result) {
          newVisited.forEach(v => visited.add(v));
        }
        return result;
      };

      if (canReachFromDir(switchDir1)) {
        return true;
      }
      if (canReachFromDir(switchDir2)) {
        return true;
      }
      return false;
    }

    x = nextPos.x;
    y = nextPos.y;
  }

  return false;
};

export const validateLevel = (grid: Cell[][], oreColors?: OreColor[]): ValidationError[] => {
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

  const warehouseColors = new Set(warehouses.map(w => w.color));
  if (warehouses.length > 0 && warehouseColors.size < warehouses.length) {
    errors.push({
      type: 'missing_colors',
      message: '每个仓库颜色都应该是唯一的，避免重复颜色'
    });
  }

  if (oreColors && oreColors.length > 0 && warehouses.length > 0) {
    const missingColors: OreColor[] = [];
    for (const color of oreColors) {
      if (!warehouseColors.has(color)) {
        missingColors.push(color);
      }
    }
    if (missingColors.length > 0) {
      const colorNames = missingColors.map(c => 
        c === 'red' ? '红色' : c === 'blue' ? '蓝色' : '黄色'
      ).join('、');
      errors.push({
        type: 'missing_colors',
        message: `矿车颜色包含 ${colorNames}，但缺少对应颜色的仓库`
      });
    }
  }

  const reachableCells = new Set<string>();
  const reachableWarehouseColors = new Set<OreColor>();

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

    visited.forEach(v => {
      reachableCells.add(v);
      const [vx, vy] = v.split(',').map(Number);
      const cell = grid[vy]?.[vx];
      if (cell?.type === 'warehouse' && cell.color) {
        reachableWarehouseColors.add(cell.color);
      }
    });
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
