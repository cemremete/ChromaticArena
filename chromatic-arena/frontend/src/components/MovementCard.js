import { motion } from 'framer-motion';
import { Lock, ChevronRight } from 'lucide-react';

export const MovementCard = ({ movement, userLevel = 1, onClick, selected }) => {
  const isLocked = userLevel < movement.unlock_level;
  
  const difficultyColors = {
    'Easy': 'bg-green-500',
    'Medium': 'bg-yellow-500',
    'Hard': 'bg-red-500'
  };

  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.02, y: -5 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      onClick={() => !isLocked && onClick?.(movement)}
      className={`relative glass-card p-6 cursor-pointer overflow-hidden group ${
        isLocked ? 'opacity-60 cursor-not-allowed' : ''
      } ${selected ? 'ring-2 ring-primary' : ''}`}
      data-testid={`movement-card-${movement.movement_id}`}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20"
        style={{
          background: `linear-gradient(135deg, ${movement.color_palette[0]} 0%, ${movement.color_palette[1] || movement.color_palette[0]} 100%)`
        }}
      />
      
      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <Lock className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Level {movement.unlock_level} Required</p>
          </div>
        </div>
      )}

      <div className="relative z-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">{movement.name}</h3>
            <p className="text-sm text-gray-500">{movement.era}</p>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${difficultyColors[movement.difficulty]}`}>
            {movement.difficulty}
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {movement.description}
        </p>

        {/* Color palette */}
        <div className="flex gap-1 mb-4">
          {movement.color_palette.slice(0, 5).map((color, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Rules preview */}
        <div className="flex flex-wrap gap-2 mb-4">
          {movement.rules?.slice(0, 2).map((rule, index) => (
            <span 
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-full"
            >
              {rule}
            </span>
          ))}
          {movement.rules?.length > 2 && (
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-full">
              +{movement.rules.length - 2} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
          <div className="flex gap-1">
            {movement.tools?.slice(0, 4).map((tool, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs"
                title={tool}
              >
                {tool.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          
          {!isLocked && (
            <motion.div
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
              className="flex items-center gap-1 text-primary font-medium text-sm"
            >
              <span>Start</span>
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};