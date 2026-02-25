import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gameLogService } from '@/services/gameLogService';
import { GameStatus, GameLogInput, GAME_STATUS_LABELS, GameLog } from '@/types/gameLog';
import { TwitchGame } from '@/lib/twitch';
import { stopLenis, startLenis } from '@/components/SmoothScroll';

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
import { FaGamepad, FaTrash } from 'react-icons/fa';
import { Separator } from '@/components/ui/separator';

interface GameLogModalProps {
  game: TwitchGame | null;
  isOpen: boolean;
  onClose: () => void;
  onGameLogged?: () => void;
}

export const GameLogModal: React.FC<GameLogModalProps> = ({
  game,
  isOpen,
  onClose,
  onGameLogged
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [existingLog, setExistingLog] = useState<GameLog | null>(null);
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

  // Reset form when modal opens/closes or game changes
  useEffect(() => {
    if (game && isOpen) {
      setFormData({
        gameId: game.id,
        gameName: game.name,
        gameImageUrl: game.box_art_url?.replace('{width}', '300').replace('{height}', '400') || '',
        status: 'want-to-play',
        rating: 0,
        notes: '',
        hoursPlayed: undefined,
        platform: '',
        genre: ''
      });

      // Check if game is already logged
      if (user) {
        checkExistingLog();
      }
    }
  }, [game, isOpen, user]);

  // Handle Lenis scroll locking
  useEffect(() => {
    if (isOpen) {
      stopLenis();
    } else {
      startLenis();
    }
    return () => startLenis(); // Ensure Lenis is restarted if component unmounts
  }, [isOpen]);

  const checkExistingLog = async () => {
    if (!user || !game) return;

    try {
      const existingGameLog = await gameLogService.isGameLogged(user.uid, game.id);
      if (existingGameLog) {
        setExistingLog(existingGameLog);
        setFormData({
          gameId: existingGameLog.gameId,
          gameName: existingGameLog.gameName,
          gameImageUrl: existingGameLog.gameImageUrl || '',
          status: existingGameLog.status,
          rating: existingGameLog.rating || 0,
          notes: existingGameLog.notes || '',
          hoursPlayed: existingGameLog.hoursPlayed,
          platform: existingGameLog.platform || '',
          genre: existingGameLog.genre || ''
        });
      } else {
        setExistingLog(null);
      }
    } catch (error) {
      console.error('Error checking existing log:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !game) {
      toast.error('Please sign in to save games to your library');
      return;
    }

    setIsLoading(true);
    try {
      const userName = user.displayName || user.email || 'Anonymous';

      if (existingLog) {
        // Update existing log
        await gameLogService.updateGameLog(existingLog.id, formData, userName);
        toast.success('Game log updated successfully!');
      } else {
        // Create new log
        await gameLogService.addGameLog(user.uid, formData, userName);
        toast.success('Game added to your library!');
      }

      if (onGameLogged) {
        onGameLogged();
      }
      onClose();
    } catch (error) {
      console.error('Error saving game log:', error);

      // More specific error handling
      let errorMessage = 'Failed to save game log';
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

  const handleDelete = async () => {
    if (!existingLog) return;

    if (!window.confirm('Are you sure you want to remove this game from your library?')) {
      return;
    }

    setIsLoading(true);
    try {
      await gameLogService.deleteGameLog(existingLog.id);
      toast.success('Game removed from your library');
      if (onGameLogged) {
        onGameLogged();
      }
      onClose();
    } catch (error) {
      console.error('Error deleting game log:', error);
      toast.error('Failed to remove game');
    } finally {
      setIsLoading(false);
    }
  };

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
        data-lenis-prevent
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FaGamepad className="text-primary" />
            {existingLog ? 'Update Game Log' : 'Log Game'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Game Info Display */}
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
            {formData.gameImageUrl && (
              <img
                src={formData.gameImageUrl}
                alt={formData.gameName}
                className="w-12 h-16 object-cover rounded"
              />
            )}
            <div>
              <h3 className="font-semibold">{formData.gameName}</h3>
              <p className="text-sm text-muted-foreground">Game ID: {formData.gameId}</p>
            </div>
          </div>

          <Separator />

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

        <DialogFooter className="flex justify-between">
          <div>
            {existingLog && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <FaTrash className="w-3 h-3 mr-2" />
                Remove
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Saving...' : existingLog ? 'Update' : 'Add to Library'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
