import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, subscribeToMessages } from '@/lib/chat';
import { userService } from '@/services/userService';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FaArrowLeft, FaPaperPlane, FaUser } from 'react-icons/fa';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!otherUserId || !user) return;

    // Get other user's name
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

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(user.uid, otherUserId, (chatMessages) => {
      setMessages(chatMessages);
      setLoading(false);
    });

    return unsubscribe;
  }, [otherUserId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !otherUserId || !user || sending) return;

    setSending(true);
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
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/inbox')}
              className="flex items-center gap-2"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                <AvatarFallback>{otherUserName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold">Chat with {otherUserName}</h1>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-gradient-card border border-border/50 rounded-xl shadow-2xl h-[700px] flex flex-col backdrop-blur-sm">
          {/* Chat Header */}
          <div className="p-4 border-b border-border/30 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                  <AvatarImage src={otherUserPhoto} alt={otherUserName} />
                  <AvatarFallback className="bg-primary/20">{otherUserName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div>
                <h2 className="font-semibold text-lg">{otherUserName}</h2>
                <p className="text-xs text-muted-foreground">Online now</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-background/50 to-background/80">
            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`flex items-end gap-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end flex-row-reverse'}`}>
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-16 w-64 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-6">
                {messages.map((message, index) => {
                  const isOwn = message.senderId === user.uid;
                  const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId;
                  
                  return (
                    <div key={message.id} className={`flex items-end gap-3 animate-in slide-in-from-bottom-2 duration-300 ${
                      isOwn ? 'justify-end flex-row-reverse' : 'justify-start'
                    }`}>
                      {showAvatar ? (
                        <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-background shadow-lg">
                          <AvatarImage src={isOwn ? user.photoURL : otherUserPhoto} alt={isOwn ? user.displayName : otherUserName} />
                          <AvatarFallback className={isOwn ? 'bg-primary/20' : 'bg-secondary/20'}>
                            {(isOwn ? user.displayName || user.email : otherUserName).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8 h-8 flex-shrink-0" />
                      )}
                      
                      <div className={`group relative max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                        isOwn 
                          ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground' 
                          : 'bg-gradient-to-br from-card to-card/80 text-card-foreground border border-border/30'
                      }`}>
                        <div className="text-sm leading-relaxed">{message.message}</div>
                        <div className={`text-xs mt-2 opacity-70 group-hover:opacity-100 transition-opacity ${
                          isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                        
                        {/* Message tail */}
                        <div className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                          isOwn 
                            ? '-right-1 bg-gradient-to-br from-primary to-primary/80' 
                            : '-left-1 bg-gradient-to-br from-card to-card/80 border-l border-t border-border/30'
                        }`}></div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground animate-pulse">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUser className="text-2xl text-primary/50" />
                  </div>
                  <p className="text-lg font-medium mb-2">Start the conversation!</p>
                  <p className="text-sm">Send a message to {otherUserName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border/30 bg-gradient-to-r from-background/80 to-background/60 rounded-b-xl">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${otherUserName}...`}
                  className="pr-12 py-3 rounded-full border-border/50 bg-background/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  disabled={sending}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {sending && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={!newMessage.trim() || sending}
                className="rounded-full w-12 h-12 p-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                <FaPaperPlane className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;