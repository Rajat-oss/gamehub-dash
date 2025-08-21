import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToChats } from '@/lib/chat';
import { userService } from '@/services/userService';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FaComments, FaArrowLeft, FaReply } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Inbox: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [userProfiles, setUserProfiles] = useState<{[key: string]: any}>({});
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToChats(user.uid, async (userChats) => {
      setChats(userChats);
      
      // Load user profiles and calculate unread counts
      const profiles: {[key: string]: any} = {};
      const unreadCountsMap: {[key: string]: number} = {};
      
      for (const chat of userChats) {
        const otherUserId = chat.participants.find((p: string) => p !== user.uid);
        if (otherUserId) {
          // Load profile
          if (!profiles[otherUserId]) {
            try {
              const profile = await userService.getUserProfile(otherUserId);
              profiles[otherUserId] = profile;
            } catch (error) {
              console.error('Error loading user profile:', error);
            }
          }
          
          // Calculate unread count by subscribing to messages
          import('@/lib/chat').then(({ subscribeToMessages }) => {
            subscribeToMessages(user.uid, otherUserId, (messages) => {
              const unreadCount = messages.filter(msg => 
                msg.receiverId === user.uid && !msg.read
              ).length;
              setUnreadCounts(prev => ({ ...prev, [otherUserId]: unreadCount }));
            });
          });
        }
      }
      
      setUserProfiles(profiles);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleChatClick = (chat: any) => {
    const otherUserId = chat.participants.find((p: string) => p !== user?.uid);
    if (otherUserId) {
      navigate(`/chat/${otherUserId}`);
    }
  };

  const getOtherParticipant = (chat: any) => {
    const otherUserId = chat.participants.find((p: string) => p !== user?.uid);
    const profile = otherUserId ? userProfiles[otherUserId] : null;
    return {
      id: otherUserId,
      name: profile?.username || (otherUserId ? chat.participantNames?.[otherUserId] : 'Unknown'),
      avatar: profile?.photoURL
    };
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
              const unreadCount = unreadCounts[otherUser.id] || 0;
              
              return (
                <Card 
                  key={chat.id} 
                  className={`border-border/50 hover:border-primary/50 transition-colors cursor-pointer ${
                    unreadCount > 0 
                      ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30' 
                      : 'bg-gradient-card'
                  }`}
                  onClick={() => handleChatClick(chat)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
                          <AvatarFallback>
                            {otherUser.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`truncate ${
                            unreadCount > 0 ? 'font-bold' : 'font-semibold'
                          }`}>{otherUser.name}</h3>
                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <Badge variant="default" className="bg-red-500 text-white">
                                {unreadCount}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTime(chat.lastMessageTime)}
                            </span>
                          </div>
                        </div>
                        
                        {chat.lastMessage && (
                          <div className={`text-sm truncate ${
                            unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                          }`}>
                            {chat.lastMessageSenderId ? (
                              chat.lastMessageSenderId === user?.uid ? (
                                `You: ${chat.lastMessage}`
                              ) : (
                                <div className="flex items-center gap-1">
                                  <FaReply className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                  <span className="truncate">
                                    {otherUser.name} sent you a message
                                  </span>
                                </div>
                              )
                            ) : (
                              chat.lastMessage
                            )}
                          </div>
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