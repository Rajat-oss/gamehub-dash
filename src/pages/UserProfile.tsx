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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FaUser, FaGamepad, FaUsers, FaCalendar, FaHeart, FaArrowLeft, FaStar, FaTrophy, FaClock, FaList, FaEnvelope, FaComments } from 'react-icons/fa';
import { AnimatedFollowButton } from '@/components/ui/animated-button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getGameById, TwitchGame } from '@/lib/twitch';


const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [userGames, setUserGames] = useState<GameLog[]>([]);
  const [userFavorites, setUserFavorites] = useState<TwitchGame[]>([]);
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
          setUserGames(games); // Show all games
        } catch (gameError) {
          console.error('Error loading user games:', gameError);
          // Don't fail the whole page if games can't load
        }
        
        // Load user's favorites
        try {
          if (userProfile.favoriteGames && userProfile.favoriteGames.length > 0) {
            const favoriteGamesData = await Promise.all(
              userProfile.favoriteGames.map(async (gameId: string) => {
                try {
                  const gameData = await getGameById(gameId);
                  return gameData;
                } catch (error) {
                  console.error(`Error loading game ${gameId}:`, error);
                  return null;
                }
              })
            );
            setUserFavorites(favoriteGamesData.filter((game): game is TwitchGame => game !== null));
          } else {
            setUserFavorites([]);
          }
        } catch (favError) {
          console.error('Error loading user favorites:', favError);
          setUserFavorites([]);
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

  // Check if profile is private and user is not the owner
  if (!isOwnProfile && profile.isPublic === false) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <FaUser className="text-6xl text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Private Profile</h1>
            <p className="text-muted-foreground">This user has set their profile to private.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/community')}
            className="flex items-center gap-2"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Community
          </Button>
        </div>
        
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
                <div className="flex flex-col gap-2">
                  <AnimatedFollowButton
                    isFollowing={isFollowing}
                    onToggle={handleFollowToggle}
                  />
                  
                  <Button
                    onClick={async () => {
                      if (!user) return;
                      
                      // Check if both users follow each other
                      const currentUserProfile = await userService.getUserProfile(user.uid);
                      const mutualFollow = isFollowing && currentUserProfile?.following.includes(profile.uid);
                      
                      if (!mutualFollow) {
                        toast.error('You can only message users who follow you back');
                        return;
                      }
                      
                      navigate(`/chat/${profile.uid}`);
                      toast.success(`Starting chat with ${profile.username}`);
                    }}
                    variant="outline"
                  >
                    <FaComments className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gaming Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6 text-center">
              <FaGamepad className="text-3xl text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{userGames.length}</div>
              <div className="text-sm text-muted-foreground">Games Logged</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6 text-center">
              <FaTrophy className="text-3xl text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{userGames.filter(g => g.status === 'completed').length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6 text-center">
              <FaStar className="text-3xl text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {userGames.filter(g => g.rating && g.rating >= 4).length}
              </div>
              <div className="text-sm text-muted-foreground">Highly Rated</div>
            </CardContent>
          </Card>
        </div>

        {/* Games and Favorites Tabs */}
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <Tabs defaultValue="games" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="games" className="flex items-center gap-2">
                  <FaGamepad className="w-4 h-4" />
                  My Games ({userGames.length})
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                  <FaHeart className="w-4 h-4" />
                  Favorites ({userFavorites.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="games" className="mt-6">
                {userGames.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userGames.map((game) => (
                      <Card key={game.id} className="bg-secondary/30 border-border/30 hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            {game.gameImageUrl && (
                              <img
                                src={game.gameImageUrl}
                                alt={game.gameName}
                                className="w-16 h-20 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm mb-1 line-clamp-2">{game.gameName}</h3>
                              <Badge 
                                variant={game.status === 'completed' ? 'default' : 'secondary'} 
                                className="text-xs mb-2"
                              >
                                {game.status.replace('-', ' ')}
                              </Badge>
                              {game.rating && game.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <FaStar className="text-yellow-400 w-3 h-3" />
                                  <span className="text-sm font-medium">{game.rating}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {game.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                              {game.notes}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <FaClock className="w-3 h-3" />
                            <span>{new Date(game.dateAdded).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaGamepad className="text-6xl text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No games logged yet</h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile ? 'Start logging your games to build your library!' : `${profile.username} hasn't logged any games yet.`}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="favorites" className="mt-6">
                {userFavorites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userFavorites.map((game, index) => (
                      <Card key={game.id || index} className="bg-secondary/30 border-border/30 hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            {game.box_art_url && (
                              <img
                                src={game.box_art_url}
                                alt={game.name}
                                className="w-16 h-20 object-cover rounded flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm mb-1 line-clamp-2">{game.name}</h3>
                              <Badge variant="outline" className="text-xs mb-2">
                                <FaHeart className="w-3 h-3 mr-1" />
                                Favorite
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaHeart className="text-6xl text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No favorite games yet</h3>
                    <p className="text-muted-foreground">
                      {isOwnProfile ? 'Add games to your favorites to see them here!' : `${profile.username} hasn't added any favorite games yet.`}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserProfile;