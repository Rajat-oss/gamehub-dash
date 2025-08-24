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
    <div className="min-h-screen bg-[#000000]">
      <Navbar onSearch={handleSearch} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Enhanced Header with Animation */}
        <motion.div 
          className="mb-8 sm:mb-12 relative overflow-hidden"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-3xl blur-3xl animate-pulse"></div>
          <div className="relative bg-[#000000] border border-[#9A9A9A]/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
              <motion.div 
                className="relative"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <FaGamepad className="text-primary text-3xl sm:text-4xl" />
                <div className="absolute -inset-1 bg-primary/20 rounded-full blur animate-ping"></div>
              </motion.div>
              <div>
                <motion.h1 
                  className="text-3xl sm:text-4xl font-bold text-[#FFFFFF]"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Game Marketplace
                </motion.h1>
                <motion.div 
                  className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full mt-2"
                  initial={{ width: 0 }}
                  animate={{ width: 80 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                ></motion.div>
              </div>
            </div>
            <motion.p 
              className="text-[#9A9A9A] text-lg sm:text-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              🎮 Discover amazing games • 🚀 Request your favorites • 🌟 Join the community
            </motion.p>
          </div>
        </motion.div>

        {/* Enhanced Action Bar */}
        <motion.div 
          className="mb-8 sm:mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge variant="secondary" className="text-sm px-4 py-2 bg-[#000000] border-[#9A9A9A]/40 text-[#FFFFFF] animate-pulse">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FaFire className="w-4 h-4 mr-2" />
                </motion.div>
                <span className="hidden sm:inline">🔥 Trending Now</span>
                <span className="sm:hidden">🔥 Hot</span>
              </Badge>
            </motion.div>
          </div>
          
          <Link to="/community">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                <FaUser className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Join Community</span>
                <span className="sm:hidden">Community</span>
              </Button>
            </motion.div>
          </Link>
        </motion.div>


        {/* Game Recommendations */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <GameRecommendations />
        </motion.div>

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
            <h3 className="text-2xl font-bold mb-3 text-[#FFFFFF]">
              No games found
            </h3>
            <p className="text-[#9A9A9A] text-lg mb-6">
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