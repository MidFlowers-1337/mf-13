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
  const highlightedSwitches = useGameStore(s => s.highlightedSwitches);
  const failureDetails = useGameStore(s => s.failureDetails);

  const isHighlighted = highlightedSwitches.some(s => s.x === x && s.y === y);
  const isFailurePosition = failureDetails?.position?.x === x && failureDetails?.position?.y === y;
  const isFailureWarehouse = failureDetails?.actualWarehouse?.x === x && failureDetails?.actualWarehouse?.y === y;

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

      case 'switch': {
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
      }

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
    if (isFailurePosition || isFailureWarehouse) {
      return 'bg-red-700/60 animate-pulse';
    }
    if (isHighlighted) {
      return 'bg-amber-700/60 hover:bg-amber-600/70';
    }
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

  const getBorderClass = () => {
    if (isHighlighted) {
      return 'border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]';
    }
    if (isFailurePosition || isFailureWarehouse) {
      return 'border-2 border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.6)]';
    }
    return 'border border-zinc-700';
  };

  return (
    <motion.div
      className={`
        relative aspect-square
        ${getCellBg()}
        ${getBorderClass()}
        ${isClickable ? 'cursor-pointer' : ''}
        transition-all duration-150
      `}
      onClick={handleClick}
      whileHover={isClickable ? { scale: 1.02 } : {}}
      whileTap={isClickable ? { scale: 0.98 } : {}}
    >
      {getCellContent()}
      {isHighlighted && cell.type === 'switch' && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 rounded-sm pointer-events-none animate-pulse-glow text-amber-400"
          style={{ color: 'rgb(251 191 36)' }}
        />
      )}
    </motion.div>
  );
};
