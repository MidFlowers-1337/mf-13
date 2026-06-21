import { motion, AnimatePresence } from 'framer-motion';
import type { Cart as CartType, OreColor } from '../types/game';
import { getColorClass, getColorBorderClass } from '../utils/gameLogic';
import { useGameStore } from '../store/gameStore';
import { Target } from 'lucide-react';

interface CartProps {
  cart: CartType;
  cellSize: number;
}

const getColorEmoji = (color: OreColor): string => {
  switch (color) {
    case 'red': return '🔴';
    case 'blue': return '🔵';
    case 'yellow': return '🟡';
  }
};

export const Cart = ({ cart, cellSize }: CartProps) => {
  const showDestination = useGameStore(s => s.settings.showDestination);
  const cartSize = cellSize * 0.7;
  const offset = (cellSize - cartSize) / 2;
  const indicatorSize = Math.max(16, cellSize * 0.28);

  return (
    <AnimatePresence>
      <motion.div
        key={cart.id}
        className="absolute"
        initial={{
          x: cart.prevX * cellSize + offset,
          y: cart.prevY * cellSize + offset,
          opacity: 0,
          scale: 0.5
        }}
        animate={{
          x: cart.x * cellSize + offset,
          y: cart.y * cellSize + offset,
          opacity: 1,
          scale: 1
        }}
        exit={{
          opacity: 0,
          scale: 1.5,
          transition: { duration: 0.3 }
        }}
        transition={{
          x: { duration: 0.4, ease: 'easeInOut' },
          y: { duration: 0.4, ease: 'easeInOut' },
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 }
        }}
        style={{
          width: cartSize,
          height: cartSize,
          zIndex: 20
        }}
      >
        <div
          className={`absolute inset-0 rounded-md shadow-lg border-2 ${getColorClass(cart.color)} ${getColorBorderClass(cart.color)}`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/80 font-bold drop-shadow-md" style={{ fontSize: `${cellSize * 0.18}px` }}>
              {getColorEmoji(cart.color)}
            </div>
          </div>
          <div className="absolute -bottom-1 left-1 right-1 h-2 flex justify-between">
            <div className="w-2 h-2 bg-zinc-800 rounded-full border border-zinc-600" />
            <div className="w-2 h-2 bg-zinc-800 rounded-full border border-zinc-600" />
          </div>
          <div className="absolute -top-1 left-1 right-1 h-2 flex justify-between">
            <div className="w-2 h-2 bg-zinc-800 rounded-full border border-zinc-600" />
            <div className="w-2 h-2 bg-zinc-800 rounded-full border border-zinc-600" />
          </div>
        </div>

        {showDestination && cart.targetWarehouse && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1 z-30"
            style={{ width: indicatorSize, height: indicatorSize }}
          >
            <div
              className={`w-full h-full rounded-full border-2 border-white shadow-lg flex items-center justify-center ${getColorClass(cart.targetWarehouse.color)} animate-pulse`}
              title={`目标：${cart.targetWarehouse.color === 'red' ? '红色' : cart.targetWarehouse.color === 'blue' ? '蓝色' : '黄色'}仓库 (${cart.targetWarehouse.x},${cart.targetWarehouse.y})`}
            >
              <Target size={indicatorSize * 0.55} className="text-white drop-shadow" strokeWidth={3} />
            </div>
          </motion.div>
        )}

        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap"
          style={{ fontSize: `${Math.max(9, cellSize * 0.14)}px` }}
        >
          <span className="text-zinc-400 font-mono bg-zinc-900/80 px-1 rounded">
            #{cart.id}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
