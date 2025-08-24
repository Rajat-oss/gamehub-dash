import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToChats } from '@/lib/chat';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const useChatUnreadCount = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Subscribe to all chat messages where user is receiver and message is unread
    const unsubscribes: (() => void)[] = [];

    const chatUnsubscribe = subscribeToChats(user.uid, (chats) => {
      // Clean up previous subscriptions
      unsubscribes.forEach(unsub => unsub());
      unsubscribes.length = 0;

      let totalUnread = 0;
      const chatCounts: { [key: string]: number } = {};

      chats.forEach(chat => {
        const otherUserId = chat.participants.find((p: string) => p !== user.uid);
        if (otherUserId) {
          const chatRoomId = [user.uid, otherUserId].sort().join('_');
          
          // Subscribe to unread messages in this chat
          const q = query(
            collection(db, `chats/${chatRoomId}/messages`),
            where('receiverId', '==', user.uid),
            where('read', '==', false)
          );

          const messageUnsubscribe = onSnapshot(q, (snapshot) => {
            const count = snapshot.size;
            chatCounts[otherUserId] = count;
            
            // Calculate total
            const total = Object.values(chatCounts).reduce((sum, count) => sum + count, 0);
            setUnreadCount(total);
          }, (error) => {
            console.error('Error getting unread count:', error);
            // Fallback: try to get count from localStorage
            const fallbackMessages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
            const unreadCount = fallbackMessages.filter((msg: any) => 
              msg.receiverId === user.uid && !msg.read
            ).length;
            setUnreadCount(unreadCount);
          });

          unsubscribes.push(messageUnsubscribe);
        }
      });
    });

    return () => {
      chatUnsubscribe();
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user]);

  return unreadCount;
};