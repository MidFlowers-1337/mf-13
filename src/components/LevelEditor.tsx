import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Trash2,
  Download,
  Upload,
  Settings,
  AlertTriangle,
  CheckCircle,
  X,
  Play
} from 'lucide-react';
import type {
  Cell,
  EditorTool,
  ValidationError,
  Direction,
  OreColor,
  CustomLevel
} from '../types/game';
import { createEmptyGrid, saveCustomLevel, deleteCustomLevel, exportLevelToJson, importLevelFromJson, createNewLevel, updateLevelGrid, loadCustomLevels, getCustomLevel } from '../data/customLevels';
import { validateLevel } from '../utils/levelValidator';
import { useGameStore } from '../store/gameStore';
import { getDirectionArrow, getColorClass, getColorBorderClass } from '../utils/gameLogic';

interface LevelEditorProps {
  initialLevelId?: string;
}

export const LevelEditor = ({ initialLevelId }: LevelEditorProps) => {
  const setView = useGameStore(s => s.setView);
  const startTraining = useGameStore(s => s.startTraining);

  const [level, setLevel] = useState<CustomLevel>(() => {
    if (initialLevelId) {
      const existing = getCustomLevel(initialLevelId);
      if (existing) return existing;
    }
    return createNewLevel('我的关卡');
  });

  const [grid, setGrid] = useState<Cell[][]>(() =>
    initialLevelId && getCustomLevel(initialLevelId)
      ? getCustomLevel(initialLevelId)!.grid.map(row => row.map(cell => ({ ...cell })))
      : createEmptyGrid()
  );

  const [selectedTool, setSelectedTool] = useState<EditorTool>('track');
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [levelList, setLevelList] = useState<CustomLevel[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLevelList(loadCustomLevels());
  }, []);

  useEffect(() => {
    const errors = validateLevel(grid, level.oreColors);
    setValidationErrors(errors);
  }, [grid, level.oreColors]);

  const handleCellClick = (x: number, y: number) => {
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

    switch (selectedTool) {
      case 'empty':
        newGrid[y][x] = { type: 'empty' };
        break;
      case 'track':
        newGrid[y][x] = { type: 'track' };
        break;
      case 'switch':
        newGrid[y][x] = {
          type: 'switch',
          switchConfig: {
            direction1: 'right',
            direction2: 'down',
            current: 0
          }
        };
        break;
      case 'entrance':
        newGrid[y][x] = {
          type: 'entrance',
          entranceDirection: 'right'
        };
        break;
      case 'warehouse':
        newGrid[y][x] = {
          type: 'warehouse',
          color: 'red'
        };
        break;
    }

    setGrid(newGrid);
    setSelectedCell({ x, y });
  };

  const handleCellRightClick = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    setSelectedCell({ x, y });
  };

  const updateSelectedCell = (updates: Partial<Cell>) => {
    if (!selectedCell) return;
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    newGrid[selectedCell.y][selectedCell.x] = {
      ...newGrid[selectedCell.y][selectedCell.x],
      ...updates
    };
    setGrid(newGrid);
  };

  const cycleEntranceDirection = () => {
    if (!selectedCell) return;
    const cell = grid[selectedCell.y][selectedCell.x];
    if (cell.type !== 'entrance') return;

    const directions: Direction[] = ['up', 'right', 'down', 'left'];
    const currentIndex = directions.indexOf(cell.entranceDirection || 'right');
    const nextDir = directions[(currentIndex + 1) % 4];

    updateSelectedCell({ entranceDirection: nextDir });
  };

  const cycleWarehouseColor = () => {
    if (!selectedCell) return;
    const cell = grid[selectedCell.y][selectedCell.x];
    if (cell.type !== 'warehouse') return;

    const colors: OreColor[] = ['red', 'blue', 'yellow'];
    const currentIndex = colors.indexOf(cell.color || 'red');
    const nextColor = colors[(currentIndex + 1) % 3];

    updateSelectedCell({ color: nextColor });
  };

  const cycleSwitchDirection = () => {
    if (!selectedCell) return;
    const cell = grid[selectedCell.y][selectedCell.x];
    if (cell.type !== 'switch' || !cell.switchConfig) return;

    const pairs: Array<[Direction, Direction]> = [
      ['up', 'down'],
      ['left', 'right'],
      ['up', 'right'],
      ['right', 'down'],
      ['down', 'left'],
      ['left', 'up']
    ];

    const currentPair = [cell.switchConfig.direction1, cell.switchConfig.direction2].sort().join(',');
    const currentIndex = pairs.findIndex(p => p.sort().join(',') === currentPair);
    const nextPair = pairs[(currentIndex + 1) % pairs.length];

    updateSelectedCell({
      switchConfig: {
        direction1: nextPair[0],
        direction2: nextPair[1],
        current: 0
      }
    });
  };

  const toggleSwitchCurrent = () => {
    if (!selectedCell) return;
    const cell = grid[selectedCell.y][selectedCell.x];
    if (cell.type !== 'switch' || !cell.switchConfig) return;

    updateSelectedCell({
      switchConfig: {
        ...cell.switchConfig,
        current: cell.switchConfig.current === 0 ? 1 : 0
      }
    });
  };

  const handleSave = () => {
    if (validationErrors.length > 0) {
      return;
    }

    const updatedLevel = updateLevelGrid(level, grid);
    saveCustomLevel(updatedLevel);
    setLevel(updatedLevel);
    setLevelList(loadCustomLevels());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDelete = () => {
    deleteCustomLevel(level.id);
    setLevelList(loadCustomLevels());
    setShowDeleteConfirm(false);
    setView('home');
  };

  const handleExport = () => {
    const updatedLevel = updateLevelGrid(level, grid);
    const json = exportLevelToJson(updatedLevel);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${updatedLevel.name || 'level'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
      handleImportSubmit(text);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = (text: string) => {
    const result = importLevelFromJson(text);
    if (result.success && result.level) {
      setLevel(result.level);
      setGrid(result.level.grid.map(row => row.map(cell => ({ ...cell }))));
      setImportError(null);
      setShowImport(false);
      setImportText('');
    } else {
      const errorMsg = result.errorDetails 
        ? `${result.error}：${result.errorDetails}` 
        : result.error || '导入失败';
      setImportError(errorMsg);
    }
  };

  const handleTestLevel = () => {
    if (validationErrors.length > 0) return;
    const updatedLevel = updateLevelGrid(level, grid);
    startTraining(updatedLevel);
  };

  const loadLevel = (levelId: string) => {
    const loaded = getCustomLevel(levelId);
    if (loaded) {
      setLevel(loaded);
      setGrid(loaded.grid.map(row => row.map(cell => ({ ...cell }))));
      setSelectedCell(null);
    }
  };

  const selectedCellData = selectedCell ? grid[selectedCell.y][selectedCell.x] : null;

  const toolButtons: Array<{ tool: EditorTool; label: string; icon: string }> = [
    { tool: 'empty', label: '擦除', icon: '⬜' },
    { tool: 'track', label: '轨道', icon: '━' },
    { tool: 'switch', label: '道岔', icon: '🔀' },
    { tool: 'entrance', label: '入口', icon: '🚪' },
    { tool: 'warehouse', label: '仓库', icon: '📦' }
  ];

  const getCellContent = (cell: Cell) => {
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
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                <div className="absolute top-1/2 left-0 right-0 h-3 bg-zinc-500 -translate-y-1/2" />
                <div className="absolute top-0 bottom-0 left-1/2 w-3 bg-zinc-500 -translate-x-1/2" />
              </div>
            </div>
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

  const isSelected = (x: number, y: number) =>
    selectedCell?.x === x && selectedCell?.y === y;

  const hasError = (x: number, y: number) =>
    validationErrors.some(e => e.position?.x === x && e.position?.y === y);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-4 px-3 md:py-6 md:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回</span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-amber-400">关卡编辑器</h1>
          <div className="w-20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <div className="flex flex-wrap gap-2 mb-4">
                {toolButtons.map(({ tool, label, icon }) => (
                  <motion.button
                    key={tool}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTool(tool)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTool === tool
                        ? 'bg-amber-600 text-white'
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="w-full max-w-[480px] mx-auto">
                <div className="relative w-full aspect-square bg-zinc-950 rounded-lg border-4 border-zinc-700 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
                    {grid.map((row, y) =>
                      row.map((cell, x) => (
                        <motion.div
                          key={`${x}-${y}`}
                          className={`
                            relative aspect-square border border-zinc-700
                            ${cell.type === 'empty' ? 'bg-zinc-900' : 'bg-zinc-800'}
                            ${isSelected(x, y) ? 'ring-2 ring-amber-400 ring-inset z-10' : ''}
                            ${hasError(x, y) ? 'ring-2 ring-red-500 ring-inset animate-pulse' : ''}
                            cursor-pointer hover:bg-zinc-700/50 transition-colors
                          `}
                          onClick={() => handleCellClick(x, y)}
                          onContextMenu={(e) => handleCellRightClick(e, x, y)}
                        >
                          {getCellContent(cell)}
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <p className="text-center text-zinc-500 text-xs mt-3">
                左键放置/选择 | 右键选择 | 选择后可在右侧属性面板调整
              </p>
            </div>

            {validationErrors.length > 0 && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                  <AlertTriangle size={18} />
                  <span>关卡有 {validationErrors.length} 个问题需要修复</span>
                </div>
                <ul className="space-y-1">
                  {validationErrors.map((error, i) => (
                    <li key={i} className="text-red-300 text-sm flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <span>{error.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {validationErrors.length === 0 && (
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-400 font-bold">
                  <CheckCircle size={18} />
                  <span>关卡验证通过！可以保存或测试了</span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <h3 className="font-bold text-zinc-200 mb-3">属性</h3>
              {selectedCellData ? (
                <div className="space-y-3">
                  <p className="text-zinc-400 text-sm">
                    位置: ({selectedCell?.x}, {selectedCell?.y})
                  </p>
                  <p className="text-zinc-400 text-sm">
                    类型: {selectedCellData.type}
                  </p>

                  {selectedCellData.type === 'entrance' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={cycleEntranceDirection}
                      className="w-full py-2 px-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-200"
                    >
                      入口方向: {getDirectionArrow(selectedCellData.entranceDirection || 'right')}
                    </motion.button>
                  )}

                  {selectedCellData.type === 'warehouse' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={cycleWarehouseColor}
                      className="w-full py-2 px-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-200"
                    >
                      仓库颜色: {selectedCellData.color === 'red' ? '🔴 红' : selectedCellData.color === 'blue' ? '🔵 蓝' : '🟡 黄'}
                    </motion.button>
                  )}

                  {selectedCellData.type === 'switch' && selectedCellData.switchConfig && (
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={cycleSwitchDirection}
                        className="w-full py-2 px-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-200"
                      >
                        道岔方向: {getDirectionArrow(selectedCellData.switchConfig.direction1)} ↔ {getDirectionArrow(selectedCellData.switchConfig.direction2)}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={toggleSwitchCurrent}
                        className="w-full py-2 px-3 bg-amber-700 hover:bg-amber-600 rounded-lg text-sm text-white"
                      >
                        当前方向: {getDirectionArrow(
                          selectedCellData.switchConfig.current === 0
                            ? selectedCellData.switchConfig.direction1
                            : selectedCellData.switchConfig.direction2
                        )}
                      </motion.button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">点击格子选择并编辑属性</p>
              )}
            </div>

            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-zinc-200">关卡设置</h3>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-zinc-400 hover:text-white"
                >
                  <Settings size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-zinc-400 text-xs">关卡名称</label>
                  <input
                    type="text"
                    value={level.name}
                    onChange={(e) => setLevel({ ...level, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <div>
                        <label className="text-zinc-400 text-xs">描述</label>
                        <textarea
                          value={level.description}
                          onChange={(e) => setLevel({ ...level, description: e.target.value })}
                          rows={2}
                          className="w-full mt-1 px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-amber-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 text-xs">矿车颜色</label>
                        <div className="flex gap-2 mt-1">
                          {(['red', 'blue', 'yellow'] as OreColor[]).map(color => (
                            <label key={color} className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={level.oreColors.includes(color)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setLevel({ ...level, oreColors: [...level.oreColors, color] });
                                  } else {
                                    setLevel({ ...level, oreColors: level.oreColors.filter(c => c !== color) });
                                  }
                                }}
                                className="accent-amber-500"
                              />
                              <span className={`text-sm ${
                                color === 'red' ? 'text-red-400' :
                                  color === 'blue' ? 'text-blue-400' : 'text-yellow-400'
                              }`}>
                                {color === 'red' ? '红' : color === 'blue' ? '蓝' : '黄'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-zinc-400 text-xs">目标分数</label>
                          <input
                            type="number"
                            value={level.targetScore}
                            onChange={(e) => setLevel({ ...level, targetScore: parseInt(e.target.value) || 0 })}
                            className="w-full mt-1 px-2 py-1 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 text-xs">目标配送</label>
                          <input
                            type="number"
                            value={level.targetDeliveries}
                            onChange={(e) => setLevel({ ...level, targetDeliveries: parseInt(e.target.value) || 0 })}
                            className="w-full mt-1 px-2 py-1 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-zinc-400 text-xs">生成间隔(ms)</label>
                          <input
                            type="number"
                            value={level.spawnInterval}
                            onChange={(e) => setLevel({ ...level, spawnInterval: parseInt(e.target.value) || 6000 })}
                            className="w-full mt-1 px-2 py-1 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 text-xs">移动间隔(ms)</label>
                          <input
                            type="number"
                            value={level.moveInterval}
                            onChange={(e) => setLevel({ ...level, moveInterval: parseInt(e.target.value) || 1200 })}
                            className="w-full mt-1 px-2 py-1 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-zinc-400 text-xs">时间限制(秒)</label>
                        <input
                          type="number"
                          value={level.timeLimit}
                          onChange={(e) => setLevel({ ...level, timeLimit: parseInt(e.target.value) || 180 })}
                          className="w-full mt-1 px-2 py-1 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={validationErrors.length > 0}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold ${
                  validationErrors.length > 0
                    ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                }`}
              >
                <Save size={18} />
                {saveSuccess ? '已保存 ✓' : '保存关卡'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTestLevel}
                disabled={validationErrors.length > 0}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium ${
                  validationErrors.length > 0
                    ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                <Play size={16} />
                测试关卡
              </motion.button>

              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  className="flex items-center justify-center gap-1 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-200"
                >
                  <Download size={14} />
                  导出
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowImport(true)}
                  className="flex items-center justify-center gap-1 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-200"
                >
                  <Upload size={14} />
                  导入
                </motion.button>
              </div>

              {initialLevelId && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-red-900/50 hover:bg-red-800/50 rounded-lg text-sm text-red-400 border border-red-800"
                >
                  <Trash2 size={14} />
                  删除关卡
                </motion.button>
              )}
            </div>

            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
              <h3 className="font-bold text-zinc-200 mb-3">我的关卡</h3>
              {levelList.length === 0 ? (
                <p className="text-zinc-500 text-sm">还没有保存的关卡</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {levelList.map(lvl => (
                    <motion.button
                      key={lvl.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => loadLevel(lvl.id)}
                      className={`w-full text-left p-2 rounded-lg text-sm ${
                        lvl.id === level.id
                          ? 'bg-amber-600/30 border border-amber-500 text-amber-200'
                          : 'bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="font-medium truncate">{lvl.name}</div>
                      <div className="text-xs text-zinc-500">
                        {new Date(lvl.updatedAt).toLocaleDateString()}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-800 rounded-xl p-6 w-full max-w-md border border-zinc-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-200">导入关卡</h3>
                <button onClick={() => setShowImport(false)} className="text-zinc-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">选择 JSON 文件</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-600 file:text-white hover:file:bg-amber-500"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-600" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-zinc-800 text-zinc-500 text-xs">或粘贴 JSON</span>
                  </div>
                </div>

                <div>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder='{"name": "我的关卡", "grid": [...]}'
                    rows={6}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-200 text-sm focus:outline-none focus:border-amber-500 font-mono resize-none"
                  />
                </div>

                {importError && (
                  <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
                    <p className="text-red-400 text-sm font-medium">{importError}</p>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleImportSubmit(importText)}
                  disabled={!importText.trim()}
                  className={`w-full py-3 rounded-lg font-bold ${
                    importText.trim()
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  导入
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-800 rounded-xl p-6 w-full max-w-sm border border-zinc-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-900/50 rounded-full flex items-center justify-center">
                  <Trash2 size={32} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-200 mb-2">确认删除？</h3>
                <p className="text-zinc-400 text-sm">
                  删除后无法恢复，确定要删除「{level.name}」吗？
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-zinc-200 font-medium"
                >
                  取消
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium"
                >
                  删除
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
