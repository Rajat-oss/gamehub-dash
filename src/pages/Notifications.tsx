import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService, Notification } from '@/services/notificationService';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaBell, FaUser, FaGamepad, FaHeart, FaCheck, FaStar, FaPlus, FaThumbsUp, FaReply } from 'react-icons/fa';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Set up real-time listener
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsList: Notification[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Filter out chat notifications
        if (data.type !== 'chat_message') {
          notificationsList.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate()
          } as Notification);
        }
      });
      
      setNotifications(notificationsList);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to notifications:', error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Remove loadNotifications function as we're using real-time listener

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    setMarkingAllRead(true);
    try {
      await notificationService.markAllAsRead(user.uid);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <FaUser className="w-5 h-5 text-blue-500" />;
      case 'game_added':
        return <FaPlus className="w-5 h-5 text-green-500" />;
      case 'game_favorited':
        return <FaHeart className="w-5 h-5 text-red-500" />;
      case 'review_posted':
        return <FaStar className="w-5 h-5 text-yellow-500" />;
      case 'review_liked':
        return <FaThumbsUp className="w-5 h-5 text-blue-500" />;
      case 'review_replied':
        return <FaReply className="w-5 h-5 text-purple-500" />;
      default:
        return <FaBell className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.gameId) {
      navigate(`/game/${notification.gameId}`);
    } else if (notification.fromUsername) {
      navigate(`/user/${notification.fromUsername}`);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onSearch={() => {}} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">Loading notifications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Modern Header */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-card border border-border mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="relative p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-6">
                <div className="relative">
                  <div className="p-3 sm:p-4 bg-primary/20 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-primary/20">
                    <FaBell className="text-primary text-2xl sm:text-3xl" />
                  </div>
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-1 sm:mb-2">
                    Notifications
                  </h1>
                  <p className="text-sm sm:text-lg text-muted-foreground">
                    {notifications.length === 0 
                      ? 'Stay connected with your gaming community'
                      : unreadCount > 0 
                        ? `${unreadCount} new update${unreadCount !== 1 ? 's' : ''} waiting for you`
                        : `All caught up! You have ${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAllRead}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white border-0 px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  {markingAllRead ? 'Marking...' : 'Mark all read'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Modern Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`relative overflow-hidden rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer group hover:scale-[1.01] sm:hover:scale-[1.02] ${
                  !notification.read 
                    ? 'bg-card border-primary/30 shadow-lg' 
                    : 'bg-card border-border hover:border-border/50 hover:shadow-md'
                }`}
                onClick={() => handleNotificationClick(notification)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-5">
                    {/* Enhanced Avatar/Image */}
                    <div className="flex-shrink-0 relative">
                      {notification.type === 'follow' || notification.fromUserAvatar ? (
                        <div className="relative group">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-border/50 group-hover:border-primary/50 transition-colors">
                            <Avatar className="w-full h-full">
                              <AvatarImage src={notification.fromUserAvatar} alt={notification.fromUsername} className="object-cover" />
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-sm sm:text-lg font-semibold">
                                {notification.fromUsername?.charAt(0).toUpperCase() || <FaUser />}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 p-1.5 sm:p-2 bg-background border-2 border-border rounded-lg sm:rounded-xl shadow-lg">
                            <div className="w-3 h-3 sm:w-5 sm:h-5">
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                        </div>
                      ) : notification.gameImage ? (
                        <div className="relative group">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-border/50 group-hover:border-primary/50 transition-colors">
                            <img
                              src={notification.gameImage}
                              alt={notification.gameName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 p-1.5 sm:p-2 bg-background border-2 border-border rounded-lg sm:rounded-xl shadow-lg">
                            <div className="w-3 h-3 sm:w-5 sm:h-5">
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary/30 border-2 border-border/50 flex items-center justify-center">
                          <div className="w-4 h-4 sm:w-6 sm:h-6">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <h3 className="font-bold text-base sm:text-xl mb-1 sm:mb-2 group-hover:text-primary transition-colors leading-tight">
                            {notification.title}
                          </h3>
                          
                          <p className="text-muted-foreground mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                            {notification.message}
                          </p>
                          
                          {/* Enhanced Reply Preview */}
                          {notification.replyText && (
                            <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border-l-4 border-purple-500">
                              <p className="text-xs sm:text-sm italic text-purple-700 dark:text-purple-300">
                                💬 "{notification.replyText}"
                              </p>
                            </div>
                          )}
                          
                          {/* Enhanced Game Info */}
                          {notification.gameName && (
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                              <Badge className="bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-700 dark:text-green-300 border-green-500/30 px-2 py-1 text-xs">
                                <FaGamepad className="w-2 h-2 sm:w-3 sm:h-3 mr-1 sm:mr-2" />
                                <span className="truncate max-w-[120px] sm:max-w-none">{notification.gameName}</span>
                              </Badge>
                              {notification.rating && (
                                <Badge className="bg-gradient-to-r from-yellow-500/20 to-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 px-2 py-1 text-xs">
                                  <FaStar className="w-2 h-2 sm:w-3 sm:h-3 mr-1 sm:mr-2" />
                                  {notification.rating}/5
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                            <span className="font-semibold text-muted-foreground">{formatDate(notification.createdAt)}</span>
                            {notification.fromUsername && (
                              <Badge variant="outline" className="text-xs font-medium px-2 py-1">
                                @{notification.fromUsername}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-3 ml-2">
                          {!notification.read && (
                            <div className="relative">
                              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full animate-pulse" />
                              <div className="absolute inset-0 w-3 h-3 sm:w-4 sm:h-4 bg-primary rounded-full animate-ping opacity-75" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-card border border-border">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="relative p-8 sm:p-20 text-center">
              <div className="max-w-lg mx-auto">
                <div className="relative mb-6 sm:mb-8">
                  <div className="p-6 sm:p-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl sm:rounded-3xl w-fit mx-auto border border-primary/20">
                    <FaBell className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm">✨</span>
                  </div>
                </div>
                <h3 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Your notification center awaits
                </h3>
                <p className="text-muted-foreground mb-8 sm:mb-10 text-base sm:text-xl leading-relaxed">
                  Connect with fellow gamers to receive updates about their latest games, reviews, and gaming achievements.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
                  <Button 
                    onClick={() => navigate('/community')} 
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white border-0 px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    <FaUser className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                    Discover Gamers
                  </Button>
                  <Button 
                    onClick={() => navigate('/homepage')} 
                    className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 border border-border/50 px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 hover:scale-105 text-sm sm:text-base"
                  >
                    <FaGamepad className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                    Explore Games
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;