import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Trophy, XCircle, RotateCcw, SkipForward, Target, Clock, Gem, AlertTriangle, Home, MapPin } from 'lucide-react';
import { levels } from '../data/levels';
import type { OreColor, FailureType } from '../types/game';

const getColorName = (color: OreColor | undefined): string => {
  switch (color) {
    case 'red': return '红色';
    case 'blue': return '蓝色';
    case 'yellow': return '黄色';
    default: return '未知';
  }
};

const getColorBg = (color: OreColor | undefined): string => {
  switch (color) {
    case 'red': return 'bg-red-500';
    case 'blue': return 'bg-blue-500';
    case 'yellow': return 'bg-yellow-400';
    default: return 'bg-zinc-500';
  }
};

const getFailureIcon = (type: FailureType | undefined) => {
  switch (type) {
    case 'wrong_warehouse': return <Target size={40} className="text-white" />;
    case 'collision': return <XCircle size={40} className="text-white" />;
    case 'derail': return <AlertTriangle size={40} className="text-white" />;
    case 'timeout': return <Clock size={40} className="text-white" />;
    default: return <XCircle size={40} className="text-white" />;
  }
};

const getFailureTitle = (type: FailureType | undefined): string => {
  switch (type) {
    case 'wrong_warehouse': return '送错仓库';
    case 'collision': return '矿车相撞';
    case 'derail': return '矿车出轨';
    case 'timeout': return '时间耗尽';
    default: return '游戏结束';
  }
};

