import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaStar, FaDownload, FaHeart, FaPlus } from 'react-icons/fa';
import { TwitchGame } from '@/lib/twitch';
import { addToFavorites, removeFromFavorites, isFavorite } from '@/lib/favorites';
import { useNavigate } from 'react-router-dom';

interface GameCardProps {
  game: TwitchGame;
  onRequest?: (gameId: string) => void;
  onLogGame?: (game: TwitchGame) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onRequest, onLogGame, isFavorite: propIsFavorite, onToggleFavorite }) => {
  const navigate = useNavigate();
  const [isGameFavorite, setIsGameFavorite] = React.useState(
    propIsFavorite !== undefined ? propIsFavorite : isFavorite(game.id)
  );

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onToggleFavorite) {
      onToggleFavorite();
      setIsGameFavorite(!isGameFavorite);
    } else {
      if (isGameFavorite) {
        removeFromFavorites(game.id);
        setIsGameFavorite(false);
      } else {
        addToFavorites(game);
        setIsGameFavorite(true);
      }
    }
  };


  const handleCardClick = () => {
    navigate(`/game/${game.id}`);
  };

  return (
    <Card className="group bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary overflow-hidden cursor-pointer" onClick={handleCardClick}>
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={game.box_art_url || 'https://via.placeholder.com/285x380?text=No+Image'}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Pixel Pilgrim Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-primary/80 backdrop-blur-sm text-white">
            <FaStar className="w-3 h-3 mr-1" />
            Pixel Pilgrim
          </Badge>
        </div>

        {/* Favorite Button */}
        <div className="absolute top-3 left-3">
          <Button
            size="sm"
            variant="secondary"
            className={`h-8 w-8 p-0 ${isGameFavorite ? 'bg-red-500/90 hover:bg-red-500 text-white' : 'bg-black/50 hover:bg-black/70 text-white'} backdrop-blur-sm border-0`}
            onClick={handleToggleFavorite}
          >
            <FaHeart className="w-3 h-3" />
          </Button>
        </div>

        {/* Action buttons on hover */}
        <div className="absolute bottom-3 left-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onRequest?.(game.id);
            }}
          >
            <FaDownload className="w-3 h-3 mr-2" />
            Request
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            className="bg-green-600/90 hover:bg-green-600 text-white border-0"
            onClick={(e) => {
              e.stopPropagation();
              onLogGame?.(game);
            }}
          >
            <FaPlus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {game.name}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3">
          Popular game on Pixel Pilgrim platform
        </p>

        <div className="flex flex-wrap gap-1">
          <Badge
            variant="secondary"
            className="text-xs bg-secondary/50 text-secondary-foreground"
          >
            Gaming
          </Badge>
          <Badge
            variant="secondary"
            className="text-xs bg-secondary/50 text-secondary-foreground"
          >
            Pixel Pilgrim
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};