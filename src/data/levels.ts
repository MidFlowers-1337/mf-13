import type { Level, Cell } from '../types/game';

const createEmptyGrid = (): Cell[][] => {
  return Array(6).fill(null).map(() =>
    Array(6).fill(null).map(() => ({ type: 'empty' as const }))
  );
};

const createLevel1Grid = (): Cell[][] => {
  const grid = createEmptyGrid();
  
  grid[0][0] = { type: 'entrance', entranceDirection: 'right' };
  grid[0][1] = { type: 'track' };
  grid[0][2] = { type: 'track' };
  grid[0][3] = {
    type: 'switch',
    switchConfig: {
      direction1: 'right',
      direction2: 'down',
      current: 0
    }
  };
  grid[0][4] = { type: 'track' };
  grid[0][5] = { type: 'warehouse', color: 'red' };
  
  grid[1][3] = { type: 'track' };
  grid[2][3] = {
    type: 'switch',
    switchConfig: {
      direction1: 'down',
      direction2: 'right',
      current: 0
    }
  };
  grid[2][4] = { type: 'track' };
  grid[2][5] = { type: 'warehouse', color: 'blue' };
  
  grid[3][3] = { type: 'track' };
  grid[4][3] = { type: 'track' };
  grid[5][3] = { type: 'warehouse', color: 'yellow' };
  
  return grid;
};

const createLevel2Grid = (): Cell[][] => {
  const grid = createEmptyGrid();
  
  grid[0][0] = { type: 'entrance', entranceDirection: 'right' };
  grid[0][1] = {
    type: 'switch',
    switchConfig: {
      direction1: 'right',
      direction2: 'down',
      current: 0
    }
  };
  grid[0][2] = { type: 'track' };
  grid[0][3] = {
    type: 'switch',
    switchConfig: {
      direction1: 'right',
      direction2: 'down',
      current: 0
    }
  };
  grid[0][4] = { type: 'track' };
  grid[0][5] = { type: 'warehouse', color: 'red' };
  
  grid[1][1] = { type: 'track' };
  grid[1][3] = { type: 'track' };
  
  grid[2][0] = { type: 'entrance', entranceDirection: 'right' };
  grid[2][1] = {
    type: 'switch',
    switchConfig: {
      direction1: 'right',
      direction2: 'up',
      current: 0
    }
  };
  grid[2][2] = { type: 'track' };
  grid[2][3] = {
    type: 'switch',
    switchConfig: {
      direction1: 'up',
      direction2: 'right',
      current: 0
    }
  };
  grid[2][4] = { type: 'track' };
  grid[2][5] = { type: 'warehouse', color: 'blue' };
  
  grid[3][3] = { type: 'track' };
  
  grid[4][3] = {
    type: 'switch',
    switchConfig: {
      direction1: 'up',
      direction2: 'right',
      current: 0
    }
  };
  grid[4][4] = { type: 'track' };
  grid[4][5] = { type: 'warehouse', color: 'yellow' };
  
  grid[5][0] = { type: 'entrance', entranceDirection: 'right' };
  grid[5][1] = { type: 'track' };
  grid[5][2] = { type: 'track' };
  grid[5][3] = {
    type: 'switch',
    switchConfig: {
      direction1: 'up',
      direction2: 'right',
      current: 0
    }
  };
  
  return grid;
};

