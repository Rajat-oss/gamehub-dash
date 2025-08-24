import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { storyService } from '@/services/storyService';
import { Story } from '@/types/story';
import { FaTimes, FaChevronLeft, FaChevronRight, FaTrash, FaEye, FaPlay } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  stories: Story[];
  initialStoryIndex: number;
}

const STORY_DURATION = { image: 5000, video: 15000 };

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

  const nextStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const prevStory = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  const togglePause = useCallback(() => setIsPaused(prev => !prev), []);

  const deleteStory = useCallback(async () => {
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
  }, [currentStory, isOwnStory, onClose]);

  const showViewersModal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowViewers(true);
    setIsPaused(true);
  }, []);

  const hideViewersModal = useCallback(() => {
    setShowViewers(false);
    setIsPaused(false);
  }, []);

  // Initialize story and handle viewing
  useEffect(() => {
    if (!isOpen || !currentStory) return;

    if (user && !currentStory.views.includes(user.uid) && !isOwnStory) {
      storyService.viewStory(currentStory.id, user.uid);
    }

    if (isOwnStory) {
      storyService.getStoryViewers(currentStory.id).then(setViewers);
    } else {
      setViewers([]);
    }
  }, [currentIndex, isOpen, currentStory, user, isOwnStory]);

  // Auto-progress timer
  useEffect(() => {
    if (!isOpen || !currentStory || isPaused) return;

    const duration = STORY_DURATION[currentStory.mediaType];
    let startTime = Date.now();
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / duration) * 100;
      
      if (newProgress >= 100) {
        nextStory();
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [currentIndex, isPaused, isOpen, currentStory, nextStory]);

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialStoryIndex);
      setProgress(0);
      setIsPaused(false);
      setShowViewers(false);
    }
  }, [initialStoryIndex, isOpen]);

  if (!currentStory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-none p-0 max-w-lg w-full h-[85vh] overflow-hidden">
        <div className="relative w-full h-full">
          {/* Progress Indicators */}
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
                <Button onClick={showViewersModal} variant="ghost" size="sm" className="p-2 text-white hover:bg-white/20">
                  <FaEye className="w-4 h-4" />
                </Button>
              )}
              {isOwnStory && (
                <Button onClick={deleteStory} variant="ghost" size="sm" className="p-2 text-white hover:bg-white/20">
                  <FaTrash className="w-4 h-4" />
                </Button>
              )}
              <Button onClick={onClose} variant="ghost" size="sm" className="p-2 text-white hover:bg-white/20">
                <FaTimes className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Story Content */}
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
                  <img src={currentStory.mediaUrl} alt="Story" className="w-full h-full object-cover" />
                ) : (
                  <video src={currentStory.mediaUrl} className="w-full h-full object-cover" autoPlay muted loop />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pause Indicator */}
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none">
              <div className="bg-black/50 rounded-full p-4">
                <FaPlay className="w-8 h-8 text-white" />
              </div>
            </div>
          )}

          {/* Touch Areas */}
          <div className="absolute inset-0 flex z-10">
            <div className="w-1/3 h-full" onClick={prevStory} />
            <div className="w-1/3 h-full" onClick={togglePause} />
            <div className="w-1/3 h-full" onClick={nextStory} />
          </div>

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <Button onClick={prevStory} variant="ghost" size="sm" className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/20 z-10">
              <FaChevronLeft className="w-4 h-4" />
            </Button>
          )}
          
          {currentIndex < stories.length - 1 && (
            <Button onClick={nextStory} variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/20 z-10">
              <FaChevronRight className="w-4 h-4" />
            </Button>
          )}

          {/* Story Info */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="bg-black/50 rounded-lg p-2 backdrop-blur-sm">
              <div className="text-xs text-white/70 text-center">
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
                  <Button onClick={hideViewersModal} variant="ghost" size="sm" className="p-1 text-white hover:bg-white/20">
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