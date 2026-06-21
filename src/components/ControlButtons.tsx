import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { levels } from '../data/levels';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

export const ControlButtons = () => {
  const status = useGameStore(s => s.status);
  const currentLevel = useGameStore(s => s.currentLevel);
  const startGame = useGameStore(s => s.startGame);
  const pauseGame = useGameStore(s => s.pauseGame);
  const resumeGame = useGameStore(s => s.resumeGame);
  const restartGame = useGameStore(s => s.restartGame);
  const nextLevel = useGameStore(s => s.nextLevel);

  const hasNextLevel = currentLevel < levels.length;

  const handleStart = () => {
    startGame(currentLevel);
  };

  const buttonClass = `
    flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold
    transition-all duration-150 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <div className="w-full max-w-[540px] mx-auto mt-4">
      <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 shadow-xl">
        <div className="flex gap-3">
          {status === 'idle' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${buttonClass} bg-green-600 hover:bg-green-500 text-white`}
              onClick={handleStart}
            >
              <Play size={20} />
              开始游戏
            </motion.button>
          )}

          {status === 'playing' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${buttonClass} bg-amber-600 hover:bg-amber-500 text-white`}
              onClick={pauseGame}
            >
              <Pause size={20} />
              暂停
            </motion.button>
          )}

          {status === 'paused' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${buttonClass} bg-green-600 hover:bg-green-500 text-white`}
              onClick={resumeGame}
            >
              <Play size={20} />
              继续
            </motion.button>
          )}

          {status === 'won' && hasNextLevel && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${buttonClass} bg-emerald-600 hover:bg-emerald-500 text-white`}
              onClick={nextLevel}
            >
              <SkipForward size={20} />
              下一关
            </motion.button>
          )}

          {(status === 'lost' || status === 'won') && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${buttonClass} bg-blue-600 hover:bg-blue-500 text-white`}
              onClick={restartGame}
            >
              <RotateCcw size={20} />
              重新开始
            </motion.button>
          )}

          {(status === 'playing' || status === 'paused') && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${buttonClass} bg-zinc-600 hover:bg-zinc-500 text-white`}
              onClick={restartGame}
            >
              <RotateCcw size={20} />
              重开
            </motion.button>
          )}
        </div>

        {status === 'idle' && (
          <div className="mt-4">
            <p className="text-zinc-400 text-sm mb-2 text-center">选择关卡：</p>
            <div className="flex gap-2">
              {levels.map(level => (
                <motion.button
                  key={level.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all
                    ${currentLevel === level.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }
                  `}
                  onClick={() => startGame(level.id)}
                >
                  {level.id}. {level.name}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
