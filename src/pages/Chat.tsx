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
      console.log('Other user typing status:', typing);
      setOtherUserTyping(typing);
    });

    return () => {
      // Clean up typing status when leaving chat
      if (isTyping) {
        setTypingStatus(user.uid, otherUserId, false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      unsubscribe();
      unsubscribeTyping();
    };
  }, [otherUserId, user]);

  useEffect(() => {
    if (messagesEndRef.current) {
      // Only smooth scroll for new messages, instant scroll for initial load
      const isInitialLoad = messages.length > 0 && !messagesEndRef.current.dataset.initialized;
      messagesEndRef.current.scrollIntoView({ 
        behavior: isInitialLoad ? 'auto' : 'smooth' 
      });
      if (isInitialLoad) {
        messagesEndRef.current.dataset.initialized = 'true';
      }
    }
  }, [messages, otherUserTyping]);

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
    if (value.trim()) {
      if (!isTyping) {
        setIsTyping(true);
        setTypingStatus(user.uid, otherUserId, true);
        console.log('Setting typing status to true');
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setTypingStatus(user.uid, otherUserId, false);
        console.log('Setting typing status to false');
      }, 2000);
    } else {
      // Stop typing immediately if input is empty
      if (isTyping) {
        setIsTyping(false);
        setTypingStatus(user.uid, otherUserId, false);
        console.log('Stopping typing - empty input');
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLastSeenStatus = () => {
    if (messages.length === 0) return 'Last seen recently';
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage.timestamp) return 'Last seen recently';
    
    const lastMessageDate = lastMessage.timestamp.toDate ? lastMessage.timestamp.toDate() : new Date(lastMessage.timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastMessageDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 5) return 'Active now';
    if (diffInMinutes < 60) return `Last seen ${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `Last seen ${Math.floor(diffInMinutes / 60)}h ago`;
    return `Last seen ${Math.floor(diffInMinutes / 1440)}d ago`;
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
      <div className="hidden sm:block">
        <Navbar onSearch={() => {}} />
      </div>
      
      <div className="flex h-screen sm:h-[calc(100vh-80px)]">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col w-full">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/inbox')}
                  className="p-1 sm:p-2 flex-shrink-0"
                >
                  <FaArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                  <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                  <AvatarFallback className="bg-blue-500 text-white text-sm">
                    {otherUserName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h1 className="font-semibold text-base sm:text-lg truncate">{otherUserName}</h1>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {otherUserTyping ? 'Typing...' : getLastSeenStatus()}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="p-1 sm:p-2 flex-shrink-0">
                <FaEllipsisV className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 px-3 sm:px-6 py-3 sm:py-4">
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
                    <div key={message.id} className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-3 sm:mt-4' : 'mt-1'}`}>
                      {!isOwn && (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                          {showAvatar ? (
                            <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                              <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                              <AvatarFallback className="bg-slate-300 text-slate-700 text-xs sm:text-sm">
                                {otherUserName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : null}
                        </div>
                      )}
                      
                      <div className={`max-w-[75%] sm:max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
                        <div className={`px-3 sm:px-4 py-2 rounded-2xl ${isOwn 
                          ? 'bg-blue-500 text-white rounded-br-md' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-md'
                        }`}>
                          <p className="text-sm leading-relaxed break-words">
                            {message.message}
                          </p>
                        </div>
                        {showAvatar && (
                          <div className={`flex items-center gap-1 mt-1 px-1 sm:px-2 ${
                            isOwn ? 'justify-end' : 'justify-start'
                          }`}>
                            <p className="text-xs text-slate-500">
                              {formatTime(message.timestamp)}
                            </p>
                            {isOwn && (
                              <span className="text-xs text-slate-400 ml-1">
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
                    <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                      <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                        <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                        <AvatarFallback className="bg-slate-300 text-slate-700 text-xs sm:text-sm">
                          {otherUserName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-md px-3 sm:px-4 py-2">
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
          <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-3 sm:px-6 py-3 sm:py-4">
            <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
              <Input
                value={newMessage}
                onChange={handleInputChange}
                placeholder={`Message ${otherUserName}...`}
                className="flex-1 rounded-full border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base py-2 sm:py-3"
                disabled={sending}
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || sending}
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 flex-shrink-0"
              >
                {sending ? (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaPaperPlane className="w-3 h-3 sm:w-4 sm:h-4" />
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