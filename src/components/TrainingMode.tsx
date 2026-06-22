import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  SkipForward,
  RotateCcw,
  Undo2,
  Plus,
  Train,
  Target,
  Gem,
  Layers
} from 'lucide-react';
import { useGameStore, gameStore } from '../store/gameStore';
import { levels } from '../data/levels';
import { loadCustomLevels } from '../data/customLevels';
import type { CustomLevel, Cart, OreColor, Direction } from '../types/game';
import { getDirectionArrow, getColorClass, getColorBorderClass } from '../utils/gameLogic';

let cartIdCounter = 1000;

export const TrainingMode = () => {
  const setView = useGameStore(s => s.setView);
  const grid = useGameStore(s => s.grid);
  const carts = useGameStore(s => s.carts);
  const score = useGameStore(s => s.score);
  const deliveries = useGameStore(s => s.deliveries);
  const training = useGameStore(s => s.training);
  const toggleSwitch = useGameStore(s => s.toggleSwitch);
  const trainingStep = useGameStore(s => s.trainingStep);
  const trainingBack = useGameStore(s => s.trainingBack);
  const trainingReset = useGameStore(s => s.trainingReset);
  const startTraining = useGameStore(s => s.startTraining);

  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [customLevels, setCustomLevels] = useState<CustomLevel[]>([]);
  const [stepCount, setStepCount] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(80);

  useEffect(() => {
    setCustomLevels(loadCustomLevels());
  }, []);

  useEffect(() => {
    const updateSize = () => {
      if (boardRef.current) {
        const width = boardRef.current.offsetWidth;
        setCellSize(width / 6);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    setStepCount(training.historyIndex);
  }, [training.historyIndex]);

  const handleSpawnCart = () => {
    const allEntrances: { x: number; y: number; direction: Direction }[] = [];

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const cell = grid[y][x];
        if (cell.type === 'entrance' && cell.entranceDirection) {
          allEntrances.push({ x, y, direction: cell.entranceDirection });
        }
      }
    }

    if (allEntrances.length === 0) return;

    const entrance = allEntrances[Math.floor(Math.random() * allEntrances.length)];
    const colors: OreColor[] = ['red', 'blue', 'yellow'];
    const color = colors[Math.floor(Math.random() * colors.length)];

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

    const currentCarts = gameStore.getState().carts;
    const updatedCarts = [...currentCarts, newCart];
    gameStore.getState().updateCarts(updatedCarts);

    const snapshot = {
      carts: updatedCarts.map(c => ({ ...c })),
      grid: grid.map(row => row.map(cell => ({ ...cell }))),
      score,
      deliveries
    };

    const newHistory = training.history.slice(0, training.historyIndex + 1);
    newHistory.push(snapshot);
    gameStore.setState({
      training: {
        ...training,
        history: newHistory,
        historyIndex: newHistory.length - 1
      }
    });
  };

  const handleStep = () => {
    trainingStep();
  };

  const handleBack = () => {
    trainingBack();
  };

  const handleReset = () => {
    trainingReset();
    cartIdCounter = 1000;
  };

  const selectOfficialLevel = (levelId: number) => {
    startTraining(levelId);
    setShowLevelSelect(false);
    cartIdCounter = 1000;
  };

  const selectCustomLevel = (level: CustomLevel) => {
    startTraining(level);
    setShowLevelSelect(false);
    cartIdCounter = 1000;
  };

  const getCellContent = (cell: typeof grid[0][0]) => {
    switch (cell.type) {
      case 'empty':
        return null;
      case 'track':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1 bg-zinc-600" />
            <div className="absolute w-1 h-full bg-zinc-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-3 bg-zinc-700" />
            </div>
          </div>
        );
      case 'switch': {
        const currentDir = cell.switchConfig
          ? (cell.switchConfig.current === 0
            ? cell.switchConfig.direction1
            : cell.switchConfig.direction2)
          : null;
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1 bg-zinc-600" />
            <div className="absolute w-1 h-full bg-zinc-600" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: cell.switchConfig?.current === 0 ? 0 : 90 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative w-full h-full">
                <div className="absolute top-1/2 left-0 right-0 h-3 bg-zinc-500 -translate-y-1/2" />
                <div className="absolute top-0 bottom-0 left-1/2 w-3 bg-zinc-500 -translate-x-1/2" />
              </div>
            </motion.div>
            {currentDir && (
              <div className="absolute bottom-1 right-1 z-10">
                <span className="text-xs font-bold text-amber-400 bg-zinc-800 px-1 rounded">
                  {getDirectionArrow(currentDir)}
                </span>
              </div>
            )}
          </div>
        );
      }
      case 'entrance':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1 bg-zinc-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-3 bg-green-700 border-2 border-green-500" />
            </div>
            <div className="absolute top-1 left-1 z-10">
              <span className="text-[10px] font-bold text-green-400 bg-zinc-800 px-1 rounded">
                入口
              </span>
            </div>
            {cell.entranceDirection && (
              <div className="absolute bottom-1 right-1 z-10">
                <span className="text-[10px] font-bold text-green-400 bg-zinc-800 px-1 rounded">
                  {getDirectionArrow(cell.entranceDirection)}
                </span>
              </div>
            )}
          </div>
        );
      case 'warehouse':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1 bg-zinc-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-full h-6 rounded-sm border-2 ${getColorClass(cell.color || 'red')} ${getColorBorderClass(cell.color || 'red')} opacity-80`}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">
                {cell.color === 'red' && '🔴'}
                {cell.color === 'blue' && '🔵'}
                {cell.color === 'yellow' && '🟡'}
              </span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleCellClick = (x: number, y: number) => {
    const cell = grid[y][x];
    if (cell.type === 'switch') {
      toggleSwitch(x, y);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-4 px-3 md:py-6 md:px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回</span>
          </button>
          <div className="flex items-center gap-2">
            <Train size={24} className="text-cyan-400" />
            <h1 className="text-xl md:text-2xl font-bold text-cyan-400">训练模式</h1>
          </div>
          <button
            onClick={() => setShowLevelSelect(true)}
            className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm"
          >
            <Layers size={18} />
            <span className="hidden md:inline">切换地图</span>
          </button>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 mb-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-zinc-400 mb-1">
                <Gem size={14} />
                <span className="text-xs">得分</span>
              </div>
              <div className="font-mono text-xl font-bold text-amber-400">{score}</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-zinc-400 mb-1">
                <Target size={14} />
                <span className="text-xs">配送</span>
              </div>
              <div className="font-mono text-xl font-bold text-emerald-400">{deliveries}</div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-zinc-400 mb-1">
                <SkipForward size={14} />
                <span className="text-xs">步数</span>
              </div>
              <div className="font-mono text-xl font-bold text-cyan-400">{stepCount}</div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[480px] mx-auto mb-4">
          <div
            ref={boardRef}
            className="relative w-full aspect-square bg-zinc-950 rounded-lg border-4 border-zinc-700 shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
              {grid.map((row, y) =>
                row.map((cell, x) => (
                  <motion.div
                    key={`${x}-${y}`}
                    className={`
                      relative aspect-square border border-zinc-700
                      ${cell.type === 'empty' ? 'bg-zinc-900' : 'bg-zinc-800'}
                      ${cell.type === 'switch' ? 'cursor-pointer hover:bg-zinc-700' : ''}
                      transition-colors
                    `}
                    onClick={() => handleCellClick(x, y)}
                  >
                    {getCellContent(cell)}
                  </motion.div>
                ))
              )}
            </div>

            <div className="absolute inset-0 pointer-events-none">
              {carts.map(cart => (
                <div
                  key={cart.id}
                  className={`absolute transition-all duration-300 ease-linear ${getColorClass(cart.color)} rounded-lg border-2 border-white/50 shadow-lg flex items-center justify-center`}
                  style={{
                    width: `${cellSize * 0.6}px`,
                    height: `${cellSize * 0.6}px`,
                    left: `${cart.x * cellSize + cellSize * 0.2}px`,
                    top: `${cart.y * cellSize + cellSize * 0.2}px`,
                  }}
                >
                  <span className="text-white text-xs font-bold">🚂</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
          <div className="grid grid-cols-4 gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSpawnCart}
              className="flex flex-col items-center justify-center gap-1 py-3 bg-green-700 hover:bg-green-600 rounded-lg text-white"
            >
              <Plus size={20} />
              <span className="text-xs font-medium">生成矿车</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStep}
              className="flex flex-col items-center justify-center gap-1 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg text-white"
            >
              <SkipForward size={20} />
              <span className="text-xs font-medium">前进一步</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              disabled={training.historyIndex <= 0}
              className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg ${
                training.historyIndex <= 0
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <Undo2 size={20} />
              <span className="text-xs font-medium">回退一步</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="flex flex-col items-center justify-center gap-1 py-3 bg-red-700 hover:bg-red-600 rounded-lg text-white"
            >
              <RotateCcw size={20} />
              <span className="text-xs font-medium">重置</span>
            </motion.button>
          </div>

          <div className="mt-3 text-center">
            <p className="text-zinc-500 text-xs">
              💡 训练模式没有时间限制，点击道岔可切换方向，慢慢研究最佳路线
            </p>
          </div>
        </div>

        <div className="mt-4 bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
          <div className="flex items-start gap-2">
            <span className="text-cyan-400 text-lg">🎯</span>
            <div>
              <p className="text-zinc-300 text-sm font-medium">训练模式说明</p>
              <ul className="text-zinc-500 text-xs mt-1 space-y-0.5">
                <li>• 点击「生成矿车」手动放出矿车</li>
                <li>• 点击「前进一步」让所有矿车移动一格</li>
                <li>• 点击「回退一步」撤销上一步操作</li>
                <li>• 点击「重置」清空所有矿车重新开始</li>
                <li>• 没有倒计时，不会失败，放心练习</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLevelSelect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLevelSelect(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-800 rounded-xl p-6 w-full max-w-md border border-zinc-700 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-zinc-200 mb-4">选择训练地图</h3>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-zinc-400 mb-2">官方关卡</h4>
                <div className="space-y-2">
                  {levels.map(level => (
                    <motion.button
                      key={level.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => selectOfficialLevel(level.id)}
                      className="w-full text-left p-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-bold">{level.id}</span>
                        <span className="text-zinc-200 font-medium">{level.name}</span>
                      </div>
                      <p className="text-zinc-500 text-xs mt-1">{level.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-2">我的关卡</h4>
                {customLevels.length === 0 ? (
                  <p className="text-zinc-500 text-sm">还没有自定义关卡</p>
                ) : (
                  <div className="space-y-2">
                    {customLevels.map(level => (
                      <motion.button
                        key={level.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => selectCustomLevel(level)}
                        className="w-full text-left p-3 bg-zinc-700/50 hover:bg-zinc-700 rounded-lg"
                      >
                        <div className="text-zinc-200 font-medium">{level.name}</div>
                        {level.description && (
                          <p className="text-zinc-500 text-xs mt-1 truncate">{level.description}</p>
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
