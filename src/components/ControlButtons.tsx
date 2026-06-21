import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Play, Info, HelpCircle } from 'lucide-react';

export const ControlButtons = () => {
  const status = useGameStore(s => s.status);
  const currentLevel = useGameStore(s => s.currentLevel);
  const startGame = useGameStore(s => s.startGame);

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
        {status === 'idle' && (
          <>
            <div className="flex gap-3 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${buttonClass} bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg`}
                onClick={handleStart}
              >
                <Play size={20} />
                开始游戏
              </motion.button>
            </div>

            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-700 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
                <HelpCircle size={16} />
                <span className="text-sm">游戏说明</span>
              </div>
              <ul className="text-xs text-zinc-300 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">🚂</span>
                  <span>矿车会从绿色入口随机颜色驶出，沿轨道自动运行</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 flex-shrink-0">🔀</span>
                  <span>点击道岔格子切换方向（右下角箭头指示当前方向）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 flex-shrink-0">🔴</span>
                  <span>红色矿石 → 红色仓库 | 🔵蓝色 → 蓝色 | 🟡黄色 → 黄色</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 flex-shrink-0">⚠️</span>
                  <span>避免：送错仓库、矿车相撞、驶出轨道、超过时间限制</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 flex-shrink-0">🎯</span>
                  <span>达到目标配送数或分数即可通关，自动解锁下一关</span>
                </li>
              </ul>
            </div>
          </>
        )}

        {status !== 'idle' && (
          <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-700">
            <div className="flex items-center gap-2 text-zinc-400 text-xs">
              <Info size={14} />
              <span>提示：使用下方面板控制暂停/重开，或设置辅助模式</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
