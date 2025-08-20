import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { gameLogService } from '@/services/gameLogService';
import { UserProfile as UserProfileType } from '@/types/user';
import { GameLog } from '@/types/gameLog';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FaUser, FaGamepad, FaUsers, FaCalendar, FaHeart } from 'react-icons/fa';
import { toast } from 'sonner';

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [userGames, setUserGames] = useState<GameLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (username) {
      loadUserProfile();
    }
  }, [username]);

  const loadUserProfile = async () => {
    if (!username) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const userProfile = await userService.getUserByUsername(username);
      if (userProfile) {
        setProfile(userProfile);
        
        // Check if current user is following this user
        if (user && userProfile.followers.includes(user.uid)) {
          setIsFollowing(true);
        }
        
        // Load user's public games
        try {
          const games = await gameLogService.getUserGameLogs(userProfile.uid);
          setUserGames(games.slice(0, 6)); // Show first 6 games
        } catch (gameError) {
          console.error('Error loading user games:', gameError);
          // Don't fail the whole page if games can't load
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !profile) return;
    
    try {
      if (isFollowing) {
        await userService.unfollowUser(user.uid, profile.uid);
        setIsFollowing(false);
        toast.success(`Unfollowed ${profile.username}`);
      } else {
        await userService.followUser(user.uid, profile.uid);
        setIsFollowing(true);
        toast.success(`Following ${profile.username}`);
      }
      
      // Reload profile to update follower count
      loadUserProfile();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-32 w-full mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <FaUser className="text-6xl text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">User not found</h1>
            <p className="text-muted-foreground">The user @{username} doesn't exist.</p>
          </div>
        </main>
      </div>
    );
  }

  const isOwnProfile = user?.uid === profile.uid;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="bg-gradient-card border-border/50 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.photoURL} alt={profile.username} />
                <AvatarFallback className="text-2xl">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">@{profile.username}</h1>
                  {profile.displayName && (
                    <span className="text-lg text-muted-foreground">({profile.displayName})</span>
                  )}
                </div>
                
                {profile.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FaCalendar className="w-4 h-4" />
                    <span>Joined {profile.joinDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaUsers className="w-4 h-4" />
                    <span>{profile.followers.length} followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaUsers className="w-4 h-4" />
                    <span>{profile.following.length} following</span>
                  </div>
                </div>
              </div>
              
              {!isOwnProfile && user && (
                <Button
                  onClick={handleFollowToggle}
                  variant={isFollowing ? "outline" : "default"}
                  className={isFollowing ? "border-red-500 text-red-500 hover:bg-red-50" : ""}
                >
                  <FaHeart className="w-4 h-4 mr-2" />
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User's Games */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FaGamepad className="text-primary" />
              Recent Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userGames.map((game) => (
                  <div key={game.id} className="bg-secondary/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      {game.gameImageUrl && (
                        <img
                          src={game.gameImageUrl}
                          alt={game.gameName}
                          className="w-12 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{game.gameName}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {game.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    {game.rating && game.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm">{game.rating}/5</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaGamepad className="text-4xl text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No games to show</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserProfile;