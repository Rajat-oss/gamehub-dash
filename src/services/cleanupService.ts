import { storyService } from './storyService';

export const cleanupService = {
  // Start automatic cleanup of expired stories
  startStoryCleanup() {
    // Run cleanup every hour
    const cleanup = async () => {
      try {
        await storyService.deleteExpiredStories();
        console.log('Expired stories cleaned up');
      } catch (error) {
        console.error('Error cleaning up expired stories:', error);
      }
    };

    // Run immediately
    cleanup();
    
    // Then run every hour
    const interval = setInterval(cleanup, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(interval);
  }
};