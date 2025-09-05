import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/homepage/Navbar';
import { GameCard } from '@/components/homepage/GameCard';
import { GameRequestModal } from '@/components/homepage/GameRequestModal';
import { GameLogModal } from '@/components/game/GameLogModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TwitchGame, searchGames as searchTwitchGames } from '@/lib/twitch';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [games, setGames] = useState<TwitchGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<TwitchGame | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedGameForLog, setSelectedGameForLog] = useState<TwitchGame | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  useEffect(() => {
    if (query) {
      searchGames(query);
    }
  }, [query]);

  const searchGames = async (searchQuery: string) => {
    setLoading(true);
    try {
      const results = await searchTwitchGames(searchQuery);
      setGames(results);
    } catch (error) {
      console.error('Error searching games:', error);
      toast.error('Failed to search games');
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

  return (
    <div className="min-h-screen bg-[#000000]">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/homepage">
            <Button variant="ghost" className="mb-4">
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <FaSearch className="text-primary text-2xl" />
            <div>
              <h1 className="text-3xl font-bold">Search Results</h1>
              <p className="text-muted-foreground">
                {loading ? 'Searching...' : `${games.length} results for "${query}"`}
              </p>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <Skeleton className="h-[200px] sm:h-[250px] w-full rounded-xl" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : games.length > 0 ? (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {games.map((game, index) => (
              <motion.div 
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
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
          <div className="text-center py-16">
            <FaSearch className="text-6xl text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-3">No games found</h3>
            <p className="text-muted-foreground text-lg mb-6">
              Try searching with different keywords or browse our popular games
            </p>
            <Link to="/homepage">
              <Button>Browse All Games</Button>
            </Link>
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
          toast.success('Game added to your library!');
        }}
      />
    </div>
  );
};

export default SearchResults;