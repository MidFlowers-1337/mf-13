import { motion } from 'framer-motion';
import type { Cell as CellType } from '../types/game';
import {
  getDirectionArrow,
  getColorClass,
  getColorBorderClass
} from '../utils/gameLogic';
import { useGameStore } from '../store/gameStore';
interface CellProps {
  cell: CellType;
  x: number;
  y: number;
}

export const Cell = ({ cell, x, y }: CellProps) => {
  const toggleSwitch = useGameStore(s => s.toggleSwitch);
  const status = useGameStore(s => s.status);

  const handleClick = () => {
    if (cell.type === 'switch' && status === 'playing') {
      toggleSwitch(x, y);
    }
  };

  const isClickable = cell.type === 'switch' && status === 'playing';

  const getCellContent = () => {
    switch (cell.type) {
      case 'empty':
        return null;

      case 'track':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1 bg-zinc-600" />
            <div className="absolute w-1 h-full bg-zinc-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-3 bg-zinc-700" />
            </div>
          </div>
        );

      case 'switch':
        const currentDir = cell.switchConfig
          ? (cell.switchConfig.current === 0
            ? cell.switchConfig.direction1
            : cell.switchConfig.direction2)
          : null;
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1 bg-zinc-600" />
            <div className="absolute w-1 h-full bg-zinc-600" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: cell.switchConfig?.current === 0 ? 0 : 90 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative w-full h-full">
                <div className="absolute top-1/2 left-0 right-0 h-3 bg-zinc-500 -translate-y-1/2" />
                <div className="absolute top-0 bottom-0 left-1/2 w-3 bg-zinc-500 -translate-x-1/2" />
              </div>
            </motion.div>
            {currentDir && (
              <div className="absolute bottom-1 right-1 z-10">
                <span className="text-xs font-bold text-amber-400 bg-zinc-800 px-1 rounded">
                  {getDirectionArrow(currentDir)}
                </span>
              </div>
            )}
          </div>
        );

      case 'entrance':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1 bg-zinc-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-3 bg-green-700 border-2 border-green-500" />
            </div>
            <div className="absolute top-1 left-1 z-10">
              <span className="text-[10px] font-bold text-green-400 bg-zinc-800 px-1 rounded">
                入口
              </span>
            </div>
          </div>
        );

      case 'warehouse':
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1 bg-zinc-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-full h-6 rounded-sm border-2 ${getColorClass(cell.color || 'red')} ${getColorBorderClass(cell.color || 'red')} opacity-80`}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">
                {cell.color === 'red' && '🔴'}
                {cell.color === 'blue' && '🔵'}
                {cell.color === 'yellow' && '🟡'}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getCellBg = () => {
    switch (cell.type) {
      case 'empty':
        return 'bg-zinc-900';
      case 'track':
        return 'bg-zinc-800 hover:bg-zinc-700';
      case 'switch':
        return 'bg-zinc-700 hover:bg-zinc-600';
      case 'entrance':
        return 'bg-green-900/50';
      case 'warehouse':
        return 'bg-zinc-800';
      default:
        return 'bg-zinc-900';
    }
  };

  return (
    <motion.div
      className={`
        relative aspect-square border border-zinc-700
        ${getCellBg()}
        ${isClickable ? 'cursor-pointer' : ''}
        transition-colors duration-150
      `}
      onClick={handleClick}
      whileHover={isClickable ? { scale: 1.02 } : {}}
      whileTap={isClickable ? { scale: 0.98 } : {}}
    >
      {getCellContent()}
    </motion.div>
  );
};
