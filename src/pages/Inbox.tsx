import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { userService } from '@/services/userService';
import { Chat } from '@/types/chat';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FaComments, FaArrowLeft, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Inbox: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [userProfiles, setUserProfiles] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = chatService.getUserChats(user.uid, async (userChats) => {
      setChats(userChats);
      
      // Load user profiles for avatars
      const profiles: {[key: string]: any} = {};
      for (const chat of userChats) {
        const otherUserId = chat.participants.find(p => p !== user.uid);
        if (otherUserId && !profiles[otherUserId]) {
          try {
            const profile = await userService.getUserProfile(otherUserId);
            profiles[otherUserId] = profile;
          } catch (error) {
            console.error('Error loading user profile:', error);
          }
        }
      }
      setUserProfiles(profiles);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleChatClick = (chat: Chat) => {
    navigate(`/chat/${chat.id}`);
  };

  const getOtherParticipant = (chat: Chat) => {
    const otherUserId = chat.participants.find(p => p !== user?.uid);
    const profile = otherUserId ? userProfiles[otherUserId] : null;
    return {
      id: otherUserId,
      name: profile?.username || (otherUserId ? chat.participantNames[otherUserId] : 'Unknown'),
      avatar: profile?.photoURL
    };
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">Please log in to view your messages.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/homepage')}
            className="flex items-center gap-2"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Button>
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <FaComments className="text-primary text-3xl" />
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Your conversations with other gamers
          </p>
        </div>

        {/* Chat List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : chats.length > 0 ? (
          <div className="space-y-4">
            {chats.map((chat) => {
              const otherUser = getOtherParticipant(chat);
              const unreadCount = chat.unreadCount?.[user.uid] || 0;
              
              return (
                <Card 
                  key={chat.id} 
                  className="bg-gradient-card border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => handleChatClick(chat)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                        <AvatarFallback>
                          {otherUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">{otherUser.name}</h3>
                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <Badge variant="default" className="bg-primary">
                                {unreadCount}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTime(chat.lastActivity)}
                            </span>
                          </div>
                        </div>
                        
                        {chat.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage.senderId === user.uid ? 'You: ' : ''}
                            {chat.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaComments className="text-6xl text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
            <p className="text-muted-foreground mb-4">
              Start a conversation with other gamers in the community!
            </p>
            <Button variant="outline" onClick={() => navigate('/community')}>
              Browse Community
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Inbox;