export const StatusModal = () => {
  const status = useGameStore(s => s.status);
  const score = useGameStore(s => s.score);
  const deliveries = useGameStore(s => s.deliveries);
  const elapsedTime = useGameStore(s => s.elapsedTime);
  const currentLevel = useGameStore(s => s.currentLevel);
  const highScore = useGameStore(s => s.highScore);
  const failureDetails = useGameStore(s => s.failureDetails);
  const levelProgress = useGameStore(s => s.levelProgress);
  const restartGame = useGameStore(s => s.restartGame);
  const nextLevel = useGameStore(s => s.nextLevel);
  const startGame = useGameStore(s => s.startGame);

  const hasNextLevel = currentLevel < levels.length;
  const isVisible = status === 'won' || status === 'lost';

  const level = levels.find(l => l.id === currentLevel) || levels[0];
  const progress = levelProgress[currentLevel];
  const isNewHighScore = status === 'won' && progress?.bestScore === score && score > 0;
  const isBestTime = status === 'won' && progress?.bestTime === elapsedTime && elapsedTime > 0;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-zinc-800 rounded-2xl p-6 md:p-8 max-w-md w-full border-2 border-zinc-600 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="text-center">
            {status === 'won' ? (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-2xl"
                >
                  <Trophy size={48} className="text-white" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent mb-2"
                >
                  🎉 恭喜通关！
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-zinc-300 mb-5"
                >
                  第 {currentLevel} 关「{level.name}」完成！
                </motion.p>

                {(isNewHighScore || isBestTime) && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.35, type: 'spring' }}
                    className="mb-5 py-3 px-4 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-xl"
                  >
                    <div className="flex flex-wrap items-center justify-center gap-2 text-yellow-300 font-bold">
                      {isNewHighScore && <span className="animate-pulse">🏆 新纪录！最高分</span>}
                      {isNewHighScore && isBestTime && <span>·</span>}
                      {isBestTime && <span className="animate-pulse">⚡ 最快通关！</span>}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-3 gap-2 md:gap-3 mb-5"
                >
                  <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-700">
                    <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                      <Gem size={14} />
                      <span className="text-xs">得分</span>
                    </div>
                    <div className="font-mono text-2xl font-bold text-amber-300">{score}</div>
                  </div>
                  <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-700">
                    <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                      <Target size={14} />
                      <span className="text-xs">配送</span>
                    </div>
                    <div className="font-mono text-2xl font-bold text-emerald-300">{deliveries}</div>
                  </div>
                  <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-700">
                    <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                      <Clock size={14} />
                      <span className="text-xs">用时</span>
                    </div>
                    <div className="font-mono text-2xl font-bold text-cyan-300">{elapsedTime}s</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-zinc-900/80 rounded-xl p-3 mb-6 border border-zinc-700"
                >
                  <div className="flex items-center justify-around text-xs md:text-sm">
                    <div className="text-zinc-400">
                      历史最高分：<span className="text-yellow-400 font-bold font-mono">{highScore}</span>
                    </div>
                    {progress?.bestTime !== null && progress?.bestTime !== undefined && (
                      <div className="text-zinc-400">
                        最快用时：<span className="text-cyan-400 font-bold font-mono">{progress.bestTime}s</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center shadow-2xl ${
                    failureDetails?.type === 'timeout'
                      ? 'bg-gradient-to-br from-orange-500 to-red-600'
                      : failureDetails?.type === 'collision'
                        ? 'bg-gradient-to-br from-purple-500 to-red-600'
                        : failureDetails?.type === 'wrong_warehouse'
                          ? 'bg-gradient-to-br from-pink-500 to-red-600'
                          : 'bg-gradient-to-br from-red-500 to-red-700'
                  }`}
                >
                  {getFailureIcon(failureDetails?.type)}
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl font-bold text-red-400 mb-2"
                >
                  {getFailureTitle(failureDetails?.type)}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-zinc-300 mb-5 text-base md:text-lg"
                >
                  {failureDetails?.message || '再接再厉，下次一定能成功！'}
                </motion.p>

                {failureDetails && failureDetails.type !== 'timeout' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-zinc-900/80 rounded-xl p-4 mb-5 border border-red-500/30 text-left space-y-2"
                  >
                    {failureDetails.cartId !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-400">矿车编号：</span>
                        <span className="font-mono text-zinc-200 font-bold">#{failureDetails.cartId}</span>
                      </div>
                    )}
                    {failureDetails.cartColor && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-400">矿车颜色：</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white ${getColorBg(failureDetails.cartColor)}`}>
                          {getColorName(failureDetails.cartColor)}
                        </span>
                      </div>
                    )}
                    {failureDetails.position && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <MapPin size={12} /> 事发位置：
                        </span>
                        <span className="font-mono text-zinc-200 font-bold">
                          ({failureDetails.position.x}, {failureDetails.position.y})
                        </span>
                      </div>
                    )}
                    {failureDetails.targetWarehouse && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Target size={12} /> 目标仓库：
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white ${getColorBg(failureDetails.targetWarehouse.color)}`}>
                          {getColorName(failureDetails.targetWarehouse.color)}仓库 ({failureDetails.targetWarehouse.x},{failureDetails.targetWarehouse.y})
                        </span>
                      </div>
                    )}
                    {failureDetails.actualWarehouse && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Home size={12} /> 实际进入：
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white ${getColorBg(failureDetails.actualWarehouse.color)}`}>
                          {getColorName(failureDetails.actualWarehouse.color)}仓库 ({failureDetails.actualWarehouse.x},{failureDetails.actualWarehouse.y})
                        </span>
                      </div>
                    )}
                    {failureDetails.otherCartId !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-400">相撞矿车：</span>
                        <span className="font-mono text-zinc-200 font-bold">#{failureDetails.otherCartId}</span>
                      </div>
                    )}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-3 gap-2 md:gap-3 mb-6"
                >
                  <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-700">
                    <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                      <Gem size={14} />
                      <span className="text-xs">得分</span>
                    </div>
                    <div className="font-mono text-xl font-bold text-amber-300">{score}</div>
                  </div>
                  <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-700">
                    <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                      <Target size={14} />
                      <span className="text-xs">配送</span>
                    </div>
                    <div className="font-mono text-xl font-bold text-emerald-300">{deliveries}/{level.targetDeliveries}</div>
                  </div>
                  <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-700">
                    <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                      <Clock size={14} />
                      <span className="text-xs">用时</span>
                    </div>
                    <div className="font-mono text-xl font-bold text-cyan-300">{elapsedTime}s</div>
                  </div>
                </motion.div>
              </>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: status === 'won' ? 0.6 : 0.5 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button
                onClick={restartGame}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-zinc-600 hover:bg-zinc-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg"
              >
                <RotateCcw size={20} />
                重新开始
              </button>

              {status === 'won' && hasNextLevel && (
                <button
                  onClick={nextLevel}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg"
                >
                  <SkipForward size={20} />
                  下一关
                </button>
              )}

              {status === 'won' && !hasNextLevel && (
                <button
                  onClick={() => startGame(1)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg"
                >
                  <SkipForward size={20} />
                  从第1关重新挑战
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
