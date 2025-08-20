import React, { useState, useEffect } from 'react';
import { subscribeToPublicProfiles } from '@/lib/publicProfiles';
import { UserProfile } from '@/lib/profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FaGamepad, 
  FaUser,
  FaClock,
  FaCalendar
} from 'react-icons/fa';

interface ActivityFeedProps {
  title?: string;
  maxItems?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  title = "Community Activity", 
  maxItems = 10
}) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToPublicProfiles((newProfiles) => {
      setProfiles(newProfiles.slice(0, maxItems));
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [maxItems]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
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
        {profiles.length === 0 ? (
          <div className="text-center py-8">
            <FaUser className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No community members yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {profiles.map((profile) => (
              <div 
                key={profile.id} 
                className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/20 border-border/30 hover:bg-secondary/30 transition-colors"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <FaUser className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm truncate">{profile.userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FaCalendar className="w-3 h-3" />
                      <span>{formatDate(profile.joinDate)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {profile.favoriteGames.length} games
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {profile.totalComments} reviews
                    </Badge>
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