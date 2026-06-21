import { useState, useEffect, useRef } from 'react';
import { Cell } from './Cell';
import { Cart } from './Cart';
import { useGameStore } from '../store/gameStore';

export const GameBoard = () => {
  const grid = useGameStore(s => s.grid);
  const carts = useGameStore(s => s.carts);
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
      </div>
    </div>
  );
};
