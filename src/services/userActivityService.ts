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
    try {
      const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), {
        ...activityInput,
        timestamp: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  },

  // Get user's activities
  async getUserActivities(userId: string, limitCount: number = 20): Promise<UserActivity[]> {
    try {
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertActivityDocument);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  },

  // Get recent activities from all users (public feed)
  async getRecentActivities(limitCount: number = 50): Promise<UserActivity[]> {
    try {
      const q = query(
        collection(db, ACTIVITIES_COLLECTION),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertActivityDocument);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
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