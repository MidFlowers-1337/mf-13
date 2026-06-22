import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameBoard } from '../components/GameBoard';
import { InfoPanel } from '../components/InfoPanel';
import { ControlButtons } from '../components/ControlButtons';
import { StatusModal } from '../components/StatusModal';
import { EventLogPanel } from '../components/EventLogPanel';
import { useGameEngine } from '../hooks/useGameEngine';
import { useGameStore } from '../store/gameStore';
import { Train, Edit3, BookOpen } from 'lucide-react';

export default function Home() {
  useGameEngine();
  const loadHighScore = useGameStore(s => s.loadHighScore);
  const loadLevelProgress = useGameStore(s => s.loadLevelProgress);
  const loadSettings = useGameStore(s => s.loadSettings);
  const setView = useGameStore(s => s.setView);
  const startTraining = useGameStore(s => s.startTraining);

  useEffect(() => {
    loadHighScore();
    loadLevelProgress();
    loadSettings();
  }, [loadHighScore, loadLevelProgress, loadSettings]);

  const handleTrainingMode = () => {
    startTraining(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-4 px-3 md:py-6 md:px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 md:mb-6"
        >
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2">
            <Train size={28} className="md:w-9 md:h-9 text-amber-400" />
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              矿车调度站
            </h1>
            <Train size={28} className="md:w-9 md:h-9 text-amber-400 transform scale-x-[-1]" />
          </div>
          <p className="text-zinc-400 text-xs md:text-sm px-2">
            点击道岔切换方向，引导矿车将矿石送到对应颜色的仓库
          </p>
        </motion.div>

        <div className="flex gap-2 mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTrainingMode}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium"
          >
            <BookOpen size={16} />
            <span>训练模式</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('editor')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-sm font-medium"
          >
            <Edit3 size={16} />
            <span>关卡编辑</span>
          </motion.button>
        </div>

        <InfoPanel />
        <GameBoard />
        <ControlButtons />
        <EventLogPanel />

        <div className="mt-4 md:mt-6 text-center text-zinc-500 text-[10px] md:text-xs px-2 pb-4">
          <p className="mb-1">💡 道岔格子上的箭头表示当前方向，点击可切换</p>
          <p>🔴 红色 → 红仓 | 🔵 蓝色 → 蓝仓 | 🟡 黄色 → 黄仓</p>
        </div>
      </div>

      <StatusModal />
    </div>
  );
}
