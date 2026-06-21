import { motion, AnimatePresence } from 'framer-motion';
import type { Cart as CartType } from '../types/game';
import { getColorClass } from '../utils/gameLogic';

interface CartProps {
  cart: CartType;
  cellSize: number;
}

export const Cart = ({ cart, cellSize }: CartProps) => {
  const cartSize = cellSize * 0.7;
  const offset = (cellSize - cartSize) / 2;

  return (
    <AnimatePresence>
      <motion.div
        key={cart.id}
        className={`absolute rounded-md shadow-lg border-2 ${getColorClass(cart.color)} border-white/30`}
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/80 font-bold text-xs drop-shadow-md">
            {cart.color === 'red' && '🔴'}
            {cart.color === 'blue' && '🔵'}
            {cart.color === 'yellow' && '🟡'}
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
      </motion.div>
    </AnimatePresence>
  );
};