const createLevel3Grid = (): Cell[][] => {
  const grid = createEmptyGrid();
  
  grid[0][0] = { type: 'entrance', entranceDirection: 'right' };
  grid[0][1] = { type: 'track' };
  grid[0][2] = {
    type: 'switch',
    switchConfig: {
      direction1: 'right',
      direction2: 'down',
      current: 0
    }
  };
  grid[0][3] = { type: 'track' };
  grid[0][4] = {
    type: 'switch',
    switchConfig: {
      direction1: 'right',
      direction2: 'down',
      current: 0
    }
  };
  grid[0][5] = { type: 'warehouse', color: 'red' };
  
  grid[1][2] = { type: 'track' };
  grid[1][4] = { type: 'track' };
  
  grid[2][0] = { type: 'entrance', entranceDirection: 'right' };
  grid[2][1] = {
    type: 'switch',
    switchConfig: {
      direction1: 'right',
      direction2: 'up',
      current: 0
    }
  };
  grid[2][2] = {
    type: 'switch',
    switchConfig: {
      direction1: 'up',
      direction2: 'down',
      current: 0
    }
  };
  grid[2][3] = {
    type: 'switch',
    switchConfig: {
      direction1: 'right',
      direction2: 'up',
      current: 0
    }
  };
  grid[2][4] = {
    type: 'switch',
    switchConfig: {
      direction1: 'up',
      direction2: 'down',
      current: 0
    }
  };
  grid[2][5] = { type: 'warehouse', color: 'blue' };
  
  grid[3][2] = { type: 'track' };
  grid[3][4] = { type: 'track' };
  
  grid[4][0] = { type: 'entrance', entranceDirection: 'right' };
  grid[4][1] = {
    type: 'switch',
    switchConfig: {
      direction1: 'right',
      direction2: 'up',
      current: 0
    }
  };
  grid[4][2] = {
    type: 'switch',
    switchConfig: {
      direction1: 'up',
      direction2: 'right',
      current: 0
    }
  };
  grid[4][3] = { type: 'track' };
  grid[4][4] = {
    type: 'switch',
    switchConfig: {
      direction1: 'up',
      direction2: 'right',
      current: 0
    }
  };
  grid[4][5] = { type: 'warehouse', color: 'yellow' };
  
  grid[5][0] = { type: 'entrance', entranceDirection: 'right' };
  grid[5][1] = { type: 'track' };
  grid[5][2] = { type: 'track' };
  grid[5][3] = {
    type: 'switch',
    switchConfig: {
      direction1: 'up',
      direction2: 'right',
      current: 0
    }
  };
  
  return grid;
};

export const levels: Level[] = [
  {
    id: 1,
    name: '新手训练',
    description: '熟悉基本操作，学习如何切换道岔引导矿车',
    grid: createLevel1Grid(),
    entrances: [
      { x: 0, y: 0, direction: 'right' }
    ],
    warehouses: [
      { x: 5, y: 0, color: 'red' },
      { x: 5, y: 2, color: 'blue' },
      { x: 3, y: 5, color: 'yellow' }
    ],
    spawnInterval: 3000,
    moveInterval: 800,
    targetScore: 100,
    targetDeliveries: 10,
    timeLimit: 120
  },
  {
    id: 2,
    name: '道岔挑战',
    description: '多个入口和道岔，考验你的调度能力',
    grid: createLevel2Grid(),
    entrances: [
      { x: 0, y: 0, direction: 'right' },
      { x: 0, y: 2, direction: 'right' },
      { x: 0, y: 5, direction: 'right' }
    ],
    warehouses: [
      { x: 5, y: 0, color: 'red' },
      { x: 5, y: 2, color: 'blue' },
      { x: 5, y: 4, color: 'yellow' }
    ],
    spawnInterval: 2000,
    moveInterval: 600,
    targetScore: 200,
    targetDeliveries: 20,
    timeLimit: 150
  },
  {
    id: 3,
    name: '调度大师',
    description: '复杂轨道网络，多个入口同时发车',
    grid: createLevel3Grid(),
    entrances: [
      { x: 0, y: 0, direction: 'right' },
      { x: 0, y: 2, direction: 'right' },
      { x: 0, y: 4, direction: 'right' },
      { x: 0, y: 5, direction: 'right' }
    ],
    warehouses: [
      { x: 5, y: 0, color: 'red' },
      { x: 5, y: 2, color: 'blue' },
      { x: 5, y: 4, color: 'yellow' }
    ],
    spawnInterval: 1500,
    moveInterval: 500,
    targetScore: 300,
    targetDeliveries: 30,
    timeLimit: 180
  }
];
