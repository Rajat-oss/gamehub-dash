import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userService } from '@/services/userService';
import { Badge } from '@/components/ui/badge';
import { subscribeToChats, ChatRoom } from '@/lib/chat';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FaUser, FaArrowLeft, FaComments, FaRobot, FaImage } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const ChatInbox = () => {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [userProfiles, setUserProfiles] = useState<{[key: string]: any}>({});
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const unsubscribe = subscribeToChats(user.uid, async (newChats) => {
          setChats(newChats);
          
          // Load user profiles and unread counts
          const profiles: {[key: string]: any} = {};
          const unreadCountsMap: {[key: string]: number} = {};
          
          for (const chat of newChats) {
            const otherUserId = chat.participants.find(id => id !== user.uid);
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
              
              // Count unread messages
              const chatRoomId = [user.uid, otherUserId].sort().join('_');
              const messagesRef = collection(db, `chats/${chatRoomId}/messages`);
              const unreadQuery = query(
                messagesRef,
                where('receiverId', '==', user.uid),
                where('read', '==', false)
              );
              
              onSnapshot(unreadQuery, (snapshot) => {
                unreadCountsMap[otherUserId] = snapshot.docs.length;
                setUnreadCounts({...unreadCountsMap});
              });
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
      
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <FaComments className="text-primary text-2xl sm:text-3xl" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Messages</h1>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg hidden sm:block">
            Your conversations with other gamers
          </p>
        </div>

        {/* AI Assistant Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <FaRobot className="w-4 h-4 sm:w-6 sm:h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">AI Gaming Assistant</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Get game recommendations and gaming tips</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/chat/ai-assistant')}
                className="bg-primary hover:bg-primary/90 text-xs sm:text-sm px-3 sm:px-4 py-2 ml-2 flex-shrink-0"
              >
                <span className="hidden sm:inline">Chat with AI</span>
                <span className="sm:hidden">Chat</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat List */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <FaComments className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">Recent Conversations</span>
              <span className="sm:hidden">Chats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
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
              <div className="space-y-2 sm:space-y-3">
                {chats.map((chat) => {
                  const currentUser = auth.currentUser;
                  const otherUserId = chat.participants.find(id => id !== currentUser?.uid);
                  const profile = otherUserId ? userProfiles[otherUserId] : null;
                  const otherUserName = profile?.username || (otherUserId ? chat.participantNames[otherUserId] : 'Unknown User');
                  
                  return (
                    <Link key={chat.id} to={`/chat/${otherUserId}`}>
                      <div className="relative flex items-center space-x-3 sm:space-x-4 p-3 sm:p-5 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10 hover:bg-white/10 hover:shadow-lg transition-all duration-300 cursor-pointer group active:scale-[0.98]">
                        <div className="relative flex-shrink-0">
                          <Avatar 
                            className="h-12 w-12 sm:h-14 sm:w-14 cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (otherUserId && profile?.username) {
                                navigate(`/user/${profile.username}`);
                              }
                            }}
                          >
                            <AvatarImage src={profile?.photoURL} alt={otherUserName} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-medium text-sm sm:text-base">
                              {otherUserName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {unreadCounts[otherUserId] > 0 && (
                            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                            <h3 className="font-semibold text-foreground truncate text-base sm:text-lg">
                              {otherUserName}
                            </h3>
                            <span className="text-xs text-muted-foreground font-medium flex-shrink-0 ml-2">
                              {formatTime(chat.lastMessageTime)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {chat.lastMessage?.startsWith('data:image/') ? (
                              <span className="flex items-center text-blue-400">
                                <FaImage className="w-3 h-3 mr-1 flex-shrink-0" />
                                Photo
                              </span>
                            ) : (
                              chat.lastMessage
                            )}
                          </p>
                        </div>
                        
                        {unreadCounts[otherUserId] > 0 && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          </div>
                        )}
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