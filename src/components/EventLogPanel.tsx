import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Lightbulb,
  Snail,
  Eye,
  EyeOff,
  ScrollText,
  Train,
  Package,
  Shuffle,
  Trophy,
  XCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import type { EventType } from '../types/game';
import { levels } from '../data/levels';

export const EventLogPanel = () => {
  const eventLog = useGameStore(s => s.eventLog);
  const settings = useGameStore(s => s.settings);
  const updateSettings = useGameStore(s => s.updateSettings);
  const status = useGameStore(s => s.status);
  const startGame = useGameStore(s => s.startGame);
  const pauseGame = useGameStore(s => s.pauseGame);
  const resumeGame = useGameStore(s => s.resumeGame);
  const restartGame = useGameStore(s => s.restartGame);
  const nextLevel = useGameStore(s => s.nextLevel);
  const currentLevel = useGameStore(s => s.currentLevel);
  const levelProgress = useGameStore(s => s.levelProgress);

  const getEventIcon = (type: EventType) => {
    const iconClass = 'w-4 h-4 flex-shrink-0';
    switch (type) {
      case 'cart_spawn':
        return <Train className={`${iconClass} text-green-400`} />;
      case 'cart_delivered':
        return <Package className={`${iconClass} text-emerald-400`} />;
      case 'switch_toggle':
        return <Shuffle className={`${iconClass} text-amber-400`} />;
      case 'game_start':
        return <Play className={`${iconClass} text-blue-400`} />;
      case 'game_pause':
        return <Pause className={`${iconClass} text-zinc-400`} />;
      case 'game_resume':
        return <Play className={`${iconClass} text-green-400`} />;
      case 'game_restart':
        return <RotateCcw className={`${iconClass} text-cyan-400`} />;
      case 'game_won':
        return <Trophy className={`${iconClass} text-yellow-400`} />;
      case 'game_lost':
        return <XCircle className={`${iconClass} text-red-400`} />;
      default:
        return <AlertTriangle className={`${iconClass} text-zinc-400`} />;
    }
  };

  const formatTime = (ts: number): string => {
    const date = new Date(ts);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
  };

  const hasNextLevel = currentLevel < levels.length;

  return (
    <div className="w-full max-w-[540px] mx-auto mt-4 space-y-4">
      <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-amber-400" />
          <span className="text-zinc-200 font-bold text-sm">辅助设置</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateSettings({ hintMode: !settings.hintMode })}
            className={`
              flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-all
              ${settings.hintMode
                ? 'bg-amber-600/80 border-2 border-amber-400 text-white'
                : 'bg-zinc-700/80 border border-zinc-600 text-zinc-300 hover:bg-zinc-600'
              }
            `}
          >
            <Lightbulb size={20} />
            <span className="text-xs font-bold">提示模式</span>
            <span className="text-[10px] opacity-70">
              {settings.hintMode ? '已开启' : '点击道岔提示'}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateSettings({ slowMode: !settings.slowMode })}
            className={`
              flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-all
              ${settings.slowMode
                ? 'bg-cyan-600/80 border-2 border-cyan-400 text-white'
                : 'bg-zinc-700/80 border border-zinc-600 text-zinc-300 hover:bg-zinc-600'
              }
            `}
          >
            <Snail size={20} />
            <span className="text-xs font-bold">慢速模式</span>
            <span className="text-[10px] opacity-70">
              {settings.slowMode ? '速度 x0.5' : '正常速度'}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => updateSettings({ showDestination: !settings.showDestination })}
            className={`
              flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-all
              ${settings.showDestination
                ? 'bg-emerald-600/80 border-2 border-emerald-400 text-white'
                : 'bg-zinc-700/80 border border-zinc-600 text-zinc-300 hover:bg-zinc-600'
              }
            `}
          >
            {settings.showDestination ? <Eye size={20} /> : <EyeOff size={20} />}
            <span className="text-xs font-bold">目的地标记</span>
            <span className="text-[10px] opacity-70">
              {settings.showDestination ? '显示目标颜色' : '隐藏'}
            </span>
          </motion.button>
        </div>
      </div>

      {status === 'idle' && (
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-yellow-400" />
            <span className="text-zinc-200 font-bold text-sm">关卡选择</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {levels.map((level: typeof levels[0]) => {
              const progress = levelProgress[level.id];
              const isUnlocked = progress?.unlocked;
              const isCompleted = progress?.completed;
              const bestScore = progress?.bestScore || 0;
              const bestTime = progress?.bestTime;

              return (
                <motion.button
                  key={level.id}
                  whileHover={isUnlocked ? { scale: 1.01 } : {}}
                  whileTap={isUnlocked ? { scale: 0.99 } : {}}
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked && startGame(level.id)}
                  className={`
                    w-full p-3 rounded-lg text-left transition-all flex items-center gap-3
                    ${isUnlocked
                      ? isCompleted
                        ? 'bg-gradient-to-r from-emerald-800/60 to-green-800/60 border-2 border-emerald-500 hover:from-emerald-700/60 hover:to-green-700/60 cursor-pointer'
                        : 'bg-zinc-700 border-2 border-zinc-500 hover:bg-zinc-600 cursor-pointer'
                      : 'bg-zinc-800/50 border border-zinc-700 opacity-60 cursor-not-allowed'
                    }
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0
                    ${isUnlocked
                      ? isCompleted ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                      : 'bg-zinc-700 text-zinc-500'
                    }
                  `}>
                    {isUnlocked ? (isCompleted ? '✓' : level.id) : '🔒'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{level.name}</span>
                      {isCompleted && (
                        <span className="text-[10px] bg-yellow-500/30 text-yellow-300 px-2 py-0.5 rounded-full">已通关</span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5 truncate">{level.description}</div>
                    {isCompleted && (
                      <div className="flex items-center gap-3 mt-1 text-[11px]">
                        <span className="text-amber-300">🏆 {bestScore}分</span>
                        {bestTime !== null && bestTime !== undefined && (
                          <span className="text-cyan-300 flex items-center gap-1">
                            <Clock size={10} /> {bestTime}s
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {(status === 'playing' || status === 'paused' || status === 'lost' || status === 'won') && (
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ScrollText size={16} className="text-cyan-400" />
              <span className="text-zinc-200 font-bold text-sm">操作记录</span>
            </div>
            <span className="text-xs text-zinc-500">最近 {eventLog.length} 条</span>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {eventLog.length === 0 ? (
              <div className="text-zinc-500 text-sm text-center py-4">
                暂无记录，开始游戏后会在这里显示操作日志
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {eventLog.slice(0, 20).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.01 }}
                    className="flex items-start gap-2 py-1.5 px-2 rounded hover:bg-zinc-700/50 transition-colors"
                  >
                    <div className="mt-0.5">{getEventIcon(event.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-200 leading-tight">{event.message}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                        {formatTime(event.timestamp)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      )}

      {(status === 'playing' || status === 'paused') && (
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 shadow-xl">
          <div className="flex gap-2">
            {status === 'playing' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={pauseGame}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all active:scale-95"
              >
                <Pause size={20} />
                暂停
              </motion.button>
            )}

            {status === 'paused' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resumeGame}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold bg-green-600 hover:bg-green-500 text-white transition-all active:scale-95"
              >
                <Play size={20} />
                继续游戏
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={restartGame}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold bg-zinc-600 hover:bg-zinc-500 text-white transition-all active:scale-95"
            >
              <RotateCcw size={20} />
              重新开始
            </motion.button>
          </div>
        </div>
      )}

      {(status === 'lost' || status === 'won') && (
        <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 shadow-xl">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={restartGame}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95"
            >
              <RotateCcw size={20} />
              再来一次
            </motion.button>

            {status === 'won' && hasNextLevel && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextLevel}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white transition-all active:scale-95 shadow-lg"
              >
                <SkipForward size={20} />
                下一关
              </motion.button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
