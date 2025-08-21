import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { GameCard } from './GameCard';
import { GameRequestModal } from './GameRequestModal';
import { GameLogModal } from '@/components/game/GameLogModal';
import { ActivityFeed } from './ActivityFeed';


import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TwitchGame, getTopGames, searchGames as searchTwitchGames } from '@/lib/twitch';
import { FaFire, FaTrophy, FaGamepad, FaPlus, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const GameDashboard: React.FC = () => {
  const [games, setGames] = useState<TwitchGame[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<TwitchGame | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedGameForLog, setSelectedGameForLog] = useState<TwitchGame | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);


  useEffect(() => {
    loadGames();
  }, []);


  const loadGames = async () => {
    setLoading(true);
    try {
      const gameData = await getTopGames(100);
      setGames(gameData);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadGames();
      toast.success('Showing all games', {
        description: 'Browse through the top games'
      });
      return;
    }

    setLoading(true);
    try {
      const results = await searchTwitchGames(query);
      setGames(results);
      toast.success(`Found ${results.length} games`, {
        description: `Search results for "${query}"`
      });
    } catch (error) {
      console.error('Error searching games:', error);
      toast.error('Failed to search games', {
        description: 'Please try again or check your connection'
      });
    } finally {
      setLoading(false);
    }
  };
  


  const handleGameRequest = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (game) {
      setSelectedGame(game);
      setIsRequestModalOpen(true);
    }
  };

  const handleGameLog = (game: TwitchGame) => {
    setSelectedGameForLog(game);
    setIsLogModalOpen(true);
  };

  const filterButtons = [
    { key: 'popular' as const, label: 'Popular', icon: FaFire },
    { key: 'top-rated' as const, label: 'Top Rated', icon: FaTrophy },
    { key: 'new' as const, label: 'New Releases', icon: FaPlus },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={handleSearch} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <FaGamepad className="text-primary text-2xl sm:text-3xl" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Game Marketplace</h1>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg">
            Discover and request your favorite games from our curated collection
          </p>
        </div>

        {/* Community Button */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <Badge variant="secondary" className="text-xs sm:text-sm">
            <FaFire className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Top Games on Pixel Pilgrim</span>
            <span className="sm:hidden">Top Games</span>
          </Badge>
          
          <Link to="/community">
            <Button variant="outline" className="border-primary/50 hover:bg-primary/10 w-full sm:w-auto text-sm" size="sm">
              <FaUser className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Gaming Community</span>
              <span className="sm:hidden">Community</span>
            </Button>
          </Link>
        </div>


        {/* Games Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[300px] w-full rounded-lg bg-secondary/30" />
                <Skeleton className="h-4 w-full bg-secondary/30" />
                <Skeleton className="h-4 w-3/4 bg-secondary/30" />
              </div>
            ))}
          </div>
        ) : games.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {games.map((game) => (
              <GameCard
                key={`${game.id}-${refreshKey}`}
                game={game}
                onRequest={handleGameRequest}
                onLogGame={handleGameLog}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaGamepad className="text-6xl text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No games found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or browse our popular games
            </p>
          </div>
        )}

        {/* Activity Feed */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            {/* Placeholder for future content */}
          </div>
          
          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <ActivityFeed 
              title="Community Activity" 
              maxItems={10}
              showUserInfo={true}
            />
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
      
      <GameLogModal
        game={selectedGameForLog}
        isOpen={isLogModalOpen}
        onClose={() => {
          setIsLogModalOpen(false);
          setSelectedGameForLog(null);
        }}
        onGameLogged={() => {
          // Optionally refresh data or show success message
          setRefreshKey(prev => prev + 1);
        }}
      />
    </div>
  );
};