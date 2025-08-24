import { storyService } from './storyService';
import { notificationService } from './notificationService';

export const cleanupService = {
  // Start automatic cleanup of expired stories and old notifications
  startStoryCleanup() {
    // Run cleanup every hour
    const cleanup = async () => {
      try {
        await storyService.deleteExpiredStories();
        await notificationService.deleteOldNotifications();
        console.log('Expired stories and old notifications cleaned up');
      } catch (error) {
        console.error('Error cleaning up expired content:', error);
      }
    };

    // Run immediately
    cleanup();
    
    // Then run every hour
    const interval = setInterval(cleanup, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(interval);
  }
};