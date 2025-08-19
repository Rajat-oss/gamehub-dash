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
  limit,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { userActivityService } from './userActivityService';
import { commentRateLimiter, firestoreRateLimiter } from '@/utils/rateLimiter';
import { commentsCache, ratingsCache } from '@/utils/cache';
import { withFirestoreErrorHandling } from '@/utils/firestoreErrorHandler';

export interface Comment {
  id: string;
  gameId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  rating?: number;
  timestamp: Date;
  replies: Reply[];
  likes: number;
  likedBy: string[];
}

export interface Reply {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  timestamp: Date;
  likes: number;
  likedBy: string[];
}

export interface CommentInput {
  gameId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  rating?: number;
}

export interface ReplyInput {
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
}

const COMMENTS_COLLECTION = 'gameComments';

// Convert Firestore timestamp to Date
const timestampToDate = (timestamp: any): Date => {
  return timestamp?.toDate ? timestamp.toDate() : new Date();
};

// Convert Comment document from Firestore
const convertCommentDocument = (doc: any): Comment => {
  const data = doc.data();
  return {
    id: doc.id,
    gameId: data.gameId,
    userId: data.userId,
    userName: data.userName,
    userAvatar: data.userAvatar,
    comment: data.comment,
    rating: data.rating,
    timestamp: timestampToDate(data.timestamp),
    replies: data.replies?.map((reply: any) => ({
      ...reply,
      timestamp: timestampToDate(reply.timestamp)
    })) || [],
    likes: data.likes || 0,
    likedBy: data.likedBy || []
  };
};

export const commentService = {
  // Add a new comment
  async addComment(commentInput: CommentInput): Promise<string> {
    const rateLimitKey = `comment_${commentInput.userId}`;
    
    if (!commentRateLimiter.canMakeRequest(rateLimitKey)) {
      throw new Error('Too many comments. Please wait before posting again.');
    }

    return withFirestoreErrorHandling(async () => {
      const data = {
        gameId: commentInput.gameId,
        userId: commentInput.userId,
        userName: commentInput.userName,
        comment: commentInput.comment,
        timestamp: Timestamp.now(),
        replies: [],
        likes: 0,
        likedBy: []
      };
      
      // Only add rating if it exists and is not undefined
      if (commentInput.rating && commentInput.rating > 0) {
        data.rating = commentInput.rating;
      }
      
      // Only add userAvatar if it exists
      if (commentInput.userAvatar) {
        data.userAvatar = commentInput.userAvatar;
      }
      
      const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), data);
      
      // Clear cache for this game
      commentsCache.delete(`comments_${commentInput.gameId}`);
      ratingsCache.delete(`rating_${commentInput.gameId}`);
      
      // Log activity (with rate limiting)
      try {
        await userActivityService.logCommentPosted(
          commentInput.userId,
          commentInput.userName,
          commentInput.gameId,
          'a game',
          commentInput.userAvatar
        );
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }
      
      return docRef.id;
    });
  },

  // Get comments for a game
  async getGameComments(gameId: string): Promise<Comment[]> {
    const cacheKey = `comments_${gameId}`;
    
    // Check cache first
    const cached = commentsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    return withFirestoreErrorHandling(async () => {
      const q = query(
        collection(db, COMMENTS_COLLECTION),
        where('gameId', '==', gameId)
      );
      const querySnapshot = await getDocs(q);
      const comments = querySnapshot.docs.map(convertCommentDocument);
      
      // Cache the result
      commentsCache.set(cacheKey, comments);
      
      return comments;
    });
  },

  // Add a reply to a comment
  async addReply(commentId: string, replyInput: ReplyInput): Promise<void> {
    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      const newReply = {
        id: Date.now().toString(),
        ...replyInput,
        timestamp: Timestamp.now(),
        likes: 0,
        likedBy: []
      };
      
      await updateDoc(commentRef, {
        replies: arrayUnion(newReply)
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  },

  // Like/unlike a comment
  async toggleCommentLike(commentId: string, userId: string): Promise<void> {
    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (commentDoc.exists()) {
        const data = commentDoc.data();
        const likedBy = data.likedBy || [];
        const isLiked = likedBy.includes(userId);
        
        if (isLiked) {
          // Unlike
          await updateDoc(commentRef, {
            likes: increment(-1),
            likedBy: likedBy.filter((id: string) => id !== userId)
          });
        } else {
          // Like
          await updateDoc(commentRef, {
            likes: increment(1),
            likedBy: arrayUnion(userId)
          });
        }
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      const commentDoc = await getDoc(commentRef);
      
      if (commentDoc.exists() && commentDoc.data().userId === userId) {
        await deleteDoc(commentRef);
      } else {
        throw new Error('Unauthorized to delete this comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Get average rating for a game
  async getGameAverageRating(gameId: string): Promise<{ average: number; count: number }> {
    const cacheKey = `rating_${gameId}`;
    
    // Check cache first
    const cached = ratingsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    return withFirestoreErrorHandling(async () => {
      const comments = await this.getGameComments(gameId);
      const ratingsOnly = comments.filter(c => c.rating).map(c => c.rating!);
      
      const result = ratingsOnly.length === 0 
        ? { average: 0, count: 0 }
        : {
            average: Math.round((ratingsOnly.reduce((acc, rating) => acc + rating, 0) / ratingsOnly.length) * 10) / 10,
            count: ratingsOnly.length
          };
      
      // Cache the result
      ratingsCache.set(cacheKey, result);
      
      return result;
    });
  },

  // Get user's comments
  async getUserComments(userId: string, limitCount: number = 10): Promise<Comment[]> {
    try {
      const q = query(
        collection(db, COMMENTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertCommentDocument);
    } catch (error) {
      console.error('Error fetching user comments:', error);
      throw error;
    }
  }
};