import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FaUserPlus, FaCheck } from 'react-icons/fa';

interface AnimatedFollowButtonProps {
  isFollowing: boolean;
  onToggle: () => void;
  className?: string;
}

export const AnimatedFollowButton: React.FC<AnimatedFollowButtonProps> = ({
  isFollowing,
  onToggle,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Button
        onClick={onToggle}
        className={`relative overflow-hidden transition-all duration-300 ${
          isFollowing 
            ? 'bg-green-500 hover:bg-red-500 text-white' 
            : 'bg-primary hover:bg-primary/80 text-primary-foreground'
        } ${className}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isFollowing ? 'following' : 'follow'}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: isFollowing ? 360 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isFollowing ? (
                <FaCheck className="w-4 h-4" />
              ) : (
                <FaUserPlus className="w-4 h-4" />
              )}
            </motion.div>
            <span>
              {isFollowing 
                ? (isHovered ? 'Unfollow' : 'Following')
                : 'Follow'
              }
            </span>
          </motion.div>
        </AnimatePresence>
      </Button>
    </motion.div>
  );
};