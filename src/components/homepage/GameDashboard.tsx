import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { GameCard } from './GameCard';
import { GameRequestModal } from './GameRequestModal';
import { GameLogModal } from '@/components/game/GameLogModal';
import { ActivityFeed } from './ActivityFeed';
import { GameRecommendations } from './GameRecommendations';
import { motion } from 'framer-motion';


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
    <div className="min-h-screen bg-background">
      <Navbar onSearch={handleSearch} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Modern Hero Section */}
        <section className="mb-16">
          <div className="relative overflow-hidden bg-gradient-to-br from-card via-muted/30 to-card backdrop-blur-sm border border-border rounded-3xl">
            <div className="absolute inset-0 opacity-40">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>
            
            <div className="relative p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      Live Gaming Platform
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tight">
                      <span className="bg-gradient-to-r from-foreground via-foreground/80 to-muted-foreground bg-clip-text text-transparent">
                        Discover
                      </span>
                      <br />
                      <span className="bg-gradient-to-r from-primary via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        Epic Games
                      </span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                      Explore curated collections, trending titles, and hidden gems. 
                      Your next gaming adventure starts here.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      <FaGamepad className="w-5 h-5 mr-2" />
                      Browse Library
                    </Button>
                    <Link to="/community">
                      <Button size="lg" variant="outline" className="border-border hover:bg-muted/50">
                        <FaUser className="w-4 h-4 mr-2" />
                        Join Community
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="lg:w-80">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="group cursor-pointer">
                      <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-4 hover:scale-105 transition-transform duration-300">
                        <FaFire className="text-red-400 text-2xl mb-3" />
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground text-sm">Trending</p>
                          <p className="text-xs text-muted-foreground">Hot right now</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group cursor-pointer">
                      <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-2xl p-4 hover:scale-105 transition-transform duration-300">
                        <FaTrophy className="text-yellow-400 text-2xl mb-3" />
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground text-sm">Top Rated</p>
                          <p className="text-xs text-muted-foreground">Highest scores</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group cursor-pointer">
                      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4 hover:scale-105 transition-transform duration-300">
                        <FaPlus className="text-green-400 text-2xl mb-3" />
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground text-sm">New</p>
                          <p className="text-xs text-muted-foreground">Fresh releases</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>




        {/* Enhanced Games Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                <Skeleton className="h-[200px] sm:h-[250px] w-full rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10" />
                <Skeleton className="h-4 w-full bg-secondary/20 rounded-full" />
                <Skeleton className="h-3 w-3/4 bg-secondary/15 rounded-full" />
              </div>
            ))}
          </div>
        ) : games.length > 0 ? (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            {games.map((game, index) => (
              <motion.div 
                key={`${game.id}-${refreshKey}`}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 2 + (index * 0.1), 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -5, 
                  transition: { duration: 0.2 } 
                }}
                whileTap={{ scale: 0.95 }}
              >
                <GameCard
                  game={game}
                  onRequest={handleGameRequest}
                  onLogGame={handleGameLog}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="relative mb-6">
              <FaGamepad className="text-6xl text-muted-foreground mx-auto animate-bounce" />
              <div className="absolute inset-0 text-6xl text-primary/20 mx-auto animate-ping">🎮</div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">
              No games found
            </h3>
            <p className="text-muted-foreground text-lg mb-6">
              Try a different search or explore our trending games
            </p>
            <Button onClick={loadGames} className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300">
              🔄 Refresh Games
            </Button>
          </div>
        )}


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