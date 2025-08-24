import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userService } from '@/services/userService';
import { Badge } from '@/components/ui/badge';
import { subscribeToChats, ChatRoom } from '@/lib/chat';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FaUser, FaArrowLeft, FaComments, FaRobot } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const ChatInbox = () => {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [userProfiles, setUserProfiles] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const unsubscribe = subscribeToChats(user.uid, async (newChats) => {
          setChats(newChats);
          
          // Load user profiles for avatars
          const profiles: {[key: string]: any} = {};
          for (const chat of newChats) {
            const otherUserId = chat.participants.find(id => id !== user.uid);
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
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">Loading chats...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/community">
            <Button variant="ghost" className="mb-4">
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <FaComments className="text-primary text-3xl" />
            <h1 className="text-3xl font-bold text-foreground">Chat Inbox</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Your conversations with other gamers
          </p>
        </div>

        {/* AI Assistant Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <FaRobot className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">AI Gaming Assistant</h3>
                  <p className="text-sm text-muted-foreground">Get game recommendations and gaming tips</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/chat/ai-assistant')}
                className="bg-primary hover:bg-primary/90"
              >
                Chat with AI
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat List */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaComments className="w-5 h-5 mr-2" />
              Recent Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chats.length === 0 ? (
              <div className="text-center py-12">
                <FaComments className="text-6xl text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start chatting with other gamers from the community!
                </p>
                <Link to="/community">
                  <Button className="bg-gradient-primary hover:shadow-glow-primary">
                    Explore Community
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {chats.map((chat) => {
                  const currentUser = auth.currentUser;
                  const otherUserId = chat.participants.find(id => id !== currentUser?.uid);
                  const profile = otherUserId ? userProfiles[otherUserId] : null;
                  const otherUserName = profile?.username || (otherUserId ? chat.participantNames[otherUserId] : 'Unknown User');
                  
                  return (
                    <Link key={chat.id} to={`/chat/${otherUserId}`}>
                      <div className="flex items-center space-x-4 p-4 bg-secondary/10 rounded-lg border border-border/30 hover:bg-secondary/20 transition-colors cursor-pointer">
                        <Avatar 
                          className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (otherUserId && profile?.username) {
                              navigate(`/user/${profile.username}`);
                            }
                          }}
                        >
                          <AvatarImage src={profile?.photoURL} alt={otherUserName} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {otherUserName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground truncate">
                              {otherUserName}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(chat.lastMessageTime)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {chat.lastMessage}
                          </p>
                        </div>
                        

                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ChatInbox;