import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, subscribeToMessages, setTypingStatus, markMessagesAsSeen, subscribeToTypingStatus } from '@/lib/chat';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { userService } from '@/services/userService';
import { aiChatService, AIMessage } from '@/services/aiChatService';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FaArrowLeft, FaPaperPlane, FaEllipsisV, FaRobot, FaImage, FaTimes, FaTrash } from 'react-icons/fa';
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
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserName, setOtherUserName] = useState('User');
  const [otherUserPhoto, setOtherUserPhoto] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isAIChat, setIsAIChat] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [otherUserActive, setOtherUserActive] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  // Simple presence tracking
  useEffect(() => {
    if (!user) return;

    // Set current user as active immediately
    const setActive = async () => {
      try {
        await setDoc(doc(db, 'userStatus', user.uid), {
          online: true,
          lastActive: serverTimestamp()
        });
        console.log('Set user active:', user.uid);
      } catch (error) {
        console.error('Error setting active:', error);
      }
    };

    setActive();

    // Update every 10 seconds while active
    const interval = setInterval(setActive, 10000);

    // Set offline on page unload
    const setOffline = async () => {
      try {
        await setDoc(doc(db, 'userStatus', user.uid), {
          online: false,
          lastActive: serverTimestamp()
        });
      } catch (error) {
        console.error('Error setting offline:', error);
      }
    };

    window.addEventListener('beforeunload', setOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', setOffline);
      setOffline();
    };
  }, [user]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    if (!otherUserId || !user) return;

    // Check if this is an AI chat
    if (otherUserId === 'ai-assistant') {
      setIsAIChat(true);
      setOtherUserName('AI Gaming Assistant');
      setOtherUserPhoto('');
      setLoading(false);

      // Load AI messages from localStorage
      const savedAiMessages = localStorage.getItem(`ai_chat_${user.uid}`);
      if (savedAiMessages) {
        const parsedMessages = JSON.parse(savedAiMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setAiMessages(parsedMessages);
      } else {
        // Initialize with welcome message
        const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
        const isApiAvailable = apiKey && apiKey !== 'your_api_key_here';

        const welcomeMessage: AIMessage = {
          id: '1',
          content: isApiAvailable
            ? "Hi! I'm your gaming assistant. Ask me about games, get recommendations, or chat about anything gaming-related!"
            : "Hi! I'm your gaming assistant running in offline mode. I can still help with basic game recommendations and tips!",
          isUser: false,
          timestamp: new Date()
        };
        setAiMessages([welcomeMessage]);
      }
      return;
    }

    setIsAIChat(false);
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
      setConnectionError(false);
    });

    return unsubscribe;

    // Subscribe to typing status
    const unsubscribeTyping = subscribeToTypingStatus(user.uid, otherUserId, (typing) => {
      console.log('Other user typing status:', typing);
      setOtherUserTyping(typing);
    });

    return () => {
      // Clean up typing status when leaving chat
      if (isTyping && !isAIChat) {
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

      // Mark messages as read when user scrolls to bottom
      if (!isAIChat && user && otherUserId && messages.length > 0) {
        setTimeout(() => {
          markMessagesAsSeen(user.uid, otherUserId, user.uid);
        }, 500); // Small delay to ensure user sees the messages
      }
    }
  }, [messages, otherUserTyping, isAIChat, user, otherUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUserId || !user || sending) return;

    setSending(true);

    if (isAIChat) {
      // Handle AI chat
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        isUser: true,
        timestamp: new Date()
      };

      const updatedMessages = [...aiMessages, userMessage];
      setAiMessages(updatedMessages);
      setNewMessage('');
      setOtherUserTyping(true);

      try {
        const aiResponse = await aiChatService.sendMessage(newMessage.trim(), aiMessages);

        const aiMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          isUser: false,
          timestamp: new Date()
        };

        const finalMessages = [...updatedMessages, aiMessage];
        setAiMessages(finalMessages);

        // Save to localStorage
        localStorage.setItem(`ai_chat_${user.uid}`, JSON.stringify(finalMessages));
      } catch (error) {
        toast.error('Failed to get AI response');
        console.error('AI chat error:', error);
      } finally {
        setOtherUserTyping(false);
        setSending(false);
        // Refocus input after AI response
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } else {
      // Handle regular chat
      // Stop typing when sending
      setTypingStatus(user.uid, otherUserId, false);
      setIsTyping(false);

      try {
        await sendMessage(
          user.uid,
          otherUserId,
          newMessage.trim()
        );
        setNewMessage('');
        // Refocus input after sending
        setTimeout(() => inputRef.current?.focus(), 100);
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      } finally {
        setSending(false);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !otherUserId || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;

      if (isAIChat) {
        const imageMessage: AIMessage = {
          id: Date.now().toString(),
          content: imageData,
          isUser: true,
          timestamp: new Date()
        };
        const updatedMessages = [...aiMessages, imageMessage];
        setAiMessages(updatedMessages);
        localStorage.setItem(`ai_chat_${user.uid}`, JSON.stringify(updatedMessages));
      } else {
        try {
          await sendMessage(user.uid, otherUserId, imageData);
          toast.success('Image sent!');
        } catch (error) {
          toast.error('Failed to send image');
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!otherUserId || !user || isAIChat) return;

    // Set typing status (only for regular chats)
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
      }, 1000); // Reduced to 1 second for better responsiveness
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
    if (isAIChat) return 'Always available';

    // Check if other user sent a message recently (within 2 minutes)
    const recentMessages = messages.filter(msg =>
      msg.senderId === otherUserId &&
      msg.timestamp &&
      msg.timestamp.toDate
    );

    if (recentMessages.length > 0) {
      const lastMessage = recentMessages[recentMessages.length - 1];
      const lastMessageTime = lastMessage.timestamp.toDate();
      const now = new Date();
      const diffMinutes = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60);

      if (diffMinutes < 2) {
        return 'Active now';
      }
    }

    // Check typing status
    if (otherUserTyping) return 'Active now';

    // Default to active if we have any conversation
    if (messages.length > 0) return 'Active now';

    return 'Last seen recently';
  };

  // Subscribe to other user's status
  useEffect(() => {
    if (!otherUserId || isAIChat) return;

    console.log('Subscribing to status for:', otherUserId);

    const unsubscribe = onSnapshot(doc(db, 'userStatus', otherUserId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const isOnline = data.online;
        const lastActive = data.lastActive?.toDate();

        console.log('Status update:', { otherUserId, isOnline, lastActive });

        if (isOnline && lastActive) {
          // Check if last active was within 30 seconds
          const now = new Date();
          const diffSeconds = (now.getTime() - lastActive.getTime()) / 1000;
          const isCurrentlyActive = diffSeconds < 30;

          console.log('Activity check:', { diffSeconds, isCurrentlyActive });
          setOtherUserActive(isCurrentlyActive);
        } else {
          setOtherUserActive(false);
        }

        setLastSeen(lastActive);
      } else {
        console.log('No status document for user:', otherUserId);
        setOtherUserActive(false);
      }
    });

    return unsubscribe;
  }, [otherUserId, isAIChat]);

  const handleDeleteMessage = async (messageId: string, isAI: boolean) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      if (isAI) {
        // Delete from AI chat
        const updatedMessages = aiMessages.filter(msg => msg.id !== messageId);
        setAiMessages(updatedMessages);
        if (user?.uid) {
          localStorage.setItem(`ai_chat_${user.uid}`, JSON.stringify(updatedMessages));
        }
        toast.success('Message deleted');
      } else {
        // Delete from regular chat
        const updatedMessages = messages.filter(msg => msg.id !== messageId);
        setMessages(updatedMessages);
        toast.success('Message deleted');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const getDateLabel = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => { }} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">Please log in to view messages.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden sm:block">
        <Navbar onSearch={() => { }} />
      </div>

      <div className="flex h-[calc(100dvh-64px)] sm:h-[calc(100dvh-80px)] overflow-hidden">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col w-full h-full">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background border-b border-border px-3 sm:px-6 py-3 sm:py-4">
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
                <div className="relative">
                  <Avatar
                    className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    onClick={() => {
                      if (!isAIChat && otherUserId) {
                        // Get username from otherUserName or use otherUserId as fallback
                        const username = otherUserName.replace('@', '') || otherUserId;
                        navigate(`/user/${username}`);
                      }
                    }}
                  >
                    <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                    <AvatarFallback className={`text-white text-sm ${isAIChat ? 'bg-primary' : 'bg-blue-500'}`}>
                      {isAIChat ? <FaRobot className="w-4 h-4" /> : otherUserName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {(otherUserActive || isAIChat) && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-semibold text-base sm:text-lg truncate">{otherUserName}</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {connectionError ? 'Connection issues - using offline mode' :
                      otherUserTyping ? 'Typing...' : getLastSeenStatus()}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="p-1 sm:p-2 flex-shrink-0">
                <FaEllipsisV className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto bg-background px-3 sm:px-6 py-3 sm:py-4 scroll-smooth"
            data-lenis-prevent
          >
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'justify-end'}`}>
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-12 w-48 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : (isAIChat ? aiMessages.length > 0 : messages.length > 0) ? (
              <div className="space-y-1">
                {(isAIChat ? (aiMessages as AIMessage[]) : (messages as Message[])).map((message: any, index: number) => {
                  const isOwn = isAIChat ? (message as AIMessage).isUser : (message as Message).senderId === user.uid;
                  const currentMessages = isAIChat ? aiMessages : messages;
                  const prevMessage = currentMessages[index - 1] as any;
                  const nextMessage = currentMessages[index + 1] as any;

                  // Date separator logic
                  const currentDate = isAIChat ? (message as AIMessage).timestamp : (message as Message).timestamp;
                  const prevDate = prevMessage ? (isAIChat ? prevMessage.timestamp : prevMessage.timestamp) : null;

                  const currentDay = currentDate?.toDate ? currentDate.toDate().toDateString() : new Date(currentDate).toDateString();
                  const prevDay = prevDate ? (prevDate.toDate ? prevDate.toDate().toDateString() : new Date(prevDate).toDateString()) : null;

                  const showDateSeparator = currentDay !== prevDay;

                  const showAvatar = isAIChat ?
                    (!nextMessage || (nextMessage as AIMessage).isUser !== (message as AIMessage).isUser) :
                    (!nextMessage || (nextMessage as Message).senderId !== (message as Message).senderId);

                  const isFirstInGroup = isAIChat ?
                    (!prevMessage || (prevMessage as AIMessage).isUser !== (message as AIMessage).isUser || showDateSeparator) :
                    (!prevMessage || (prevMessage as Message).senderId !== (message as Message).senderId || showDateSeparator);

                  const messageContent = isAIChat ? (message as AIMessage).content : (message as Message).message;
                  const messageTimestamp = isAIChat ? (message as AIMessage).timestamp : (message as Message).timestamp;
                  const messageRead = isAIChat ? false : (message as Message).read;

                  return (
                    <React.Fragment key={message.id}>
                      {showDateSeparator && (
                        <div className="flex justify-center my-6">
                          <div className="bg-secondary/50 text-secondary-foreground px-4 py-1 rounded-full text-xs font-medium border border-border">
                            {getDateLabel(currentDate)}
                          </div>
                        </div>
                      )}
                      <div className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'} ${isFirstInGroup ? 'mt-3 sm:mt-4' : 'mt-1'}`}>
                        {!isOwn && (
                          <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                            {showAvatar ? (
                              <Avatar
                                className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                                onClick={() => {
                                  if (!isAIChat && otherUserId) {
                                    const username = otherUserName.replace('@', '') || otherUserId;
                                    navigate(`/user/${username}`);
                                  }
                                }}
                              >
                                <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                                <AvatarFallback className={`text-xs sm:text-sm ${isAIChat ? 'bg-primary text-white' : 'bg-secondary text-secondary-foreground'}`}>
                                  {isAIChat ? <FaRobot className="w-3 h-3" /> : otherUserName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ) : null}
                          </div>
                        )}

                        <div className={`max-w-[75%] sm:max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'} group relative`}>
                          {isOwn && (
                            <Button
                              onClick={() => handleDeleteMessage(message.id, isAIChat)}
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                              <FaTrash className="w-3 h-3" />
                            </Button>
                          )}
                          <div className={`${messageContent.startsWith('data:image/') ? 'p-1' : 'px-3 sm:px-4 py-2'} rounded-2xl ${isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-secondary text-secondary-foreground rounded-bl-md'
                            }`}>
                            {messageContent.startsWith('data:image/') ? (
                              <div
                                className="relative group cursor-pointer"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  const imageUrl = messageContent;
                                  setFullscreenImage(imageUrl);
                                }}
                              >
                                <img
                                  src={messageContent}
                                  alt="Shared image"
                                  className="max-w-[200px] sm:max-w-[250px] h-auto rounded-lg transition-all duration-200 hover:opacity-90 shadow-md"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all duration-200" />
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed break-words">
                                {messageContent}
                              </p>
                            )}
                          </div>
                          {showAvatar && (
                            <div className={`flex items-center gap-1 mt-1 px-1 sm:px-2 ${isOwn ? 'justify-end' : 'justify-start'
                              }`}>
                              <p className="text-xs text-muted-foreground">
                                {isAIChat ?
                                  (messageTimestamp instanceof Date ? messageTimestamp : new Date(messageTimestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                  formatTime(messageTimestamp)
                                }
                              </p>
                              {isOwn && !isAIChat && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  {messageRead ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                {otherUserTyping && (
                  <div className="flex gap-2 justify-start mt-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                      <Avatar
                        className="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                        onClick={() => {
                          if (!isAIChat && otherUserId) {
                            const username = otherUserName.replace('@', '') || otherUserId;
                            navigate(`/user/${username}`);
                          }
                        }}
                      >
                        <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                        <AvatarFallback className={`text-xs sm:text-sm ${isAIChat ? 'bg-primary text-white' : 'bg-secondary text-secondary-foreground'}`}>
                          {isAIChat ? <FaRobot className="w-3 h-3" /> : otherUserName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="bg-secondary rounded-2xl rounded-bl-md px-3 sm:px-4 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                      <AvatarFallback className={isAIChat ? 'bg-primary text-white' : ''}>
                        {isAIChat ? <FaRobot className="w-6 h-6" /> : otherUserName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <p className="text-lg font-medium mb-2">No messages yet</p>
                  <p className="text-sm">Start a conversation with {otherUserName}</p>
                </div>
              </div>
            )
            }
          </div >

          {/* Input */}
          < div className="bg-background border-t border-border px-3 sm:px-6 py-3 sm:py-4" >
            <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0 bg-primary hover:bg-primary/80 text-white flex-shrink-0"
              >
                <FaImage className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                placeholder={isAIChat ? 'Ask me about games...' : `Message ${otherUserName}...`}
                className="flex-1 rounded-full bg-secondary focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base py-2 sm:py-3"
                disabled={sending}
                autoFocus
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0 bg-primary hover:bg-primary/90 disabled:opacity-50 flex-shrink-0"
              >
                {sending ? (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaPaperPlane className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </Button>
            </form>
          </div >
        </div >
      </div >

      {/* Fullscreen Image Modal */}
      {
        fullscreenImage && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Button
                onClick={() => setFullscreenImage(null)}
                className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full w-12 h-12 p-0 shadow-lg"
              >
                <FaTimes className="w-5 h-5" />
              </Button>
              <img
                src={fullscreenImage}
                alt="Fullscreen image"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Chat;