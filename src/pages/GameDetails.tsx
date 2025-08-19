import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/dashboard/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getGameById, TwitchGame } from '@/lib/twitch';
import { addToFavorites, removeFromFavorites, isFavorite } from '@/lib/favorites';
import { CommentsSection } from '@/components/game/CommentsSection';
import { FaArrowLeft, FaHeart } from 'react-icons/fa';

const GameDetails = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<TwitchGame | null>(null);

  const [loading, setLoading] = useState(true);
  const [isGameFavorite, setIsGameFavorite] = useState(false);

  useEffect(() => {
    if (gameId) {
      loadGameDetails(gameId);
    }
  }, [gameId]);

  const loadGameDetails = async (id: string) => {
    setLoading(true);
    try {
      const gameData = await getGameById(id);
      setGame(gameData);
      setIsGameFavorite(gameData ? isFavorite(gameData.id) : false);
    } catch (error) {
      console.error('Error loading game details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    if (!game) return;
    
    if (isGameFavorite) {
      removeFromFavorites(game.id);
      setIsGameFavorite(false);
    } else {
      addToFavorites(game);
      setIsGameFavorite(true);
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
              {/* Game Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-card border border-border/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">Popular</div>
                  <div className="text-sm text-muted-foreground">Status</div>
                </div>
                <div className="bg-gradient-card border border-border/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent mb-1">Active</div>
                  <div className="text-sm text-muted-foreground">Community</div>
                </div>
                <div className="bg-gradient-card border border-border/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gaming-green mb-1">Live</div>
                  <div className="text-sm text-muted-foreground">Status</div>
                </div>
                <div className="bg-gradient-card border border-border/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gaming-blue mb-1">#{game.id}</div>
                  <div className="text-sm text-muted-foreground">Game ID</div>
                </div>
              </div>

              {/* Game Description */}
              <div className="bg-gradient-card border border-border/50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">About This Game</h3>
                <p className="text-muted-foreground mb-4">
                  {game.name} is a popular game on the Pixel Pilgrim platform. Experience the excitement and join thousands of other players in this engaging gaming experience.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Gaming</Badge>
                  <Badge variant="secondary">Pixel Pilgrim</Badge>
                  <Badge variant="secondary">Popular</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <CommentsSection gameId={game.id} gameName={game.name} />
      </main>
    </div>
  );
};

export default GameDetails;