import { db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, updateDoc, where, getDocs } from 'firebase/firestore';
import { notificationService } from '@/services/notificationService';
import { userService } from '@/services/userService';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  message: string;
  timestamp: any;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  participantNames: { [key: string]: string };
  lastMessage: string;
  lastMessageTime: any;
  [key: string]: any; // For typing status fields
}

// Create chat room ID
function getChatRoomId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}

// Set typing status
export async function setTypingStatus(userId1: string, userId2: string, isTyping: boolean): Promise<void> {
  try {
    const chatRoomId = getChatRoomId(userId1, userId2);
    console.log('Setting typing status:', { chatRoomId, userId1, isTyping });
    await setDoc(doc(db, 'chats', chatRoomId), {
      [`typing_${userId1}`]: isTyping ? serverTimestamp() : null
    }, { merge: true });
    console.log('Typing status set successfully');
  } catch (error) {
    console.error('Error setting typing status:', error);
  }
}

// Mark messages as seen
export async function markMessagesAsSeen(userId1: string, userId2: string, currentUserId: string): Promise<void> {
  try {
    const chatRoomId = getChatRoomId(userId1, userId2);
    const messagesRef = collection(db, `chats/${chatRoomId}/messages`);
    const q = query(messagesRef, where('receiverId', '==', currentUserId), where('read', '==', false));
    
    const snapshot = await getDocs(q);
    console.log('Marking messages as seen:', snapshot.docs.length, 'messages');
    
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );
    
    await Promise.all(updatePromises);
    console.log('Messages marked as seen successfully');
  } catch (error) {
    console.error('Error marking messages as seen:', error);
  }
}

// Send a message
export async function sendMessage(receiverId: string, receiverName: string, senderId: string, senderName: string, message: string): Promise<void> {
  try {
    const chatRoomId = getChatRoomId(senderId, receiverId);
    
    // Add message to specific chat room collection
    await addDoc(collection(db, `chats/${chatRoomId}/messages`), {
      senderId,
      receiverId,
      senderName,
      receiverName,
      message,
      timestamp: serverTimestamp(),
      read: false
    });
    
    // Update chat room metadata
    await setDoc(doc(db, 'chats', chatRoomId), {
      participants: [senderId, receiverId],
      participantNames: {
        [senderId]: senderName,
        [receiverId]: receiverName
      },
      lastMessage: message,
      lastMessageTime: serverTimestamp()
    }, { merge: true });
    
    // Create notification for the receiver
    try {
      const senderProfile = await userService.getUserProfile(senderId);
      await notificationService.notifyChatMessage(
        receiverId,
        senderId,
        senderProfile?.username || senderName,
        senderProfile?.photoURL || '',
        message
      );
    } catch (notifError) {
      console.error('Error creating chat notification:', notifError);
    }
    
  } catch (error) {
    console.error('Error sending message:', error);
    // Fallback to localStorage if Firebase fails
    const messages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
    messages.push({
      id: Date.now().toString(),
      senderId,
      receiverId,
      senderName,
      receiverName,
      message,
      timestamp: Date.now(),
      read: false
    });
    localStorage.setItem('chat_messages', JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent('chatUpdate'));
  }
}

// Subscribe to messages between two users
export function subscribeToMessages(userId1: string, userId2: string, callback: (messages: Message[]) => void) {
  const chatRoomId = getChatRoomId(userId1, userId2);
  
  try {
    const q = query(
      collection(db, `chats/${chatRoomId}/messages`),
      orderBy('timestamp', 'asc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message);
      });
      callback(messages);
    }, (error) => {
      console.error('Firebase error, using localStorage:', error);
      // Fallback to localStorage
      const fallbackMessages = JSON.parse(localStorage.getItem('chat_messages') || '[]')
        .filter((msg: Message) => 
          (msg.senderId === userId1 && msg.receiverId === userId2) ||
          (msg.senderId === userId2 && msg.receiverId === userId1)
        );
      callback(fallbackMessages);
      
      // Listen for localStorage updates
      const handleUpdate = () => {
        const updatedMessages = JSON.parse(localStorage.getItem('chat_messages') || '[]')
          .filter((msg: Message) => 
            (msg.senderId === userId1 && msg.receiverId === userId2) ||
            (msg.senderId === userId2 && msg.receiverId === userId1)
          );
        callback(updatedMessages);
      };
      
      window.addEventListener('chatUpdate', handleUpdate);
      return () => window.removeEventListener('chatUpdate', handleUpdate);
    });
  } catch (error) {
    console.error('Error setting up subscription:', error);
    return () => {};
  }
}

// Subscribe to user's chat rooms
export function subscribeToChats(userId: string, callback: (chats: ChatRoom[]) => void) {
  try {
    const q = query(
      collection(db, 'chats'),
      orderBy('lastMessageTime', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const chats: ChatRoom[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants && data.participants.includes(userId)) {
          chats.push({ id: doc.id, ...data } as ChatRoom);
        }
      });
      callback(chats);
    }, (error) => {
      console.error('Firebase error in chats:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up chats subscription:', error);
    return () => {};
  }
}

// Subscribe to typing status
export function subscribeToTypingStatus(currentUserId: string, otherUserId: string, callback: (isTyping: boolean) => void) {
  try {
    const chatRoomId = getChatRoomId(currentUserId, otherUserId);
    console.log('Subscribing to typing status:', { chatRoomId, currentUserId, otherUserId });
    
    return onSnapshot(doc(db, 'chats', chatRoomId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const typingKey = `typing_${otherUserId}`;
        const typingTimestamp = data[typingKey];
        
        console.log('Typing status data:', { typingKey, typingTimestamp, data });
        
        if (typingTimestamp) {
          const now = Date.now();
          const typingTime = typingTimestamp.toDate ? typingTimestamp.toDate().getTime() : typingTimestamp;
          const isRecentlyTyping = now - typingTime < 3000; // 3 seconds
          console.log('Typing check:', { now, typingTime, isRecentlyTyping });
          callback(isRecentlyTyping);
        } else {
          callback(false);
        }
      } else {
        console.log('Chat room does not exist yet');
        callback(false);
      }
    }, (error) => {
      console.error('Error subscribing to typing status:', error);
      callback(false);
    });
  } catch (error) {
    console.error('Error setting up typing subscription:', error);
    return () => {};
  }
}