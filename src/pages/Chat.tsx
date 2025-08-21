import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, subscribeToMessages, setTypingStatus, markMessagesAsSeen, subscribeToTypingStatus } from '@/lib/chat';
import { userService } from '@/services/userService';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FaArrowLeft, FaPaperPlane, FaEllipsisV } from 'react-icons/fa';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  message: string;
  timestamp: any;
  read: boolean;
}

const Chat: React.FC = () => {
  const { userId: otherUserId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserName, setOtherUserName] = useState('User');
  const [otherUserPhoto, setOtherUserPhoto] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!otherUserId || !user) return;

    const loadOtherUser = async () => {
      try {
        const otherUserProfile = await userService.getUserProfile(otherUserId);
        setOtherUserName(otherUserProfile?.username || 'User');
        setOtherUserPhoto(otherUserProfile?.photoURL || '');
      } catch (error) {
        console.error('Error loading other user:', error);
      }
    };

    loadOtherUser();

    const unsubscribe = subscribeToMessages(user.uid, otherUserId, (chatMessages) => {
      setMessages(chatMessages);
      setLoading(false);
      
      // Mark messages as seen
      if (chatMessages.length > 0) {
        markMessagesAsSeen(user.uid, otherUserId, user.uid);
      }
    });

    // Subscribe to typing status
    const unsubscribeTyping = subscribeToTypingStatus(user.uid, otherUserId, (typing) => {
      setOtherUserTyping(typing);
    });

    return () => {
      unsubscribe();
      unsubscribeTyping();
    };
  }, [otherUserId, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUserId || !user || sending) return;

    setSending(true);
    // Stop typing when sending
    setTypingStatus(user.uid, otherUserId, false);
    setIsTyping(false);
    
    try {
      await sendMessage(
        otherUserId,
        otherUserName,
        user.uid,
        user.displayName || 'User',
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    if (!otherUserId || !user) return;
    
    // Set typing status
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      setTypingStatus(user.uid, otherUserId, true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTypingStatus(user.uid, otherUserId, false);
    }, 2000);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">Please log in to view messages.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar onSearch={() => {}} />
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/inbox')}
                  className="p-2"
                >
                  <FaArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {otherUserName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-semibold text-lg">{otherUserName}</h1>
                  <p className="text-sm text-slate-500">
                    {otherUserTyping ? 'Typing...' : 'Active now'}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="p-2">
                <FaEllipsisV className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 px-6 py-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'justify-end'}`}>
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-12 w-48 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-1">
                {messages.map((message, index) => {
                  const isOwn = message.senderId === user.uid;
                  const prevMessage = messages[index - 1];
                  const nextMessage = messages[index + 1];
                  const showAvatar = !nextMessage || nextMessage.senderId !== message.senderId;
                  const isFirstInGroup = !prevMessage || prevMessage.senderId !== message.senderId;
                  
                  return (
                    <div key={message.id} className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-4' : 'mt-1'}`}>
                      {!isOwn && (
                        <div className="w-8 h-8 flex-shrink-0">
                          {showAvatar ? (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                              <AvatarFallback className="bg-slate-300 text-slate-700 text-sm">
                                {otherUserName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : null}
                        </div>
                      )}
                      
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
                        <div className={`px-4 py-2 rounded-2xl ${isOwn 
                          ? 'bg-blue-500 text-white rounded-br-md' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-md'
                        }`}>
                          <p className="text-sm leading-relaxed break-words">
                            {message.message}
                          </p>
                        </div>
                        {showAvatar && (
                          <div className={`flex items-center gap-1 mt-1 px-2 ${
                            isOwn ? 'justify-end' : 'justify-start'
                          }`}>
                            <p className="text-xs text-slate-500">
                              {formatTime(message.timestamp)}
                            </p>
                            {isOwn && (
                              <span className="text-xs text-slate-400">
                                {message.read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {otherUserTyping && (
                  <div className="flex gap-2 justify-start mt-2">
                    <div className="w-8 h-8 flex-shrink-0">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                        <AvatarFallback className="bg-slate-300 text-slate-700 text-sm">
                          {otherUserName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                      <AvatarFallback>{otherUserName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-lg font-medium mb-2">No messages yet</p>
                  <p className="text-sm">Start a conversation with {otherUserName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <Input
                value={newMessage}
                onChange={handleInputChange}
                placeholder={`Message ${otherUserName}...`}
                className="flex-1 rounded-full border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={sending}
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || sending}
                className="rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaPaperPlane className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;