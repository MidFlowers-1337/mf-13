import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Trophy, XCircle, RotateCcw, SkipForward } from 'lucide-react';
import { levels } from '../data/levels';

export const StatusModal = () => {
  const {
    status,
    score,
    currentLevel,
    restartGame,
    nextLevel,
    startGame
  } = useGameStore();

  const hasNextLevel = currentLevel < levels.length;

  const isVisible = status === 'won' || status === 'lost';

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-zinc-800 rounded-2xl p-8 max-w-md w-full border-2 border-zinc-600 shadow-2xl"
        >
          <div className="text-center">
            {status === 'won' ? (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Trophy size={40} className="text-white" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-amber-400 mb-2"
                >
                  恭喜通关！
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-zinc-300 mb-6"
                >
                  你成功完成了第 {currentLevel} 关！
                </motion.p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg"
                >
                  <XCircle size={40} className="text-white" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-red-400 mb-2"
                >
                  游戏结束
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-zinc-300 mb-6"
                >
                  再接再厉，下次一定能成功！
                </motion.p>
              </>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-zinc-900 rounded-xl p-4 mb-6"
            >
              <div className="text-zinc-400 text-sm mb-1">最终得分</div>
              <div className="text-4xl font-bold text-amber-400 font-mono">{score}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3"
            >
              <button
                onClick={restartGame}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-zinc-600 hover:bg-zinc-500 text-white rounded-xl font-bold transition-all active:scale-95"
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
                  重新挑战
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
