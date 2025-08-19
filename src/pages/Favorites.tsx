import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/dashboard/Navbar';
import { GameCard } from '@/components/dashboard/GameCard';
import { GameRequestModal } from '@/components/dashboard/GameRequestModal';
import { getFavorites, removeFromFavorites } from '@/lib/favorites';
import { TwitchGame } from '@/lib/twitch';
import { FaHeart, FaGamepad, FaArrowLeft } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const [favorites, setFavorites] = useState<TwitchGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<TwitchGame | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleRemoveFromFavorites = (gameId: string) => {
    removeFromFavorites(gameId);
    setFavorites(prev => prev.filter(game => game.id !== gameId));
  };

  // Listen for storage changes to update favorites in real-time
  React.useEffect(() => {
    const handleStorageChange = () => {
      setFavorites(getFavorites());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleGameRequest = (gameId: string) => {
    const game = favorites.find(g => g.id === gameId);
    if (game) {
      setSelectedGame(game);
      setIsRequestModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4">
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <FaHeart className="text-red-500 text-3xl" />
            <h1 className="text-3xl font-bold text-foreground">My Favorites</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Your collection of favorite games
          </p>
        </div>

        {/* Games Grid */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favorites.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onRequest={handleGameRequest}
                isFavorite={true}
                onToggleFavorite={() => handleRemoveFromFavorites(game.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-card border border-border/50 rounded-lg">
            <FaGamepad className="text-6xl text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Add games to your favorites from the marketplace
            </p>
            <Link to="/dashboard">
              <Button className="bg-gradient-primary hover:shadow-glow-primary">
                Browse Games
              </Button>
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-card border border-border/50 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">{favorites.length}</div>
            <div className="text-muted-foreground">Favorite Games</div>
          </div>
          <div className="bg-gradient-card border border-border/50 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-accent mb-2">Personal</div>
            <div className="text-muted-foreground">Collection</div>
          </div>
          <div className="bg-gradient-card border border-border/50 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-gaming-green mb-2">Curated</div>
            <div className="text-muted-foreground">By You</div>
          </div>
        </div>
      </main>

      <GameRequestModal
        game={selectedGame}
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setSelectedGame(null);
        }}
      />
    </div>
  );
};

export default Favorites;