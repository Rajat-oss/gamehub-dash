import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { activityRateLimiter } from '@/utils/rateLimiter';
import { activitiesCache } from '@/utils/cache';
import { withFirestoreErrorHandling } from '@/utils/firestoreErrorHandler';

export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  type: ActivityType;
  gameId?: string;
  gameName?: string;
  gameImageUrl?: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export type ActivityType = 
  | 'game_added'
  | 'game_completed'
  | 'game_rated'
  | 'game_status_changed'
  | 'comment_posted'
  | 'game_requested'
  | 'achievement_unlocked';

export interface ActivityInput {
  userId: string;
  userName: string;
  type: ActivityType;
  gameId?: string;
  gameName?: string;
  gameImageUrl?: string;
  description: string;
  metadata?: Record<string, any>;
}

const ACTIVITIES_COLLECTION = 'userActivities';

// Convert Firestore timestamp to Date
const timestampToDate = (timestamp: any): Date => {
  return timestamp?.toDate ? timestamp.toDate() : new Date();
};

// Convert Activity document from Firestore
const convertActivityDocument = (doc: any): UserActivity => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    userName: data.userName,
    type: data.type,
    gameId: data.gameId,
    gameName: data.gameName,
    gameImageUrl: data.gameImageUrl,
    description: data.description,
    metadata: data.metadata,
    timestamp: timestampToDate(data.timestamp)
  };
};

export const userActivityService = {
  // Log a new activity
  async logActivity(activityInput: ActivityInput): Promise<string> {
    const rateLimitKey = `activity_${activityInput.userId}`;
    
    if (!activityRateLimiter.canMakeRequest(rateLimitKey)) {
      console.warn('Activity rate limit exceeded for user:', activityInput.userId);
      return 'rate-limited';
    }

    return withFirestoreErrorHandling(async () => {
      const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), {
        ...activityInput,
        timestamp: Timestamp.now()
      });
      
      // Clear relevant caches
      activitiesCache.delete(`activities_${activityInput.userId}`);
      activitiesCache.delete('recent_activities');
      
      return docRef.id;
    });
  },

  // Get user's activities
  async getUserActivities(userId: string, limitCount: number = 20): Promise<UserActivity[]> {
    const cacheKey = `activities_${userId}_${limitCount}`;
    
    // Check cache first
    const cached = activitiesCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    return withFirestoreErrorHandling(async () => {
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const activities = querySnapshot.docs.map(convertActivityDocument);
      
      // Cache the result
      activitiesCache.set(cacheKey, activities);
      
      return activities;
    });
  },

  // Get recent activities from all users (public feed)
  async getRecentActivities(limitCount: number = 50): Promise<UserActivity[]> {
    const cacheKey = `recent_activities_${limitCount}`;
    
    // Check cache first
    const cached = activitiesCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    return withFirestoreErrorHandling(async () => {
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      const activities = querySnapshot.docs.map(convertActivityDocument);
      
      // Cache the result
      activitiesCache.set(cacheKey, activities);
      
      return activities;
    });
  },

  // Get activities for a specific game
  async getGameActivities(gameId: string, limitCount: number = 20): Promise<UserActivity[]> {
    try {
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        where('gameId', '==', gameId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertActivityDocument);
    } catch (error) {
      console.error('Error fetching game activities:', error);
      throw error;
    }
  },

  // Helper functions to create specific activity types
  async logGameAdded(userId: string, userName: string, gameId: string, gameName: string, gameImageUrl?: string): Promise<void> {
    await this.logActivity({
      userId,
      userName,
      type: 'game_added',
      gameId,
      gameName,
      gameImageUrl,
      description: `Added ${gameName} to their library`
    });
  },

  async logGameCompleted(userId: string, userName: string, gameId: string, gameName: string, gameImageUrl?: string, rating?: number): Promise<void> {
    await this.logActivity({
      userId,
      userName,
      type: 'game_completed',
      gameId,
      gameName,
      gameImageUrl,
      description: `Completed ${gameName}${rating ? ` and rated it ${rating}/5 stars` : ''}`,
      metadata: { rating }
    });
  },

  async logGameRated(userId: string, userName: string, gameId: string, gameName: string, rating: number, gameImageUrl?: string): Promise<void> {
    await this.logActivity({
      userId,
      userName,
      type: 'game_rated',
      gameId,
      gameName,
      gameImageUrl,
      description: `Rated ${gameName} ${rating}/5 stars`,
      metadata: { rating }
    });
  },

  async logGameStatusChanged(userId: string, userName: string, gameId: string, gameName: string, newStatus: string, gameImageUrl?: string): Promise<void> {
    await this.logActivity({
      userId,
      userName,
      type: 'game_status_changed',
      gameId,
      gameName,
      gameImageUrl,
      description: `Changed ${gameName} status to ${newStatus}`,
      metadata: { newStatus }
    });
  },

  async logCommentPosted(userId: string, userName: string, gameId: string, gameName: string, gameImageUrl?: string): Promise<void> {
    await this.logActivity({
      userId,
      userName,
      type: 'comment_posted',
      gameId,
      gameName,
      gameImageUrl,
      description: `Posted a comment on ${gameName}`
    });
  },

  async logGameRequested(userId: string, userName: string, gameName: string): Promise<void> {
    await this.logActivity({
      userId,
      userName,
      type: 'game_requested',
      gameName,
      description: `Requested ${gameName} to be added to the platform`
    });
  }
};