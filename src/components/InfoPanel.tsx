import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { levels } from '../data/levels';
import { formatTime } from '../utils/gameLogic';
import { Clock, Trophy, Target, Gem, Timer, Zap } from 'lucide-react';

export const InfoPanel = () => {
  const currentLevel = useGameStore(s => s.currentLevel);
  const score = useGameStore(s => s.score);
  const highScore = useGameStore(s => s.highScore);
  const deliveries = useGameStore(s => s.deliveries);
  const timeRemaining = useGameStore(s => s.timeRemaining);
  const elapsedTime = useGameStore(s => s.elapsedTime);
  const message = useGameStore(s => s.message);
  const messageType = useGameStore(s => s.messageType);
  const settings = useGameStore(s => s.settings);

  const level = levels.find(l => l.id === currentLevel) || levels[0];

  const getMessageBg = () => {
    switch (messageType) {
      case 'success': return 'bg-green-600/90 border-green-400';
      case 'error': return 'bg-red-600/90 border-red-400';
      case 'info': return 'bg-blue-600/90 border-blue-400';
      default: return 'bg-zinc-600/90 border-zinc-400';
    }
  };

  return (
    <div className="w-full max-w-[540px] mx-auto mb-4">
      <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 shadow-xl">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-amber-400 font-bold text-lg">第 {currentLevel} 关</span>
            <span className="text-zinc-400 text-sm">{level.name}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {settings.slowMode && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-cyan-600/40 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                <Zap size={10} /> 慢速
              </span>
            )}
            {settings.hintMode && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-600/40 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                💡 提示
              </span>
            )}
            <div className="flex items-center gap-1 text-yellow-400">
              <Trophy size={16} />
              <span className="text-sm font-mono">{highScore}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <div className="bg-zinc-900 rounded-lg p-2 md:p-3 border border-zinc-700">
            <div className="flex items-center gap-1 md:gap-2 text-zinc-400 mb-1">
              <Clock size={12} className="md:w-3.5 md:h-3.5" />
              <span className="text-[10px] md:text-xs">剩余</span>
            </div>
            <div className={`font-mono text-lg md:text-xl font-bold ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-2 md:p-3 border border-zinc-700">
            <div className="flex items-center gap-1 md:gap-2 text-zinc-400 mb-1">
              <Zap size={12} className="md:w-3.5 md:h-3.5" />
              <span className="text-[10px] md:text-xs">用时</span>
            </div>
            <div className="font-mono text-lg md:text-xl font-bold text-cyan-400">
              {elapsedTime}s
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-2 md:p-3 border border-zinc-700">
            <div className="flex items-center gap-1 md:gap-2 text-zinc-400 mb-1">
              <Gem size={12} className="md:w-3.5 md:h-3.5" />
              <span className="text-[10px] md:text-xs">分数</span>
            </div>
            <div className="font-mono text-lg md:text-xl font-bold text-amber-400">
              {score}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg p-2 md:p-3 border border-zinc-700">
            <div className="flex items-center gap-1 md:gap-2 text-zinc-400 mb-1">
              <Target size={12} className="md:w-3.5 md:h-3.5" />
              <span className="text-[10px] md:text-xs">配送</span>
            </div>
            <div className="font-mono text-lg md:text-xl font-bold text-emerald-400">
              {deliveries}/{level.targetDeliveries}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-[10px] md:text-xs text-zinc-400 mb-1">
              <span>配送进度</span>
              <span>{Math.min(100, Math.round((deliveries / level.targetDeliveries) * 100))}%</span>
            </div>
            <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (deliveries / level.targetDeliveries) * 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-1">
              <Timer size={10} />
              <span>目标分</span>
            </div>
            <div className="font-mono text-sm font-bold text-green-400">{level.targetScore}</div>
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-3 p-2 md:p-3 rounded-lg border text-center font-bold text-white text-xs md:text-sm ${getMessageBg()}`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
