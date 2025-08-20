import React, { useState, useEffect } from 'react';
import { GameCard } from './GameCard';
import { getFavorites, removeFromFavorites } from '@/lib/favorites';
import { TwitchGame } from '@/lib/twitch';
import { FaHeart, FaGamepad } from 'react-icons/fa';

interface FavoritesSectionProps {
  onGameRequest: (gameId: string) => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onGameRequest }) => {
  const [favorites, setFavorites] = useState<TwitchGame[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const handleRemoveFromFavorites = (gameId: string) => {
    removeFromFavorites(gameId);
    setFavorites(prev => prev.filter(game => game.id !== gameId));
  };

  // Refresh favorites when component mounts or updates
  const refreshFavorites = () => {
    setFavorites(getFavorites());
  };

  // Listen for storage changes to update favorites in real-time
  React.useEffect(() => {
    const handleStorageChange = () => {
      refreshFavorites();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="mb-12">
      <div className="flex items-center space-x-3 mb-6">
        <FaHeart className="text-red-500 text-2xl" />
        <h2 className="text-2xl font-bold text-foreground">My Favorites</h2>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {favorites.map((game) => (
            <div key={game.id} className="relative">
              <GameCard
                game={game}
                onRequest={onGameRequest}
                isFavorite={true}
                onToggleFavorite={() => handleRemoveFromFavorites(game.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-card border border-border/50 rounded-lg">
          <FaGamepad className="text-6xl text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground">
            Add games to your favorites from the marketplace below
          </p>
        </div>
      )}
    </div>
  );
};