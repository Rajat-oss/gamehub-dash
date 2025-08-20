import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GameLog, GameLogInput, GameLogStats, GameStatus } from '@/types/gameLog';
import { userActivityService } from './userActivityService';
import { firestoreRateLimiter } from '@/utils/rateLimiter';
import { gameLogsCache } from '@/utils/cache';
import { withFirestoreErrorHandling } from '@/utils/firestoreErrorHandler';

const COLLECTION_NAME = 'gameLogs';

// Convert Firestore timestamp to Date
const timestampToDate = (timestamp: any): Date => {
  return timestamp?.toDate ? timestamp.toDate() : new Date();
};

// Convert GameLog document from Firestore
const convertGameLogDocument = (doc: any): GameLog => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    gameId: data.gameId,
    gameName: data.gameName,
    gameImageUrl: data.gameImageUrl,
    status: data.status,
    rating: data.rating,
    notes: data.notes,
    dateAdded: timestampToDate(data.dateAdded),
    dateUpdated: timestampToDate(data.dateUpdated),
    hoursPlayed: data.hoursPlayed,
    platform: data.platform,
    genre: data.genre,
  };
};

export const gameLogService = {
  // Add a new game log
  async addGameLog(userId: string, gameLogInput: GameLogInput, userName?: string): Promise<string> {
    const rateLimitKey = `gameLog_${userId}`;
    
    if (!firestoreRateLimiter.canMakeRequest(rateLimitKey)) {
      throw new Error('Too many requests. Please wait before adding another game.');
    }

    return withFirestoreErrorHandling(async () => {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...gameLogInput,
        userId,
        dateAdded: now,
        dateUpdated: now,
      });
      
      // Clear cache
      gameLogsCache.delete(`gameLogs_${userId}`);
      
      // Activity logging temporarily disabled to prevent infinite saves
      // if (userName) {
      //   try {
      //     await userActivityService.logGameAdded(
      //       userId, 
      //       userName, 
      //       gameLogInput.gameId, 
      //       gameLogInput.gameName, 
      //       gameLogInput.gameImageUrl
      //     );
      //   } catch (activityError) {
      //     console.warn('Failed to log activity:', activityError);
      //   }
      // }
      
      return docRef.id;
    });
  },

  // Update an existing game log
  async updateGameLog(logId: string, updates: Partial<GameLogInput>, userName?: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, logId);
      const existingDoc = await getDoc(docRef);
      const existingData = existingDoc.data();
      
      await updateDoc(docRef, {
        ...updates,
        dateUpdated: Timestamp.now(),
      });
      
      // Activity logging temporarily disabled to prevent infinite saves
      // if (userName && existingData) {
      //   // Status change
      //   if (updates.status && updates.status !== existingData.status) {
      //     await userActivityService.logGameStatusChanged(
      //       existingData.userId,
      //       userName,
      //       existingData.gameId,
      //       existingData.gameName,
      //       updates.status,
      //       existingData.gameImageUrl
      //     );
      //     
      //     // Special case for completion
      //     if (updates.status === 'completed') {
      //       await userActivityService.logGameCompleted(
      //         existingData.userId,
      //         userName,
      //         existingData.gameId,
      //         existingData.gameName,
      //         existingData.gameImageUrl,
      //         updates.rating || existingData.rating
      //       );
      //     }
      //   }
      //   
      //   // Rating change
      //   if (updates.rating && updates.rating !== existingData.rating) {
      //     await userActivityService.logGameRated(
      //       existingData.userId,
      //       userName,
      //       existingData.gameId,
      //       existingData.gameName,
      //       updates.rating,
      //       existingData.gameImageUrl
      //     );
      //   }
      // }
    } catch (error) {
      console.error('Error updating game log:', error);
      throw error;
    }
  },

  // Delete a game log
  async deleteGameLog(logId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, logId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting game log:', error);
      throw error;
    }
  },

  // Get all game logs for a user
  async getUserGameLogs(userId: string): Promise<GameLog[]> {
    const cacheKey = `gameLogs_${userId}`;
    
    // Check cache first
    const cached = gameLogsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    return withFirestoreErrorHandling(async () => {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('dateUpdated', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const gameLogs = querySnapshot.docs.map(convertGameLogDocument);
      
      // Cache the result
      gameLogsCache.set(cacheKey, gameLogs);
      
      return gameLogs;
    });
  },

  // Get game logs by status
  async getUserGameLogsByStatus(userId: string, status: GameStatus): Promise<GameLog[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('status', '==', status),
        orderBy('dateUpdated', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertGameLogDocument);
    } catch (error) {
      console.error('Error fetching game logs by status:', error);
      throw error;
    }
  },

  // Check if a game is already logged by user
  async isGameLogged(userId: string, gameId: string): Promise<GameLog | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('gameId', '==', gameId),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      return convertGameLogDocument(querySnapshot.docs[0]);
    } catch (error) {
      console.error('Error checking if game is logged:', error);
      throw error;
    }
  },

  // Get user game log statistics
  async getUserGameLogStats(userId: string): Promise<GameLogStats> {
    try {
      const gameLogs = await this.getUserGameLogs(userId);
      
      const stats: GameLogStats = {
        totalGames: gameLogs.length,
        completed: 0,
        playing: 0,
        wantToPlay: 0,
        onHold: 0,
        dropped: 0,
        averageRating: 0,
      };

      let totalRating = 0;
      let ratedGames = 0;

      gameLogs.forEach(log => {
        switch (log.status) {
          case 'completed':
            stats.completed++;
            break;
          case 'playing':
            stats.playing++;
            break;
          case 'want-to-play':
            stats.wantToPlay++;
            break;
          case 'on-hold':
            stats.onHold++;
            break;
          case 'dropped':
            stats.dropped++;
            break;
        }

        if (log.rating) {
          totalRating += log.rating;
          ratedGames++;
        }
      });

      stats.averageRating = ratedGames > 0 ? totalRating / ratedGames : 0;

      return stats;
    } catch (error) {
      console.error('Error fetching user game log stats:', error);
      throw error;
    }
  },

  // Get recently updated game logs
  async getRecentGameLogs(userId: string, limitCount: number = 5): Promise<GameLog[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('dateUpdated', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertGameLogDocument);
    } catch (error) {
      console.error('Error fetching recent game logs:', error);
      throw error;
    }
  }
};
