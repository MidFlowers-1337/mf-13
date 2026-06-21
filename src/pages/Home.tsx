import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameBoard } from '../components/GameBoard';
import { InfoPanel } from '../components/InfoPanel';
import { ControlButtons } from '../components/ControlButtons';
import { StatusModal } from '../components/StatusModal';
import { useGameEngine } from '../hooks/useGameEngine';
import { useGameStore } from '../store/gameStore';
import { Train } from 'lucide-react';

export default function Home() {
  useGameEngine();
  const { loadHighScore } = useGameStore();

  useEffect(() => {
    loadHighScore();
  }, [loadHighScore]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Train size={36} className="text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              矿车调度站
            </h1>
            <Train size={36} className="text-amber-400 transform scale-x-[-1]" />
          </div>
          <p className="text-zinc-400 text-sm">
            点击道岔切换方向，引导矿车将矿石送到对应颜色的仓库
          </p>
        </motion.div>

        <InfoPanel />
        <GameBoard />
        <ControlButtons />

        <div className="mt-6 text-center text-zinc-500 text-xs">
          <p>💡 提示：道岔格子上的箭头表示当前方向，点击可切换</p>
          <p className="mt-1">🔴 红色矿石 → 红色仓库 | 🔵 蓝色矿石 → 蓝色仓库 | 🟡 黄色矿石 → 黄色仓库</p>
        </div>
      </div>

      <StatusModal />
    </div>
  );
}