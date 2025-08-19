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
    replies: (data.replies || []).map((reply: any) => ({
      id: reply.id,
      userId: reply.userId,
      userName: reply.userName,
      userAvatar: reply.userAvatar,
      comment: reply.comment,
      timestamp: timestampToDate(reply.timestamp),
      likes: reply.likes || 0,
      likedBy: reply.likedBy || []
    })),
    likes: data.likes || 0,
    likedBy: data.likedBy || []
  };
};

export const commentService = {
  // Add a new comment
  async addComment(commentInput: CommentInput): Promise<string> {
    try {
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
      
      // Log activity
      await userActivityService.logCommentPosted(
        commentInput.userId,
        commentInput.userName,
        commentInput.gameId,
        'a game', // We could pass the actual game name if available
        commentInput.userAvatar
      );
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Get comments for a game
  async getGameComments(gameId: string): Promise<Comment[]> {
    try {
      const q = query(
        collection(db, COMMENTS_COLLECTION),
        where('gameId', '==', gameId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(convertCommentDocument);
    } catch (error) {
      console.error('Error fetching game comments:', error);
      throw error;
    }
  },

  // Add a reply to a comment
  async addReply(commentId: string, replyInput: ReplyInput): Promise<void> {
    try {
      const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
      
      const newReply = {
        id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: replyInput.userId,
        userName: replyInput.userName,
        userAvatar: replyInput.userAvatar || '',
        comment: replyInput.comment,
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
    try {
      const comments = await this.getGameComments(gameId);
      const ratingsOnly = comments.filter(c => c.rating).map(c => c.rating!);
      
      if (ratingsOnly.length === 0) {
        return { average: 0, count: 0 };
      }
      
      const sum = ratingsOnly.reduce((acc, rating) => acc + rating, 0);
      const average = Math.round((sum / ratingsOnly.length) * 10) / 10;
      
      return { average, count: ratingsOnly.length };
    } catch (error) {
      console.error('Error calculating average rating:', error);
      throw error;
    }
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