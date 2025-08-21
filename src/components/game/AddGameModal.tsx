import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gameLogService } from '@/services/gameLogService';
import { GameStatus, GameLogInput, GAME_STATUS_LABELS } from '@/types/gameLog';
import { searchGames, Game } from '@/services/igdbApi';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StarRating } from '@/components/ui/star-rating';
import { toast } from 'sonner';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameAdded?: () => void;
}

export const AddGameModal: React.FC<AddGameModalProps> = ({
  isOpen,
  onClose,
  onGameAdded
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState<GameLogInput>({
    gameId: '',
    gameName: '',
    gameImageUrl: '',
    status: 'want-to-play',
    rating: 0,
    notes: '',
    hoursPlayed: undefined,
    platform: '',
    genre: ''
  });

  const resetForm = () => {
    setFormData({
      gameId: '',
      gameName: '',
      gameImageUrl: '',
      status: 'want-to-play',
      rating: 0,
      notes: '',
      hoursPlayed: undefined,
      platform: '',
      genre: ''
    });
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const searchGamesDebounced = async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const results = await searchGames(searchQuery);
          setSearchResults(results.slice(0, 10));
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error searching games:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(searchGamesDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const selectGame = (game: Game) => {
    setFormData({
      ...formData,
      gameId: game.id.toString(),
      gameName: game.name,
      gameImageUrl: game.cover?.url || '',
      genre: game.genres?.map(g => g.name).join(', ') || ''
    });
    setSearchQuery(game.name);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to add games to your library');
      return;
    }

    if (!formData.gameName.trim()) {
      toast.error('Game name is required');
      return;
    }

    setIsLoading(true);
    try {
      const userName = user.displayName || user.email || 'Anonymous';
      
      // Generate a unique game ID if not provided
      const gameData = {
        ...formData,
        gameId: formData.gameId || `custom_${Date.now()}`,
        gameName: formData.gameName.trim()
      };
      
      await gameLogService.addGameLog(user.uid, gameData, userName);
      toast.success('Game added to your library!');
      
      if (onGameAdded) {
        onGameAdded();
      }
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error adding game:', error);
      
      let errorMessage = 'Failed to add game';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Database unavailable. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaPlus className="text-primary" />
            Add Game to Library
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Game Search */}
          <div className="space-y-2">
            <Label htmlFor="gameSearch">Search Game *</Label>
            <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    id="gameSearch"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setFormData({ ...formData, gameName: e.target.value });
                    }}
                    placeholder="Search for a game..."
                    className="pr-10"
                    required
                  />
                  <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandList>
                    {isSearching ? (
                      <CommandEmpty>Searching...</CommandEmpty>
                    ) : searchResults.length > 0 ? (
                      <CommandGroup>
                        {searchResults.map((game) => (
                          <CommandItem
                            key={game.id}
                            onSelect={() => selectGame(game)}
                            className="flex items-center gap-3 p-3 cursor-pointer"
                          >
                            {game.cover?.url && (
                              <img
                                src={game.cover.url}
                                alt={game.name}
                                className="w-8 h-10 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="font-medium">{game.name}</div>
                              {game.genres && (
                                <div className="text-sm text-muted-foreground">
                                  {game.genres.map(g => g.name).join(', ')}
                                </div>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : searchQuery.length > 2 ? (
                      <CommandEmpty>No games found.</CommandEmpty>
                    ) : null}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Selected Game Preview */}
          {formData.gameImageUrl && (
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
              <img 
                src={formData.gameImageUrl} 
                alt={formData.gameName}
                className="w-12 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold">{formData.gameName}</h3>
                {formData.genre && (
                  <p className="text-sm text-muted-foreground">{formData.genre}</p>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: GameStatus) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GAME_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <StarRating
              rating={formData.rating || 0}
              onRatingChange={(rating) => setFormData({ ...formData, rating })}
              showLabel
              size="lg"
            />
          </div>

          {/* Hours Played */}
          <div className="space-y-2">
            <Label htmlFor="hoursPlayed">Hours Played</Label>
            <Input
              id="hoursPlayed"
              type="number"
              min="0"
              step="0.5"
              value={formData.hoursPlayed || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                hoursPlayed: e.target.value ? parseFloat(e.target.value) : undefined 
              })}
              placeholder="0"
            />
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Input
              id="platform"
              value={formData.platform || ''}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              placeholder="e.g., PC, PlayStation 5, Xbox Series X"
            />
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              value={formData.genre || ''}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              placeholder="e.g., Action, RPG, Adventure"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Your thoughts about this game..."
              rows={3}
            />
          </div>
        </form>

        <DialogFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add to Library'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};