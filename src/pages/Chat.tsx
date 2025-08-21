import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { userService } from '@/services/userService';
import { ChatMessage, Chat } from '@/types/chat';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { FaArrowLeft, FaPaperPlane, FaUser } from 'react-icons/fa';
import { toast } from 'sonner';

const Chat: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [canMessage, setCanMessage] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId || !user) return;

    // Get chat info and check permissions
    const checkPermissions = async () => {
      try {
        const chats = await new Promise<Chat[]>((resolve) => {
          const unsubscribe = chatService.getUserChats(user.uid, (userChats) => {
            unsubscribe();
            resolve(userChats);
          });
        });
        
        const currentChat = chats.find(c => c.id === chatId);
        if (currentChat) {
          setChat(currentChat);
          const otherUserId = currentChat.participants.find(p => p !== user.uid);
          
          if (otherUserId) {
            const [currentUserProfile, otherUserProfile] = await Promise.all([
              userService.getUserProfile(user.uid),
              userService.getUserProfile(otherUserId)
            ]);
            
            const mutualFollow = currentUserProfile?.following.includes(otherUserId) && 
                               otherUserProfile?.following.includes(user.uid);
            setCanMessage(mutualFollow);
          }
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setCanMessage(false);
      }
    };

    checkPermissions();

    const unsubscribe = chatService.getChatMessages(chatId, (chatMessages) => {
      setMessages(chatMessages);
      setLoading(false);
      
      // Mark messages as read
      chatService.markAsRead(chatId, user.uid);
    });

    return unsubscribe;
  }, [chatId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !user || sending || !canMessage) return;

    setSending(true);
    try {
      await chatService.sendMessage(chatId, user.uid, user.displayName || 'User', newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: Date) => {
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
            <h1 className="text-2xl font-bold">Chat</h1>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="bg-gradient-card border-border/50 h-[600px] flex flex-col">
          {/* Messages */}
          <CardContent className="flex-1 p-4 overflow-y-auto">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                    <Skeleton className="h-12 w-64 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.senderId === user.uid;
                  
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwn 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        <div className="text-sm">{message.content}</div>
                        <div className={`text-xs mt-1 ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <FaUser className="text-4xl mx-auto mb-2" />
                  <p>Start the conversation!</p>
                </div>
              </div>
            )}
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t border-border/50">
            {canMessage ? (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={sending}
                />
                <Button type="submit" disabled={!newMessage.trim() || sending}>
                  <FaPaperPlane className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                <p>You can only message users who follow you back</p>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Chat;