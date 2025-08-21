import { db } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc } from 'firebase/firestore';

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
}

// Create chat room ID
function getChatRoomId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
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