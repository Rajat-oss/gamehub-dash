import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FaStar, FaDownload, FaHeart } from 'react-icons/fa';
import { Game } from '@/services/igdbApi';

interface GameCardProps {
  game: Game;
  onRequest?: (gameId: number) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onRequest }) => {
  const formatRating = (rating?: number) => {
    if (!rating) return 'N/A';
    return Math.round(rating);
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return 'text-muted-foreground';
    if (rating >= 90) return 'text-gaming-green';
    if (rating >= 80) return 'text-gaming-blue';
    if (rating >= 70) return 'text-gaming-orange';
    return 'text-muted-foreground';
  };

  return (
    <Card className="group bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary overflow-hidden">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={game.cover?.url || 'https://via.placeholder.com/300x400?text=No+Image'}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        {game.rating && (
          <div className="absolute top-3 right-3">
            <Badge className={`bg-background/80 backdrop-blur-sm ${getRatingColor(game.rating)}`}>
              <FaStar className="w-3 h-3 mr-1" />
              {formatRating(game.rating)}
            </Badge>
          </div>
        )}

        {/* Action buttons on hover */}
        <div className="absolute bottom-3 left-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
            onClick={() => onRequest?.(game.id)}
          >
            <FaDownload className="w-3 h-3 mr-2" />
            Request
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-secondary/80 hover:bg-secondary"
          >
            <FaHeart className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {game.name}
        </h3>
        
        {game.summary && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
            {game.summary}
          </p>
        )}

        {game.genres && game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {game.genres.slice(0, 3).map((genre) => (
              <Badge
                key={genre.id}
                variant="secondary"
                className="text-xs bg-secondary/50 text-secondary-foreground"
              >
                {genre.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};