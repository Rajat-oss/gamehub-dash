import { storyService } from './storyService';
import { notificationService } from './notificationService';

export const cleanupService = {
  // Start automatic cleanup of expired stories and old notifications
  startStoryCleanup() {
    const cleanup = async () => {
      try {
        const { auth } = await import('@/lib/firebase');
        if (!auth.currentUser?.emailVerified) return;
        
        await storyService.deleteExpiredStories();
        await notificationService.deleteOldNotifications();
      } catch (error) {
        // Silently ignore all errors during cleanup
      }
    };

    const interval = setInterval(cleanup, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }
};