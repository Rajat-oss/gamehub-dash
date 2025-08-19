import React, { useState, useEffect } from 'react';
import { userActivityService, UserActivity } from '@/services/userActivityService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  FaGamepad, 
  FaTrophy, 
  FaStar, 
  FaComment, 
  FaPlus, 
  FaExchangeAlt,
  FaUser,
  FaClock
} from 'react-icons/fa';

interface ActivityFeedProps {
  userId?: string; // If provided, shows only user's activities
  gameId?: string; // If provided, shows only game's activities
  title?: string;
  maxItems?: number;
  showUserInfo?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  userId,
  gameId, 
  title = "Recent Activity", 
  maxItems = 20,
  showUserInfo = true 
}) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadActivities();
  }, [userId, gameId, maxItems]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      let activityData;
      
      if (gameId) {
        // Get all recent activities and filter by gameId on client side
        const allActivities = await userActivityService.getRecentActivities(100);
        activityData = allActivities.filter(activity => activity.gameId === gameId).slice(0, maxItems);
      } else if (userId) {
        activityData = await userActivityService.getUserActivities(userId, maxItems);
      } else {
        activityData = await userActivityService.getRecentActivities(maxItems);
      }
      
      setActivities(activityData);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activity feed.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'game_added':
        return <FaPlus className="w-4 h-4 text-green-500" />;
      case 'game_completed':
        return <FaTrophy className="w-4 h-4 text-yellow-500" />;
      case 'game_rated':
        return <FaStar className="w-4 h-4 text-yellow-400" />;
      case 'game_status_changed':
        return <FaExchangeAlt className="w-4 h-4 text-blue-500" />;
      case 'comment_posted':
        return <FaComment className="w-4 h-4 text-purple-500" />;
      case 'game_requested':
        return <FaGamepad className="w-4 h-4 text-orange-500" />;
      default:
        return <FaGamepad className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: UserActivity['type']) => {
    switch (type) {
      case 'game_added':
        return 'bg-green-500/10 border-green-500/20';
      case 'game_completed':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'game_rated':
        return 'bg-yellow-400/10 border-yellow-400/20';
      case 'game_status_changed':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'comment_posted':
        return 'bg-purple-500/10 border-purple-500/20';
      case 'game_requested':
        return 'bg-orange-500/10 border-orange-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaClock className="text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaClock className="text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <FaClock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
              >
                {/* Activity Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Game Image (if available) */}
                {activity.gameImageUrl && (
                  <div className="flex-shrink-0">
                    <img 
                      src={activity.gameImageUrl} 
                      alt={activity.gameName || 'Game'}
                      className="w-10 h-12 object-cover rounded"
                    />
                  </div>
                )}

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {showUserInfo && (
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              <FaUser className="w-3 h-3" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{activity.userName}</span>
                        </div>
                      )}
                      
                      <p className="text-sm text-foreground">
                        {activity.description}
                      </p>
                      
                      {/* Metadata */}
                      {activity.metadata?.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <FaStar className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            {activity.metadata.rating}/5
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};