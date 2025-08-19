import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { GameCard } from './GameCard';
import { GameRequestModal } from './GameRequestModal';
import { GameLogModal } from '@/components/game/GameLogModal';
import { ActivityFeed } from './ActivityFeed';
import { GameFilters } from './GameFilters';

export interface GameFiltersType {
  genre: string;
  platform: string;
  rating: string;
}

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TwitchGame, getTopGames, searchGames as searchTwitchGames } from '@/lib/twitch';
import { FaFire, FaTrophy, FaGamepad, FaPlus, FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const GameDashboard: React.FC = () => {
  const [games, setGames] = useState<TwitchGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<TwitchGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<TwitchGame | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedGameForLog, setSelectedGameForLog] = useState<TwitchGame | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<GameFiltersType>({
    genre: 'all',
    platform: 'all',
    rating: 'all'
  });

  useEffect(() => {
    loadGames();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [games, filters]);

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
  
  const applyFilters = () => {
    let filtered = [...games];
    
    // Apply genre filter
    if (filters.genre && filters.genre !== 'all') {
      filtered = filtered.filter(game => 
        game.genres?.some(genre => 
          genre.toLowerCase().includes(filters.genre.toLowerCase())
        )
      );
    }
    
    // Apply platform filter
    if (filters.platform && filters.platform !== 'all') {
      filtered = filtered.filter(game => 
        game.platforms?.some(platform => 
          platform.toLowerCase().includes(filters.platform.toLowerCase())
        )
      );
    }
    
    setFilteredGames(filtered);
  };
  
  const handleFilterChange = (newFilters: GameFiltersType) => {
    setFilters(newFilters);
    const activeFilters = Object.values(newFilters).filter(Boolean).length;
    if (activeFilters > 0) {
      toast.success('Filters applied', {
        description: `${activeFilters} filter(s) active`
      });
    }
  };
  
  const handleClearFilters = () => {
    setFilters({ genre: 'all', platform: 'all', rating: 'all' });
    toast.success('Filters cleared', {
      description: 'Showing all games'
    });
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
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <FaGamepad className="text-primary text-3xl" />
            <h1 className="text-3xl font-bold text-foreground">Game Marketplace</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover and request your favorite games from our curated collection
          </p>
        </div>

        {/* Community Button */}
        <div className="mb-8 flex items-center justify-between">
          <Badge variant="secondary" className="text-sm">
            <FaFire className="w-4 h-4 mr-2" />
            Top Games on Pixel Pilgrim
          </Badge>
          
          <Link to="/community">
            <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
              <FaUser className="w-4 h-4 mr-2" />
              Gaming Community
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <GameFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
        
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
        ) : (filteredGames.length > 0 ? filteredGames : games).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {(filteredGames.length > 0 ? filteredGames : games).map((game) => (
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

        {/* Stats and Activity Feed */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-card border border-border/50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">{games.length}+</div>
              <div className="text-muted-foreground">Games Available</div>
            </div>
            <div className="bg-gradient-card border border-border/50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">Live</div>
              <div className="text-muted-foreground">Pixel Pilgrim Data</div>
            </div>
            <div className="bg-gradient-card border border-border/50 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-gaming-green mb-2">Real-time</div>
              <div className="text-muted-foreground">Updates</div>
            </div>
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