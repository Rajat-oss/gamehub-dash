import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gameLogService } from '@/services/gameLogService';
import { GameLog, GameStatus, GAME_STATUS_LABELS, GAME_STATUS_COLORS, GameLogStats } from '@/types/gameLog';
import { Navbar } from '@/components/homepage/Navbar';
import { GameLogModal } from '@/components/game/GameLogModal';


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StarRating } from '@/components/ui/star-rating';
import { toast } from 'sonner';
import { 
  FaGamepad, 
  FaFilter, 
  FaEdit, 
  FaTrash, 
  FaStar,
  FaTrophy,
  FaPlay,
  FaClock,
  FaListUl,
  FaTimes,
  FaArrowLeft,
  FaPlus
} from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const MyGames: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameLogs, setGameLogs] = useState<GameLog[]>([]);
  const [filteredGameLogs, setFilteredGameLogs] = useState<GameLog[]>([]);
  const [stats, setStats] = useState<GameLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | 'all'>('all');
  const [selectedGameLog, setSelectedGameLog] = useState<GameLog | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  useEffect(() => {
    if (user) {
      loadUserGameLogs();
    }
  }, [user]);

  useEffect(() => {
    filterGameLogs();
  }, [gameLogs, selectedStatus]);

  const loadUserGameLogs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('User object:', user);
      console.log('User UID:', user.uid);
      
      const [userLogs, userStats] = await Promise.all([
        gameLogService.getUserGameLogs(user.uid),
        gameLogService.getUserGameLogStats(user.uid)
      ]);
      
      console.log('Loaded logs:', userLogs);
      setGameLogs(userLogs);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading user game logs:', error);
      
      let errorMessage = 'Failed to load your games';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules in Firebase Console.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterGameLogs = () => {
    if (selectedStatus === 'all') {
      setFilteredGameLogs(gameLogs);
    } else {
      setFilteredGameLogs(gameLogs.filter(log => log.status === selectedStatus));
    }
  };

  const handleDeleteGame = async (gameLog: GameLog) => {
    if (!window.confirm(`Are you sure you want to remove "${gameLog.gameName}" from your library?`)) {
      return;
    }

    try {
      await gameLogService.deleteGameLog(gameLog.id);
      toast.success('Game removed from your library');
      loadUserGameLogs();
    } catch (error) {
      console.error('Error deleting game log:', error);
      toast.error('Failed to remove game');
    }
  };

  const handleEditGame = (gameLog: GameLog) => {
    // Convert GameLog to TwitchGame format for the modal
    const gameForModal = {
      id: gameLog.gameId,
      name: gameLog.gameName,
      box_art_url: gameLog.gameImageUrl
    };
    setSelectedGameLog(gameForModal as any);
    setIsEditModalOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <FaGamepad className="text-6xl text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Please log in</h2>
          <p className="text-muted-foreground">You need to be logged in to view your game library.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/homepage')}
            className="flex items-center gap-2"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Button>
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FaGamepad className="text-primary text-3xl" />
              <h1 className="text-3xl font-bold text-foreground">My Games</h1>
            </div>
            <Button 
              onClick={() => navigate('/homepage')}
              className="flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Browse Games
            </Button>
          </div>
          <p className="text-muted-foreground text-lg">
            Track and manage your gaming library
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full bg-secondary/30" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 bg-secondary/30" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                <Card className="bg-gradient-card border-border/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">{stats.totalGames}</div>
                    <div className="text-sm text-muted-foreground">Total Games</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-card border-border/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500 mb-1">{stats.completed}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500 mb-1">{stats.playing}</div>
                    <div className="text-sm text-muted-foreground">Playing</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-500 mb-1">{stats.wantToPlay}</div>
                    <div className="text-sm text-muted-foreground">Want to Play</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-500 mb-1">{stats.onHold}</div>
                    <div className="text-sm text-muted-foreground">On Hold</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/50">
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FaStar className="text-yellow-400 text-lg" />
                      <span className="text-2xl font-bold text-accent">
                        {stats.averageRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filter */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <FaFilter className="text-muted-foreground" />
                <span className="text-sm font-medium">Filter by status:</span>
              </div>
              <Select value={selectedStatus} onValueChange={(value: GameStatus | 'all') => setSelectedStatus(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  {Object.entries(GAME_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStatus !== 'all' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedStatus('all')}
                >
                  <FaTimes className="w-3 h-3 mr-1" />
                  Clear filter
                </Button>
              )}
            </div>

            {/* Games Grid */}
            {filteredGameLogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGameLogs.map((gameLog) => (
                  <Card key={gameLog.id} className="bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300">
                    <CardContent className="p-0">
                      {/* Game Image */}
                      {gameLog.gameImageUrl && (
                        <div className="aspect-[3/4] w-full overflow-hidden rounded-t-lg">
                          <img 
                            src={gameLog.gameImageUrl}
                            alt={gameLog.gameName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Game Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{gameLog.gameName}</h3>
                        
                        {/* Status Badge */}
                        <Badge 
                          className={cn(
                            'mb-3 text-white',
                            GAME_STATUS_COLORS[gameLog.status]
                          )}
                        >
                          {GAME_STATUS_LABELS[gameLog.status]}
                        </Badge>

                        {/* Rating */}
                        {gameLog.rating && gameLog.rating > 0 && (
                          <div className="mb-3">
                            <StarRating rating={gameLog.rating} readonly size="sm" />
                          </div>
                        )}

                        {/* Details */}
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          {gameLog.hoursPlayed && (
                            <div className="flex items-center gap-2">
                              <FaClock className="w-3 h-3" />
                              <span>{gameLog.hoursPlayed} hours</span>
                            </div>
                          )}
                          
                          {gameLog.platform && (
                            <div className="flex items-center gap-2">
                              <FaGamepad className="w-3 h-3" />
                              <span>{gameLog.platform}</span>
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            Updated: {gameLog.dateUpdated.toLocaleDateString()}
                          </div>
                        </div>

                        {/* Notes */}
                        {gameLog.notes && (
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground line-clamp-2 italic">
                              "{gameLog.notes}"
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleEditGame(gameLog)}
                          >
                            <FaEdit className="w-3 h-3 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-400 hover:text-red-300 hover:bg-red-950"
                            onClick={() => handleDeleteGame(gameLog)}
                          >
                            <FaTrash className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaGamepad className="text-6xl text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {selectedStatus === 'all' ? 'No games in your library' : `No ${GAME_STATUS_LABELS[selectedStatus as GameStatus]?.toLowerCase()} games`}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {selectedStatus === 'all' 
                    ? 'Start building your game library by adding games from the marketplace!'
                    : 'Try changing the filter or add more games to your library.'
                  }
                </p>
                {selectedStatus !== 'all' && (
                  <Button variant="outline" onClick={() => setSelectedStatus('all')}>
                    Show All Games
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Edit Game Modal */}
      <GameLogModal
        game={selectedGameLog}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedGameLog(null);
        }}
        onGameLogged={() => {
          loadUserGameLogs();
        }}
      />


    </div>
  );
};

export default MyGames;
