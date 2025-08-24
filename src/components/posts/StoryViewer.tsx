import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { storyService } from '@/services/storyService';
import { Story } from '@/types/story';
import { FaTimes, FaChevronLeft, FaChevronRight, FaTrash, FaEye, FaPlay, FaPause } from 'react-icons/fa';
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
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState<Array<{uid: string, username: string, photoURL?: string}>>([]);

  const currentStory = stories[currentIndex];
  const isOwnStory = currentStory?.userId === user?.uid;

  useEffect(() => {
    if (!isOpen || !currentStory) return;

    // Mark story as viewed
    if (user && !currentStory.views.includes(user.uid)) {
      storyService.viewStory(currentStory.id, user.uid);
    }

    // Load viewers for own stories
    if (isOwnStory && currentStory.views.length > 0) {
      storyService.getStoryViewers(currentStory.id).then(setViewers);
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
      <DialogContent className="bg-black border-none p-0 max-w-lg w-full h-[90vh] overflow-hidden">
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
          <div className="w-full h-full flex items-center justify-center">
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

          {/* Pause/Play indicator */}
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none">
              <div className="bg-black/50 rounded-full p-4">
                <FaPlay className="w-8 h-8 text-white" />
              </div>
            </div>
          )}

          {/* Navigation and pause areas */}
          <div className="absolute inset-0 flex z-10">
            <div className="w-1/3 h-full" onClick={prevStory} />
            <div className="w-1/3 h-full" onClick={() => setIsPaused(!isPaused)} />
            <div className="w-1/3 h-full" onClick={nextStory} />
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
              {isOwnStory ? (
                <button 
                  onClick={() => {
                    setShowViewers(true);
                    setIsPaused(true);
                  }}
                  className="flex items-center gap-2 text-white/90 text-sm hover:text-white transition-colors"
                >
                  <FaEye className="w-3 h-3" />
                  Views: {currentStory.views.length}
                </button>
              ) : (
                <p className="text-white/90 text-sm">
                  Views: {currentStory.views.length}
                </p>
              )}
              <div className="mt-1 text-xs text-white/70">
                Expires {formatDistanceToNow(currentStory.expiresAt, { addSuffix: true })}
              </div>
            </div>
          </div>

          {/* Viewers Modal */}
          {showViewers && (
            <div className="absolute inset-0 bg-black/80 z-30 flex items-end">
              <div className="w-full bg-black rounded-t-lg max-h-[60%] overflow-hidden">
                <div className="p-4 border-b border-white/20 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Viewers ({viewers.length})</h3>
                  <Button
                    onClick={() => {
                      setShowViewers(false);
                      setIsPaused(false);
                    }}
                    variant="ghost"
                    size="sm"
                    className="p-1 text-white hover:bg-white/20"
                  >
                    <FaTimes className="w-4 h-4" />
                  </Button>
                </div>
                <div className="overflow-y-auto max-h-80">
                  {viewers.map((viewer) => (
                    <div key={viewer.uid} className="flex items-center gap-3 p-3 hover:bg-white/10">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={viewer.photoURL} />
                        <AvatarFallback className="bg-gray-600 text-white">
                          {viewer.username.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-white">{viewer.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};