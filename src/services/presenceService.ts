import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

export const presenceService = {
  // Set user as online
  async setUserOnline(userId: string): Promise<void> {
    try {
      console.log('Setting user online:', userId);
      await setDoc(doc(db, 'presence', userId), {
        online: true,
        lastSeen: serverTimestamp()
      });
      console.log('User set online successfully');
    } catch (error) {
      console.error('Error setting user online:', error);
    }
  },

  // Set user as offline
  async setUserOffline(userId: string): Promise<void> {
    try {
      await setDoc(doc(db, 'presence', userId), {
        online: false,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  },

  // Subscribe to user presence
  subscribeToPresence(userId: string, callback: (isOnline: boolean, lastSeen?: Date) => void) {
    return onSnapshot(doc(db, 'presence', userId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const lastSeen = data.lastSeen?.toDate();
        callback(data.online || false, lastSeen);
      } else {
        callback(false);
      }
    });
  },

  // Initialize presence tracking for current user
  initializePresence(userId: string): () => void {
    console.log('Initializing presence tracking for:', userId);
    
    // Set user online immediately
    this.setUserOnline(userId);

    // Throttle activity updates
    let lastActivity = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity > 5000) { // Only update every 5 seconds
        console.log('User activity detected, updating presence');
        this.setUserOnline(userId);
        lastActivity = now;
      }
    };

    // Listen for user activity
    document.addEventListener('click', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('scroll', handleActivity);
    window.addEventListener('focus', handleActivity);

    // Set user offline when page unloads
    const handleUnload = () => {
      console.log('Page unloading, setting user offline');
      this.setUserOffline(userId);
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    // Periodic online status update
    const interval = setInterval(() => {
      console.log('Periodic presence update');
      this.setUserOnline(userId);
    }, 30000); // Update every 30 seconds

    // Cleanup function
    return () => {
      console.log('Cleaning up presence tracking');
      document.removeEventListener('click', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('scroll', handleActivity);
      window.removeEventListener('focus', handleActivity);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      clearInterval(interval);
      this.setUserOffline(userId);
    };
  }
};