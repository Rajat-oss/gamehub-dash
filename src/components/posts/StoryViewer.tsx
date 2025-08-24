import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { storyService } from '@/services/storyService';
import { Story } from '@/types/story';
import { FaTimes, FaChevronLeft, FaChevronRight, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  initialStoryIndex: number;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ 
  isOpen, 
  onClose, 
  stories, 
  initialStoryIndex 
}) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = stories[currentIndex];
  const isOwnStory = currentStory?.userId === user?.uid;

  useEffect(() => {
    if (!isOpen || !currentStory) return;

    // Mark story as viewed
    if (user && !currentStory.views.includes(user.uid)) {
      storyService.viewStory(currentStory.id, user.uid);
    }

    // Auto-progress timer
    const duration = currentStory.mediaType === 'video' ? 15000 : 5000; // 15s for video, 5s for image
    let startTime = Date.now();
    
    const timer = setInterval(() => {
      if (isPaused) return;
      
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / duration) * 100;
      
      if (newProgress >= 100) {
        nextStory();
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, isOpen, currentStory]);

  useEffect(() => {
    setCurrentIndex(initialStoryIndex);
    setProgress(0);
  }, [initialStoryIndex, isOpen]);

  const nextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const deleteStory = async () => {
    if (!currentStory || !isOwnStory) return;
    
    if (window.confirm('Delete this story?')) {
      try {
        await storyService.deleteStory(currentStory.id);
        toast.success('Story deleted');
        onClose();
      } catch (error) {
        toast.error('Failed to delete story');
      }
    }
  };

  if (!currentStory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-none p-0 max-w-md w-full h-[80vh] overflow-hidden">
        <div className="relative w-full h-full">
          {/* Progress bars */}
          <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
            {stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-100"
                  style={{ 
                    width: index < currentIndex ? '100%' : 
                           index === currentIndex ? `${progress}%` : '0%' 
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 left-4 right-4 z-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 border border-white/50">
                <AvatarImage src={currentStory.userPhotoURL} />
                <AvatarFallback className="bg-white text-black text-xs">
                  {currentStory.username.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-medium text-sm">{currentStory.username}</p>
                <p className="text-white/70 text-xs">
                  {formatDistanceToNow(currentStory.createdAt, { addSuffix: true })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isOwnStory && (
                <Button
                  onClick={deleteStory}
                  variant="ghost"
                  size="sm"
                  className="p-2 text-white hover:bg-white/20"
                >
                  <FaTrash className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="p-2 text-white hover:bg-white/20"
              >
                <FaTimes className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Story content */}
          <div 
            className="w-full h-full flex items-center justify-center"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStory.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                {currentStory.mediaType === 'image' ? (
                  <img
                    src={currentStory.mediaUrl}
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={currentStory.mediaUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="absolute inset-0 flex">
            {/* Previous area */}
            <div 
              className="flex-1 cursor-pointer"
              onClick={prevStory}
            />
            {/* Next area */}
            <div 
              className="flex-1 cursor-pointer"
              onClick={nextStory}
            />
          </div>

          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <Button
              onClick={prevStory}
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/20 z-10"
            >
              <FaChevronLeft className="w-4 h-4" />
            </Button>
          )}
          
          {currentIndex < stories.length - 1 && (
            <Button
              onClick={nextStory}
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/20 z-10"
            >
              <FaChevronRight className="w-4 h-4" />
            </Button>
          )}

          {/* Story info */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="bg-black/50 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-white/90 text-sm">
                Views: {currentStory.views.length}
              </p>
              <div className="mt-1 text-xs text-white/70">
                Expires {formatDistanceToNow(currentStory.expiresAt, { addSuffix: true })}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};