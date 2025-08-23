import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaStar, FaDownload, FaHeart, FaPlus } from 'react-icons/fa';
import { TwitchGame } from '@/lib/twitch';
import { addToFavorites, removeFromFavorites, isFavorite, addToUserFavorites, removeFromUserFavorites } from '@/lib/favorites';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface GameCardProps {
  game: TwitchGame;
  onRequest?: (gameId: string) => void;
  onLogGame?: (game: TwitchGame) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onRequest, onLogGame, isFavorite: propIsFavorite, onToggleFavorite }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isGameFavorite, setIsGameFavorite] = React.useState(false);
  
  React.useEffect(() => {
    if (propIsFavorite !== undefined) {
      setIsGameFavorite(propIsFavorite);
    } else {
      setIsGameFavorite(isFavorite(game.id));
    }
  }, [game.id, propIsFavorite]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onToggleFavorite) {
      onToggleFavorite();
      setIsGameFavorite(!isGameFavorite);
    } else {
      try {
        if (isGameFavorite) {
          removeFromFavorites(game.id);
          setIsGameFavorite(false);
          if (user) {
            await removeFromUserFavorites(user.uid, game.id);
          }
        } else {
          await addToFavorites(game);
          setIsGameFavorite(true);
          if (user) {
            await addToUserFavorites(user.uid, game.id);
          }
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        setIsGameFavorite(isGameFavorite);
      }
    }
  };

  const handleRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRequest?.(game.id);
  };

  const handleLogGame = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLogGame?.(game);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    navigate(`/game/${game.id}`);
  };

  return (
    <div className="cursor-pointer">
      <Card className="group bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary overflow-hidden h-full hover:scale-105" onClick={handleCardClick}>
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={game.box_art_url || 'https://via.placeholder.com/285x380?text=No+Image'}
            alt={game.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <Badge className="bg-primary/80 backdrop-blur-sm text-white text-xs px-1 py-0.5 sm:px-2 sm:py-1">
              <FaStar className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Pixel Pilgrim</span>
              <span className="sm:hidden">PP</span>
            </Badge>
          </div>

          <button
            className={`absolute top-2 left-2 sm:top-3 sm:left-3 h-6 w-6 sm:h-8 sm:w-8 rounded-md flex items-center justify-center ${isGameFavorite ? 'bg-red-500/90 hover:bg-red-500 text-white' : 'bg-black/50 hover:bg-black/70 text-white'} backdrop-blur-sm border-0 transition-colors z-20`}
            onClick={handleToggleFavorite}
          >
            <FaHeart className="w-2 h-2 sm:w-3 sm:h-3" />
          </button>

          <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex space-x-1 sm:space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 z-20">
            <button
              className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground text-xs h-7 sm:h-8 rounded-md flex items-center justify-center transition-colors"
              onClick={handleRequest}
            >
              <FaDownload className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
              <span className="hidden xs:inline sm:hidden md:inline">Request</span>
              <span className="xs:hidden sm:inline md:hidden">Add</span>
            </button>
            
            <button
              className="bg-green-600/90 hover:bg-green-600 text-white border-0 px-2 h-7 sm:h-8 rounded-md flex items-center justify-center transition-colors"
              onClick={handleLogGame}
            >
              <FaPlus className="w-2 h-2 sm:w-3 sm:h-3" />
            </button>
          </div>
        </div>

        <CardContent className="p-2 sm:p-3 md:p-4">
          <h3 className="font-semibold text-xs sm:text-sm md:text-lg mb-1 sm:mb-2 line-clamp-2 leading-tight hover:text-primary transition-colors duration-200">
            {game.name}
          </h3>
        
          <p className="text-xs text-muted-foreground mb-2 hidden md:block">
            Popular game on Pixel Pilgrim platform
          </p>

          <div className="flex flex-wrap gap-1">
            {game.genres && game.genres.length > 0 ? (
              game.genres.slice(0, 1).map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className="text-xs px-1 py-0.5 bg-secondary/50 text-secondary-foreground"
                >
                  {genre.length > 8 ? genre.substring(0, 8) + '...' : genre}
                </Badge>
              ))
            ) : (
              <Badge
                variant="secondary"
                className="text-xs px-1 py-0.5 bg-secondary/50 text-secondary-foreground"
              >
                Gaming
              </Badge>
            )}
            {game.genres && game.genres.length > 1 && (
              <Badge
                variant="secondary"
                className="text-xs px-1 py-0.5 bg-secondary/50 text-secondary-foreground"
              >
                +{game.genres.length - 1}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};