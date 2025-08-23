import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { PostComment, CreateCommentData } from '@/types/post';
import { notificationService } from './notificationService';

const COMMENTS_COLLECTION = 'postComments';
const GAME_COMMENTS_COLLECTION = 'gameComments';

export const commentService = {
  async addComment(
    postId: string,
    postAuthorId: string,
    userId: string,
    username: string,
    userPhotoURL: string | undefined,
    commentData: CreateCommentData
  ): Promise<void> {
    try {
      await addDoc(collection(db, COMMENTS_COLLECTION), {
        postId,
        userId,
        username,
        userPhotoURL: userPhotoURL || '',
        content: commentData.content,
        createdAt: serverTimestamp()
      });

      // Create notification for post author
      if (postAuthorId !== userId) {
        await notificationService.createNotification({
          userId: postAuthorId,
          type: 'post_commented',
          title: 'New Comment',
          message: `${username} commented on your post`,
          fromUserId: userId,
          fromUsername: username,
          fromUserAvatar: userPhotoURL || '',
          postId,
          read: false
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  subscribeToComments(postId: string, callback: (comments: PostComment[]) => void) {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as PostComment[];
      callback(comments);
    });
  },

  async getCommentCount(postId: string): Promise<number> {
    try {
      const q = query(
        collection(db, COMMENTS_COLLECTION),
        where('postId', '==', postId)
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting comment count:', error);
      return 0;
    }
  },

  // Game comment functions
  async addGameComment(
    gameId: string,
    userId: string,
    username: string,
    userPhotoURL: string | undefined,
    content: string,
    rating: number
  ): Promise<void> {
    try {
      await addDoc(collection(db, GAME_COMMENTS_COLLECTION), {
        gameId,
        userId,
        username,
        userPhotoURL: userPhotoURL || '',
        content,
        rating,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding game comment:', error);
      throw error;
    }
  },

  async getGameComments(gameId: string) {
    try {
      const q = query(
        collection(db, GAME_COMMENTS_COLLECTION),
        where('gameId', '==', gameId)
      );
      const snapshot = await getDocs(q);
      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      // Sort in memory to avoid index requirement
      return comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting game comments:', error);
      return [];
    }
  },

  async getGameAverageRating(gameId: string): Promise<number> {
    try {
      const q = query(
        collection(db, GAME_COMMENTS_COLLECTION),
        where('gameId', '==', gameId)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return 0;
      
      const ratings = snapshot.docs.map(doc => doc.data().rating || 0);
      const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
      return Math.round(average * 10) / 10;
    } catch (error) {
      console.error('Error getting game average rating:', error);
      return 0;
    }
  }
};