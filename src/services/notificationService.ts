import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  type: 'follow' | 'game_added' | 'review_posted' | 'game_favorited' | 'review_liked' | 'review_replied';
  title: string;
  message: string;
  fromUserId?: string;
  fromUsername?: string;
  fromUserAvatar?: string;
  gameId?: string;
  gameName?: string;
  gameImage?: string;
  rating?: number;
  reviewId?: string;
  replyText?: string;
  read: boolean;
  createdAt: Date;
}

const NOTIFICATIONS_COLLECTION = 'notifications';

export const notificationService = {
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<void> {
    try {
      await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        ...notification,
        createdAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('read', '==', false)
      );
      const querySnapshot = await getDocs(q);
      
      const updatePromises = querySnapshot.docs.map(docSnapshot =>
        updateDoc(docSnapshot.ref, { read: true })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  async deleteTestNotifications(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId),
        where('title', '==', 'Welcome!')
      );
      const querySnapshot = await getDocs(q);
      
      const deletePromises = querySnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting test notifications:', error);
    }
  },

  // Helper function to notify followers about game activities
  async notifyFollowersAboutGame(userId: string, username: string, userAvatar: string, gameId: string, gameName: string, gameImage: string, type: 'game_added' | 'game_favorited' | 'review_posted', rating?: number): Promise<void> {
    try {
      // Get user's followers
      const userDoc = await import('@/services/userService').then(m => m.userService.getUserProfile(userId));
      if (!userDoc || !userDoc.followers || userDoc.followers.length === 0) return;

      const notifications = userDoc.followers.map(followerId => {
        let title = '';
        let message = '';
        
        switch (type) {
          case 'game_added':
            title = 'New Game Added';
            message = `${username} added ${gameName} to their library`;
            break;
          case 'game_favorited':
            title = 'New Favorite Game';
            message = `${username} added ${gameName} to favorites`;
            break;
          case 'review_posted':
            title = 'New Review Posted';
            message = `${username} reviewed ${gameName}${rating ? ` (${rating}★)` : ''}`;
            break;
        }

        return this.createNotification({
          userId: followerId,
          type,
          title,
          message,
          fromUserId: userId,
          fromUsername: username,
          fromUserAvatar: userAvatar,
          gameId,
          gameName,
          gameImage,
          rating,
          read: false
        });
      });

      await Promise.all(notifications);
    } catch (error) {
      console.error('Error notifying followers:', error);
    }
  },

  // Notify when someone likes a review
  async notifyReviewLiked(reviewAuthorId: string, likerUserId: string, likerUsername: string, likerAvatar: string, gameId: string, gameName: string, gameImage: string): Promise<void> {
    if (reviewAuthorId === likerUserId) return; // Don't notify if user likes their own review
    
    try {
      await this.createNotification({
        userId: reviewAuthorId,
        type: 'review_liked',
        title: 'Review Liked',
        message: `${likerUsername} liked your review of ${gameName}`,
        fromUserId: likerUserId,
        fromUsername: likerUsername,
        fromUserAvatar: likerAvatar,
        gameId,
        gameName,
        gameImage,
        read: false
      });
    } catch (error) {
      console.error('Error creating review like notification:', error);
    }
  },

  // Notify when someone replies to a review
  async notifyReviewReplied(reviewAuthorId: string, replierUserId: string, replierUsername: string, replierAvatar: string, gameId: string, gameName: string, gameImage: string, replyText: string): Promise<void> {
    if (reviewAuthorId === replierUserId) return; // Don't notify if user replies to their own review
    
    try {
      await this.createNotification({
        userId: reviewAuthorId,
        type: 'review_replied',
        title: 'New Reply',
        message: `${replierUsername} replied to your review of ${gameName}`,
        fromUserId: replierUserId,
        fromUsername: replierUsername,
        fromUserAvatar: replierAvatar,
        gameId,
        gameName,
        gameImage,
        replyText: replyText.substring(0, 100) + (replyText.length > 100 ? '...' : ''),
        read: false
      });
    } catch (error) {
      console.error('Error creating review reply notification:', error);
    }
  }
};