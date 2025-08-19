import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { FaStar, FaRegStar } from 'react-icons/fa';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  className,
  showLabel = false
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleMouseEnter = (starRating: number) => {
    if (!readonly) {
      setHoveredRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredRating(0);
    }
  };

  const displayRating = hoveredRating || rating;

  const getRatingLabel = (rating: number) => {
    if (rating === 0) return 'No rating';
    if (rating <= 1) return 'Poor';
    if (rating <= 2) return 'Fair';
    if (rating <= 3) return 'Good';
    if (rating <= 4) return 'Very Good';
    return 'Excellent';
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const StarIcon = isFilled ? FaStar : FaRegStar;
          
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={cn(
                'transition-colors duration-150',
                sizeClasses[size],
                !readonly && 'hover:scale-110 cursor-pointer',
                readonly && 'cursor-default',
                isFilled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
              )}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <StarIcon />
            </button>
          );
        })}
      </div>
      
      {showLabel && (
        <span className={cn(
          'text-muted-foreground ml-2',
          sizeClasses[size]
        )}>
          {getRatingLabel(rating)}
          {rating > 0 && (
            <span className="text-foreground font-medium ml-1">
              ({rating}/5)
            </span>
          )}
        </span>
      )}
    </div>
  );
};
