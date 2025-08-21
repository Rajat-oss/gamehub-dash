import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { Chat, ChatMessage } from '@/types/chat';

const CHATS_COLLECTION = 'chats';
const MESSAGES_COLLECTION = 'messages';

export const chatService = {
  // Create or get existing chat between two users
  async createOrGetChat(userId1: string, userId2: string, user1Name: string, user2Name: string): Promise<string> {
    const participants = [userId1, userId2].sort();
    
    // Check if chat already exists
    const q = query(
      collection(db, CHATS_COLLECTION),
      where('participants', '==', participants)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    
    // Create new chat
    const chatDoc = await addDoc(collection(db, CHATS_COLLECTION), {
      participants,
      participantNames: {
        [userId1]: user1Name,
        [userId2]: user2Name
      },
      participantAvatars: {},
      lastActivity: serverTimestamp(),
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0
      }
    });
    
    return chatDoc.id;
  },

  // Send a message
  async sendMessage(chatId: string, senderId: string, senderName: string, content: string): Promise<void> {
    // Add message
    await addDoc(collection(db, MESSAGES_COLLECTION), {
      chatId,
      senderId,
      senderName,
      content,
      timestamp: serverTimestamp(),
      read: false
    });

    // Update chat last activity
    try {
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      await updateDoc(chatRef, {
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  },

  // Get user's chats
  getUserChats(userId: string, callback: (chats: Chat[]) => void): () => void {
    const q = query(
      collection(db, CHATS_COLLECTION),
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const chats: Chat[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          participants: data.participants || [],
          participantNames: data.participantNames || {},
          participantAvatars: data.participantAvatars || {},
          lastActivity: data.lastActivity?.toDate() || new Date(),
          unreadCount: data.unreadCount || {}
        };
      }).sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
      
      callback(chats);
    }, (error) => {
      console.error('Error getting chats:', error);
      callback([]);
    });
  },

  // Get messages for a chat
  getChatMessages(chatId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('chatId', '==', chatId)
    );

    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          chatId: data.chatId,
          senderId: data.senderId,
          senderName: data.senderName,
          content: data.content,
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false
        };
      }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      callback(messages);
    }, (error) => {
      console.error('Error getting messages:', error);
      callback([]);
    });
  },

  // Mark messages as read
  async markAsRead(chatId: string, userId: string): Promise<void> {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 0
    });
  }
};