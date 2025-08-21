export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  participantNames: { [uid: string]: string };
  participantAvatars: { [uid: string]: string };
  lastMessage?: ChatMessage;
  lastActivity: Date;
  unreadCount: { [uid: string]: number };
}