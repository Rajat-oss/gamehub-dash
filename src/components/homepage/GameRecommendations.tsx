import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { gameRecommendationService, GameRecommendation } from '@/services/gameRecommendationService';
import { useAuth } from '@/contexts/AuthContext';
import { FaStar, FaGamepad, FaSync } from 'react-icons/fa';

export const GameRecommendations: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const recs = await gameRecommendationService.getRecommendations(user.uid);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [user]);

  if (!user) return null;

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FaGamepad className="w-5 h-5 mr-2 text-primary" />
            Recommended for You
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadRecommendations}
            disabled={loading}
          >
            <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendations.map((game) => (
              <div
                key={game.id}
                className="group cursor-pointer transition-transform hover:scale-105"
              >
                <div className="relative overflow-hidden rounded-lg bg-secondary/20">
                  <img
                    src={game.cover?.url || 'https://via.placeholder.com/300x400?text=No+Image'}
                    alt={game.name}
                    className="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-110"
                  />
                  {game.rating && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <FaStar className="w-3 h-3 mr-1 text-yellow-400" />
                      {Math.round(game.rating)}
                    </div>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  <h3 className="font-medium text-sm text-foreground line-clamp-2">
                    {game.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {game.reason}
                  </Badge>
                  {game.genres && game.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {game.genres.slice(0, 2).map((genre) => (
                        <Badge key={genre.id} variant="outline" className="text-xs">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FaGamepad className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No recommendations yet</p>
            <p className="text-sm">
              Add some games to your library or favorites to get personalized recommendations!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};