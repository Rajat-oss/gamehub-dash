import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { toast } from 'sonner';
import { FaUser, FaGamepad, FaHeart, FaStar } from 'react-icons/fa';

export const useNotificationListener = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    let isInitialLoad = true;
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Notification snapshot received, changes:', snapshot.docChanges().length);
      
      snapshot.docChanges().forEach((change) => {
        console.log('Change type:', change.type, 'Doc:', change.doc.data());
        
        if (change.type === 'added') {
          const data = change.doc.data();
          
          // Skip chat notifications
          if (data.type === 'chat_message') {
            return;
          }
          
          const notification = {
            id: change.doc.id,
            ...data,
            createdAt: data.createdAt.toDate()
          };

          console.log('Processing notification:', notification, 'Initial load:', isInitialLoad);

          // Skip initial load and only show toast for very recent notifications
          const isVeryRecent = Date.now() - notification.createdAt.getTime() < 5000; // 5 seconds
          
          if (!isInitialLoad && isVeryRecent) {
            console.log('Showing toast for new notification:', notification.title);
            showToastNotification(notification);
          }
        }
      });
      
      // After first snapshot, mark as no longer initial load
      if (isInitialLoad) {
        console.log('Initial load complete, will now show toasts for new notifications');
        isInitialLoad = false;
      }
    }, (error) => {
      console.error('Error in notification listener:', error);
    });

    return () => unsubscribe();
  }, [user]);
};

const showToastNotification = (notification: any) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return '👤';
      case 'game_favorited':
        return '❤️';
      case 'review_liked':
        return '👍';
      case 'review_replied':
        return '💬';
      case 'chat_message':
        return '💬';
      case 'post_liked':
        return '❤️';
      case 'post_commented':
        return '💬';
      default:
        return '🔔';
    }
  };

  // Show toast with sound for follow and chat notifications
  if (notification.type === 'follow' || notification.type === 'chat_message') {
    // Play notification sound (optional)
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors if sound fails
    } catch (e) {}
  }

  toast(notification.title, {
    description: notification.message,
    icon: getIcon(notification.type),
    action: {
      label: 'View',
      onClick: () => {
        if (notification.postId) {
          window.location.href = '/posts';
        } else if (notification.gameId) {
          window.location.href = `/game/${notification.gameId}`;
        } else if (notification.fromUsername) {
          window.location.href = `/user/${notification.fromUsername}`;
        } else {
          window.location.href = '/notifications';
        }
      }
    },
    duration: notification.type === 'follow' || notification.type === 'chat_message' ? 8000 : 5000,
    className: notification.type === 'follow' ? 'border-l-4 border-l-blue-500' : notification.type === 'chat_message' ? 'border-l-4 border-l-green-500' : notification.type === 'post_liked' ? 'border-l-4 border-l-red-500' : notification.type === 'post_commented' ? 'border-l-4 border-l-blue-500' : '',
  });
};