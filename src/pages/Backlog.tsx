import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gameLogService } from '@/services/gameLogService';
import { GameLog, GAME_STATUS_COLORS } from '@/types/gameLog';
import { Navbar } from '@/components/homepage/Navbar';
import { GameLogModal } from '@/components/game/GameLogModal';
import { FaBookmark, FaGamepad, FaArrowLeft, FaFilter, FaPlus, FaTrophy, FaStar } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const Backlog = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [backlogGames, setBacklogGames] = useState<GameLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState<any | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            loadBacklog();
        }
    }, [user]);

    const loadBacklog = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const logs = await gameLogService.getUserGameLogsByStatus(user.uid, 'want-to-play');
            setBacklogGames(logs);
        } catch (error) {
            console.error('Error loading backlog:', error);
            toast.error('Failed to load backlog');
        } finally {
            setLoading(false);
        }
    };

    const handleEditGame = (gameLog: GameLog) => {
        setSelectedGame({
            id: gameLog.gameId,
            name: gameLog.gameName,
            box_art_url: gameLog.gameImageUrl
        });
        setIsEditModalOpen(true);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <FaBookmark className="text-6xl text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Please log in</h2>
                    <p className="text-muted-foreground">You need to be logged in to view your backlog.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar onSearch={() => { }} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/homepage">
                        <Button variant="ghost" className="mb-4">
                            <FaArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <FaBookmark className="text-blue-500 text-3xl" />
                            <h1 className="text-3xl font-bold text-foreground">My Backlog</h1>
                        </div>
                        <div className="bg-blue-500/10 text-blue-500 px-4 py-1 rounded-full text-sm font-bold border border-blue-500/20">
                            {backlogGames.length} Games
                        </div>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Games you're planning to play soon
                    </p>
                </div>

                {/* Games Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-[250px] w-full rounded-xl" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-3/4" />
                            </div>
                        ))}
                    </div>
                ) : backlogGames.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                        {backlogGames.map((gameLog) => (
                            <motion.div
                                key={gameLog.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="group bg-card border-border hover:border-blue-500/50 transition-all duration-300 overflow-hidden h-full">
                                    <CardContent className="p-0 relative">
                                        {/* Game Image */}
                                        {gameLog.gameImageUrl && (
                                            <div className="aspect-[3/4] w-full overflow-hidden">
                                                <img
                                                    src={gameLog.gameImageUrl}
                                                    alt={gameLog.gameName}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </div>
                                        )}

                                        {/* Hover Actions */}
                                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                            <Button
                                                size="sm"
                                                className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                                                onClick={() => handleEditGame(gameLog)}
                                            >
                                                Update Stats
                                            </Button>
                                        </div>

                                        {/* Game Info */}
                                        <div className="p-3 sm:p-4">
                                            <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-1">{gameLog.gameName}</h3>
                                            <div className="flex items-center justify-between">
                                                <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 text-[10px] uppercase tracking-wider">
                                                    Backlog
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                    {new Date(gameLog.dateAdded).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card border border-border border-dashed rounded-xl">
                        <FaBookmark className="text-6xl text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-foreground">Your backlog is empty</h3>
                        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                            Add games you want to play later from the marketplace using the bookmark button!
                        </p>
                        <Link to="/homepage">
                            <Button size="lg" className="bg-primary hover:bg-primary/90">
                                Browse Games
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Stats Placeholder */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-6 text-center">
                        <FaGamepad className="text-blue-500 text-2xl mx-auto mb-3" />
                        <div className="text-3xl font-bold text-foreground mb-1">{backlogGames.length}</div>
                        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Games in Backlog</div>
                    </div>
                    <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-6 text-center">
                        <FaStar className="text-green-500 text-2xl mx-auto mb-3" />
                        <div className="text-3xl font-bold text-foreground mb-1">Queue</div>
                        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Ready to Play</div>
                    </div>
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-6 text-center">
                        <FaTrophy className="text-purple-500 text-2xl mx-auto mb-3" />
                        <div className="text-3xl font-bold text-foreground mb-1">Goal</div>
                        <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Finish Everything</div>
                    </div>
                </div>
            </main>

            <GameLogModal
                game={selectedGame}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedGame(null);
                }}
                onGameLogged={() => {
                    loadBacklog();
                }}
            />
        </div>
    );
};

export default Backlog;
