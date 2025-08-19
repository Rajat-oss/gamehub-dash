import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/dashboard/Navbar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from '@/lib/profile';
import { getComments } from '@/lib/comments';
import { getGameById } from '@/lib/twitch';
import { FaUser, FaGamepad, FaComments, FaStar, FaCalendar, FaArrowLeft } from 'react-icons/fa';

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userComments, setUserComments] = useState<any[]>([]);
  const [favoriteGames, setFavoriteGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserProfile(userId);
    }
  }, [userId]);

  const loadUserProfile = async (id: string) => {
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', id));
      
      if (userDoc.exists()) {
        const userProfile = { id: userDoc.id, ...userDoc.data() } as UserProfile;
        setProfile(userProfile);
        
        // Get user's comments
        const allComments = localStorage.getItem('gamehub_comments_global');
        if (allComments) {
          const comments = JSON.parse(allComments);
          const userCommentsList = comments.filter((c: any) => c.userName === userProfile.userName);
          setUserComments(userCommentsList);
        }
        
        // Get favorite games details
        const gamePromises = userProfile.favoriteGames.map(gameId => getGameById(gameId));
        const games = await Promise.all(gamePromises);
        setFavoriteGames(games.filter(game => game !== null));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGamerLevel = (comments: number, rating: number) => {
    const score = comments * 0.1 + rating;
    if (score >= 10) return { level: 'Elite Gamer', color: 'bg-purple-600' };
    if (score >= 7) return { level: 'Pro Gamer', color: 'bg-blue-600' };
    if (score >= 4) return { level: 'Active Gamer', color: 'bg-green-600' };
    return { level: 'Casual Gamer', color: 'bg-gray-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">User not found</h1>
            <Link to="/community">
              <Button>Back to Community</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const gamerLevel = getGamerLevel(profile.totalComments, profile.averageRating);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/community">
          <Button variant="ghost" className="mb-6">
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Button>
        </Link>

        {/* Profile Header */}
        <Card className="bg-gradient-card border-border/50 mb-8">
          <CardHeader>
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  <FaUser />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{profile.userName}</h1>
                  <Badge className={`${gamerLevel.color} text-white`}>
                    {gamerLevel.level}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <FaCalendar className="text-muted-foreground w-4 h-4" />
                  <span className="text-muted-foreground">Joined {formatDate(profile.joinDate)}</span>
                </div>
                <p className="text-muted-foreground">{profile.bio || 'No bio provided'}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Favorite Games */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaGamepad className="w-5 h-5 mr-2" />
                  Favorite Games ({favoriteGames.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favoriteGames.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {favoriteGames.map((game) => (
                      <Link key={game.id} to={`/game/${game.id}`}>
                        <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/50 transition-colors cursor-pointer">
                          <img
                            src={game.box_art_url}
                            alt={game.name}
                            className="w-full h-20 object-cover rounded mb-2"
                          />
                          <p className="text-sm font-medium truncate">{game.name}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No favorite games yet</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaComments className="w-5 h-5 mr-2" />
                  Recent Reviews ({userComments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userComments.length > 0 ? (
                  <div className="space-y-4">
                    {userComments.slice(0, 5).map((comment) => (
                      <div key={comment.id} className="bg-secondary/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Link to={`/game/${comment.gameId}`} className="font-medium hover:text-primary">
                            Game Review
                          </Link>
                          {comment.rating && (
                            <div className="flex items-center space-x-1">
                              <FaStar className="text-yellow-400 w-4 h-4" />
                              <span className="text-sm">{comment.rating}/5</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{comment.comment}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(comment.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Gaming Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaGamepad className="text-primary w-4 h-4" />
                    <span className="text-sm">Favorite Games</span>
                  </div>
                  <Badge variant="secondary">{favoriteGames.length}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaComments className="text-accent w-4 h-4" />
                    <span className="text-sm">Total Reviews</span>
                  </div>
                  <Badge variant="secondary">{profile.totalComments}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaStar className="text-yellow-400 w-4 h-4" />
                    <span className="text-sm">Avg Rating Given</span>
                  </div>
                  <Badge variant="secondary">{profile.averageRating.toFixed(1)}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Badges */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.totalComments > 5 && (
                    <Badge variant="secondary" className="text-xs">Active Reviewer</Badge>
                  )}
                  {profile.averageRating >= 4.0 && (
                    <Badge variant="secondary" className="text-xs">Quality Rater</Badge>
                  )}
                  {favoriteGames.length >= 3 && (
                    <Badge variant="secondary" className="text-xs">Game Explorer</Badge>
                  )}
                  {Date.now() - profile.joinDate < 86400000 * 30 && (
                    <Badge variant="secondary" className="text-xs">New Member</Badge>
                  )}
                  {profile.totalComments === 0 && favoriteGames.length === 0 && (
                    <Badge variant="secondary" className="text-xs">Getting Started</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;