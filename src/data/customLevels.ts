import type { CustomLevel, Cell, Direction, OreColor } from '../types/game';
import { extractLevelData } from '../utils/levelValidator';
import { cloneGrid } from '../utils/gameLogic';

const CUSTOM_LEVELS_KEY = 'minecart_custom_levels';

export const createEmptyGrid = (): Cell[][] => {
  return Array(6).fill(null).map(() =>
    Array(6).fill(null).map(() => ({ type: 'empty' as const }))
  );
};

export const generateId = (): string => {
  return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const loadCustomLevels = (): CustomLevel[] => {
  try {
    const saved = localStorage.getItem(CUSTOM_LEVELS_KEY);
    if (saved) {
      const levels = JSON.parse(saved);
      return Array.isArray(levels) ? levels : [];
    }
  } catch {
    // ignore parse error
  }
  return [];
};

export const saveCustomLevels = (levels: CustomLevel[]): void => {
  try {
    localStorage.setItem(CUSTOM_LEVELS_KEY, JSON.stringify(levels));
  } catch {
    // ignore storage error
  }
};

export const saveCustomLevel = (level: CustomLevel): void => {
  const levels = loadCustomLevels();
  const index = levels.findIndex(l => l.id === level.id);
  if (index >= 0) {
    levels[index] = { ...level, updatedAt: Date.now() };
  } else {
    levels.push(level);
  }
  saveCustomLevels(levels);
};

export const deleteCustomLevel = (levelId: string): void => {
  const levels = loadCustomLevels();
  const filtered = levels.filter(l => l.id !== levelId);
  saveCustomLevels(filtered);
};

export const getCustomLevel = (levelId: string): CustomLevel | null => {
  const levels = loadCustomLevels();
  return levels.find(l => l.id === levelId) || null;
};

export const createNewLevel = (name: string = '新关卡'): CustomLevel => {
  const now = Date.now();
  const grid = createEmptyGrid();
  return {
    id: generateId(),
    name,
    description: '',
    createdAt: now,
    updatedAt: now,
    oreColors: ['red', 'blue', 'yellow'],
    spawnInterval: 6000,
    moveInterval: 1200,
    targetScore: 60,
    targetDeliveries: 6,
    timeLimit: 180,
    grid,
    entrances: [],
    warehouses: []
  };
};

export const updateLevelGrid = (level: CustomLevel, grid: Cell[][]): CustomLevel => {
  const { entrances, warehouses } = extractLevelData(grid);
  return {
    ...level,
    grid: cloneGrid(grid),
    entrances,
    warehouses,
    updatedAt: Date.now()
  };
};

export interface ImportResult {
  success: boolean;
  level?: CustomLevel;
  error?: string;
  errorDetails?: string;
}

const isValidDirection = (dir: unknown): dir is Direction => {
  return typeof dir === 'string' && ['up', 'down', 'left', 'right'].includes(dir);
};

const isValidColor = (color: unknown): color is OreColor => {
  return typeof color === 'string' && ['red', 'blue', 'yellow'].includes(color);
};

const isValidCellType = (type: unknown): type is Cell['type'] => {
  return typeof type === 'string' && ['empty', 'track', 'switch', 'entrance', 'warehouse'].includes(type);
};

const validateCell = (cell: unknown, x: number, y: number): { valid: boolean; error?: string } => {
  if (!cell || typeof cell !== 'object') {
    return { valid: false, error: `格子 (${x},${y}) 格式错误` };
  }

  const c = cell as Record<string, unknown>;

  if (!isValidCellType(c.type)) {
    return { valid: false, error: `格子 (${x},${y}) 的 type 无效: ${c.type}` };
  }

  if (c.type === 'entrance') {
    if (!isValidDirection(c.entranceDirection)) {
      return { valid: false, error: `入口 (${x},${y}) 的 entranceDirection 无效` };
    }
  }

  if (c.type === 'warehouse') {
    if (!isValidColor(c.color)) {
      return { valid: false, error: `仓库 (${x},${y}) 的 color 无效` };
    }
  }

  if (c.type === 'switch') {
    if (!c.switchConfig || typeof c.switchConfig !== 'object') {
      return { valid: false, error: `道岔 (${x},${y}) 缺少 switchConfig` };
    }
    const sc = c.switchConfig as Record<string, unknown>;
    if (!isValidDirection(sc.direction1) || !isValidDirection(sc.direction2)) {
      return { valid: false, error: `道岔 (${x},${y}) 的方向配置无效` };
    }
    if (sc.current !== 0 && sc.current !== 1) {
      return { valid: false, error: `道岔 (${x},${y}) 的 current 必须是 0 或 1` };
    }
  }

  return { valid: true };
};

export const importLevelFromJson = (jsonString: string): ImportResult => {
  let data: unknown;

  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    return {
      success: false,
      error: 'JSON 解析失败',
      errorDetails: e instanceof Error ? e.message : '未知解析错误'
    };
  }

  if (!data || typeof data !== 'object') {
    return { success: false, error: '关卡数据必须是对象' };
  }

  const levelData = data as Record<string, unknown>;

  if (!levelData.name || typeof levelData.name !== 'string') {
    return { success: false, error: '缺少关卡名称 (name)' };
  }

  if (!Array.isArray(levelData.grid)) {
    return { success: false, error: '缺少棋盘网格 (grid) 或格式错误' };
  }

  if (levelData.grid.length !== 6) {
    return {
      success: false,
      error: `棋盘网格行数错误：期望 6 行，实际 ${levelData.grid.length} 行`
    };
  }

  for (let y = 0; y < 6; y++) {
    const row = levelData.grid[y];
    if (!Array.isArray(row) || row.length !== 6) {
      return {
        success: false,
        error: `第 ${y} 行列数错误：期望 6 列，实际 ${Array.isArray(row) ? row.length : '非数组'}`
      };
    }
    for (let x = 0; x < 6; x++) {
      const result = validateCell(row[x], x, y);
      if (!result.valid) {
        return { success: false, error: result.error };
      }
    }
  }

  if (levelData.oreColors && !Array.isArray(levelData.oreColors)) {
    return { success: false, error: 'oreColors 必须是数组' };
  }

  if (levelData.oreColors && Array.isArray(levelData.oreColors)) {
    for (const color of levelData.oreColors as unknown[]) {
      if (!isValidColor(color)) {
        return { success: false, error: `无效的矿石颜色: ${color}` };
      }
    }
  }

  const now = Date.now();
  const grid = levelData.grid as Cell[][];
  const { entrances, warehouses } = extractLevelData(grid);

  const level: CustomLevel = {
    id: generateId(),
    name: levelData.name as string,
    description: typeof levelData.description === 'string' ? levelData.description : '',
    createdAt: now,
    updatedAt: now,
    oreColors: Array.isArray(levelData.oreColors) ? (levelData.oreColors as OreColor[]) : ['red', 'blue', 'yellow'],
    spawnInterval: typeof levelData.spawnInterval === 'number' ? levelData.spawnInterval : 6000,
    moveInterval: typeof levelData.moveInterval === 'number' ? levelData.moveInterval : 1200,
    targetScore: typeof levelData.targetScore === 'number' ? levelData.targetScore : 60,
    targetDeliveries: typeof levelData.targetDeliveries === 'number' ? levelData.targetDeliveries : 6,
    timeLimit: typeof levelData.timeLimit === 'number' ? levelData.timeLimit : 180,
    grid,
    entrances,
    warehouses
  };

  return { success: true, level };
};

export const exportLevelToJson = (level: CustomLevel): string => {
  const exportData = {
    name: level.name,
    description: level.description,
    oreColors: level.oreColors,
    spawnInterval: level.spawnInterval,
    moveInterval: level.moveInterval,
    targetScore: level.targetScore,
    targetDeliveries: level.targetDeliveries,
    timeLimit: level.timeLimit,
    grid: level.grid
  };
  return JSON.stringify(exportData, null, 2);
};
