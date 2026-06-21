import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cell } from './Cell';
import { Cart } from './Cart';
import { useGameStore } from '../store/gameStore';
import { Pause } from 'lucide-react';

export const GameBoard = () => {
  const grid = useGameStore(s => s.grid);
  const carts = useGameStore(s => s.carts);
  const status = useGameStore(s => s.status);
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(80);

  useEffect(() => {
    const updateSize = () => {
      if (boardRef.current) {
        const width = boardRef.current.offsetWidth;
        setCellSize(width / 6);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="w-full max-w-[540px] mx-auto">
      <div
        ref={boardRef}
        className="relative w-full aspect-square bg-zinc-950 rounded-lg border-4 border-zinc-700 shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6">
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <Cell key={`${x}-${y}`} cell={cell} x={x} y={y} />
            ))
          )}
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {carts.map(cart => (
            <Cart key={cart.id} cart={cart} cellSize={cellSize} />
          ))}
        </div>

        <AnimatePresence>
          {status === 'paused' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-40"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                  <Pause size={48} className="text-white" strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">游戏暂停</h3>
                <p className="text-zinc-300 mb-4">点击下方"继续游戏"按钮恢复</p>
                <div className="inline-block px-6 py-2 bg-zinc-700/80 rounded-xl text-zinc-200 text-sm border border-zinc-600">
                  💡 趁现在想想下一步怎么调度！
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
