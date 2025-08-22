import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FaHeart } from 'react-icons/fa';

interface AnimatedHeartProps {
  isLiked: boolean;
  onToggle: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedHeart: React.FC<AnimatedHeartProps> = ({
  isLiked,
  onToggle,
  className = '',
  size = 'md'
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleClick = () => {
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={`p-2 ${className}`}
      >
        <motion.div
          animate={{
            scale: isAnimating ? [1, 1.3, 1] : 1,
            rotate: isAnimating ? [0, 15, -15, 0] : 0,
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
        >
          <motion.div
            animate={{
              color: isLiked ? '#ef4444' : '#6b7280',
            }}
            transition={{ duration: 0.2 }}
          >
            <FaHeart className={sizeClasses[size]} />
          </motion.div>
        </motion.div>
        
        {/* Particle effect */}
        {isAnimating && isLiked && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-red-400 rounded-full"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 0
                }}
                animate={{
                  x: Math.cos(i * 60 * Math.PI / 180) * 20,
                  y: Math.sin(i * 60 * Math.PI / 180) * 20,
                  opacity: 0,
                  scale: 1
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut"
                }}
                style={{
                  left: '50%',
                  top: '50%',
                }}
              />
            ))}
          </div>
        )}
      </Button>
    </motion.div>
  );
};