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
import { FaArrowLeft, FaHeart, FaPlus, FaComment, FaClock, FaStar, FaUsers, FaGamepad, FaPlay, FaDownload, FaShare } from 'react-icons/fa';
import { toast } from 'sonner';

import { AnimatedHeart } from '@/components/ui/animated-heart';
import { motion } from 'framer-motion';

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
      const [averageRating, comments] = await Promise.all([
        commentService.getGameAverageRating(gameId),
        commentService.getGameComments(gameId)
      ]);
      
      const ratingsCount = comments.filter(c => c.rating).length;
      
      setGameStats({
        averageRating: averageRating || 0,
        ratingCount: ratingsCount,
        commentCount: comments.length,
        ratingDistribution: calculateRatingDistribution(comments)
      });
    } catch (error) {
      console.error('Error loading game stats:', error);
      setGameStats({
        averageRating: 0,
        ratingCount: 0,
        commentCount: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
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
            <Link to="/homepage">
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
        <Link to="/homepage">
          <Button variant="ghost" className="mb-6">
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>

        {/* Cinematic Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-3xl">
          {/* Background with Blur Effect */}
          <div 
            className="absolute inset-0 scale-110 blur-2xl"
            style={{
              backgroundImage: `url(${game.background_image || game.box_art_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Content */}
          <div className="relative p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Game Cover */}
              <div className="lg:col-span-4">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                  <img
                    src={game.box_art_url}
                    alt={game.name}
                    className="relative w-full max-w-sm mx-auto aspect-[3/4] object-cover rounded-xl shadow-2xl"
                  />
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2">
                    <AnimatedHeart
                      isLiked={isGameFavorite}
                      onToggle={handleToggleFavorite}
                      size="md"
                      className="text-white"
                    />
                  </div>
                </div>
              </div>
              
              {/* Hero Banner */}
              <div className="lg:col-span-8 space-y-6">
                {/* Title & Meta */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight">
                      <span className="bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent">
                        {game.name}
                      </span>
                    </h1>
                    {gameDetails?.release_date && (
                      <div className="text-lg">
                        <span className="text-pink-400 font-semibold">{gameDetails.release_date}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Description */}
                  <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
                    {gameDetails?.summary?.slice(0, 200) || 
                     `Experience the ultimate gaming adventure with ${game.name}. Immerse yourself in stunning visuals, engaging gameplay, and unforgettable moments.`}
                    {gameDetails?.summary && gameDetails.summary.length > 200 && '...'}
                  </p>
                  
                  {/* Platforms & Genres */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {gameDetails?.platforms?.slice(0, 4).map(platform => (
                        <Badge key={platform} className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30 text-pink-300 px-3 py-1">
                          {platform}
                        </Badge>
                      )) || (
                        <>
                          <Badge className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30 text-pink-300 px-3 py-1">PC</Badge>
                          <Badge className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30 text-pink-300 px-3 py-1">Console</Badge>
                        </>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {gameDetails?.genres?.slice(0, 3).map(genre => (
                        <Badge key={genre} variant="outline" className="rounded-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10">
                          {genre}
                        </Badge>
                      )) || (
                        <Badge variant="outline" className="rounded-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10">
                          Gaming
                        </Badge>
                      )}
                      <Badge variant="outline" className="rounded-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                        Updated Recently
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                {user && (
                  <div>
                    <Button 
                      onClick={() => setIsLogModalOpen(true)}
                      size="lg"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
                    >
                      <FaPlus className="w-5 h-5 mr-2" />
                      Add to Library
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <FaStar className="text-pink-400" />
                <span className="text-2xl font-bold text-white">
                  {(gameStats?.averageRating || 0).toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-gray-400">Rating</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white mb-2">
                {gameStats?.ratingCount || 0}
              </div>
              <p className="text-sm text-gray-400">Reviews</p>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-500/10 to-pink-500/10 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <FaComment className="text-cyan-400" />
                <span className="text-2xl font-bold text-white">
                  {gameStats?.commentCount || 0}
                </span>
              </div>
              <p className="text-sm text-gray-400">Comments</p>
            </div>
            

          </div>
        </div>

        {/* Content Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="comments" className="flex items-center gap-2 w-full">
                  <FaComment className="w-4 h-4" />
                  Comments & Reviews
                </TabsTrigger>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <TabsTrigger value="stats" className="flex items-center gap-2 w-full">
                  <FaStar className="w-4 h-4" />
                  Statistics
                </TabsTrigger>
              </motion.div>
            </TabsList>
          
            <TabsContent value="comments" className="mt-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <CommentsSection gameId={game.id} gameName={game.name} />
              </motion.div>
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
                        {(gameStats?.averageRating || 0).toFixed(1)}/5
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
        </motion.div>
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