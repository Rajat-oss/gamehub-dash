import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/homepage/Navbar';
import { CommentsSection } from '@/components/game/CommentsSection';
import { GameLogModal } from '@/components/game/GameLogModal';
import { ActivityFeed } from '@/components/homepage/ActivityFeed';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getGameById, getGameDetails, TwitchGame, GameDetails } from '@/lib/twitch';
import { addToFavorites, removeFromFavorites, isFavorite } from '@/lib/favorites';
import { commentService } from '@/services/commentService';
import { FaArrowLeft, FaHeart, FaPlus, FaComment, FaClock, FaStar, FaUsers, FaGamepad } from 'react-icons/fa';
import { toast } from 'sonner';

const GameDetails = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const [game, setGame] = useState<TwitchGame | null>(null);
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGameFavorite, setIsGameFavorite] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [gameStats, setGameStats] = useState<{
    averageRating: number;
    ratingCount: number;
    commentCount: number;
    ratingDistribution?: { [key: number]: number };
  } | null>(null);

  useEffect(() => {
    if (gameId) {
      loadGameDetails(gameId);
      loadGameStats();
    }
  }, [gameId]);

  const loadGameDetails = async (id: string) => {
    setLoading(true);
    try {
      const gameData = await getGameById(id);
      setGame(gameData);
      setIsGameFavorite(gameData ? isFavorite(gameData.id) : false);
      
      // Try to get detailed info
      if (gameData) {
        const details = await getGameDetails(gameData.name);
        setGameDetails(details);
      }
    } catch (error) {
      console.error('Error loading game details:', error);
      toast.error('Failed to load game details');
    } finally {
      setLoading(false);
    }
  };
  
  const loadGameStats = async () => {
    if (!gameId) return;
    
    try {
      const [ratingData, comments] = await Promise.all([
        commentService.getGameAverageRating(gameId),
        commentService.getGameComments(gameId)
      ]);
      
      setGameStats({
        averageRating: ratingData.average,
        ratingCount: ratingData.count,
        commentCount: comments.length,
        ratingDistribution: calculateRatingDistribution(comments)
      });
    } catch (error) {
      console.error('Error loading game stats:', error);
    }
  };
  
  const calculateRatingDistribution = (comments: any[]) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    comments.forEach(comment => {
      if (comment.rating) {
        distribution[comment.rating]++;
      }
    });
    return distribution;
  };

  const handleToggleFavorite = () => {
    if (!game) return;
    
    if (isGameFavorite) {
      removeFromFavorites(game.id);
      setIsGameFavorite(false);
      toast.success(`${game.name} removed from favorites`, {
        description: 'You can add it back anytime from the game page'
      });
    } else {
      addToFavorites(game);
      setIsGameFavorite(true);
      toast.success(`${game.name} added to favorites`, {
        description: 'View all favorites in your favorites page'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="w-full h-96 rounded-lg" />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Game not found</h1>
            <Link to="/dashboard">
              <Button>Back to Marketplace</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>

        {/* Game Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Game Image */}
          <div className="lg:col-span-1">
            <div className="relative">
              <img
                src={game.box_art_url}
                alt={game.name}
                className="w-full rounded-lg shadow-lg"
              />
              <Button
                className={`absolute top-4 right-4 ${isGameFavorite ? 'bg-red-500 hover:bg-red-600' : 'bg-black/50 hover:bg-black/70'} text-white`}
                onClick={handleToggleFavorite}
              >
                <FaHeart className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Game Info */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold text-foreground">{game.name}</h1>
            </div>

            <div className="space-y-6">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {user && (
                  <Button 
                    onClick={() => setIsLogModalOpen(true)}
                    className="bg-gradient-primary hover:shadow-glow-primary"
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add to Library
                  </Button>
                )}
                
                <Button 
                  variant={isGameFavorite ? "default" : "outline"}
                  onClick={handleToggleFavorite}
                  className={isGameFavorite ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  <FaHeart className="w-4 h-4 mr-2" />
                  {isGameFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
              </div>
              
              {/* Game Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-card border border-border/50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FaStar className="text-yellow-400" />
                    <span className="text-2xl font-bold text-primary">
                      {gameStats?.averageRating.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
                <div className="bg-gradient-card border border-border/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent mb-1">
                    {gameStats?.ratingCount || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Reviews</div>
                </div>
                <div className="bg-gradient-card border border-border/50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FaComment className="text-purple-400" />
                    <span className="text-2xl font-bold text-gaming-green">
                      {gameStats?.commentCount || 0}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">Comments</div>
                </div>
                <div className="bg-gradient-card border border-border/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gaming-blue mb-1">#{game.id}</div>
                  <div className="text-sm text-muted-foreground">Game ID</div>
                </div>
              </div>

              {/* Game Description */}
              <div className="bg-gradient-card border border-border/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">About This Game</h3>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {gameDetails?.summary || gameDetails?.storyline || 
                   `Experience ${game.name} and discover what makes this game special.`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {gameDetails?.genres?.map(genre => (
                    <Badge key={genre} variant="secondary">{genre}</Badge>
                  )) || <Badge variant="secondary">Gaming</Badge>}
                  {gameDetails?.release_date && (
                    <Badge variant="secondary">{gameDetails.release_date}</Badge>
                  )}
                  <Badge variant="secondary">Popular</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="comments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <FaComment className="w-4 h-4" />
              Comments & Reviews
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <FaClock className="w-4 h-4" />
              Game Activity
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <FaStar className="w-4 h-4" />
              Statistics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="comments" className="mt-6">
            <CommentsSection gameId={game.id} gameName={game.name} />
          </TabsContent>
          
          <TabsContent value="activity" className="mt-6">
            <ActivityFeed 
              gameId={game.id}
              title={`Recent Activity for ${game.name}`}
              maxItems={20}
              showUserInfo={true}
            />
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FaStar className="text-yellow-400" />
                    Rating Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = gameStats?.ratingDistribution?.[rating] || 0;
                      const total = gameStats?.ratingCount || 1;
                      const percentage = (count / total) * 100;
                      
                      return (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm w-4">{rating}</span>
                          <FaStar className="text-yellow-400 w-3 h-3" />
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FaUsers className="text-blue-400" />
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Reviews</span>
                      <span className="font-semibold">{gameStats?.ratingCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Comments</span>
                      <span className="font-semibold">{gameStats?.commentCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Rating</span>
                      <span className="font-semibold">
                        {gameStats?.averageRating.toFixed(1) || '0.0'}/5
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FaGamepad className="text-green-400" />
                    Game Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Game ID</span>
                      <span className="font-semibold">#{game.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-semibold text-green-400">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform</span>
                      <span className="font-semibold">Twitch</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Game Log Modal */}
      <GameLogModal
        game={game}
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onGameLogged={() => {
          toast.success('Game added to your library!');
        }}
      />
    </div>
  );
};

export default GameDetails;