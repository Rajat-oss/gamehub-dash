import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Game } from '@/services/igdbApi';
import { toast } from '@/hooks/use-toast';

interface GameRequestModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GameRequestModal: React.FC<GameRequestModalProps> = ({ game, isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game) return;

    setIsSubmitting(true);
    
    try {
      // Here you would typically send the request to your backend
      // For demo purposes, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Game requested!",
        description: `Your request for "${game.name}" has been submitted successfully.`,
      });
      
      setMessage('');
      onClose();
    } catch (error) {
      toast({
        title: "Request failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-primary bg-clip-text text-transparent">
            Request Game
          </DialogTitle>
          <DialogDescription>
            Submit a request for "{game.name}" to be added to the platform.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-secondary/30 rounded-lg">
            <img
              src={game.cover?.url || 'https://via.placeholder.com/64x64?text=No+Image'}
              alt={game.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <h3 className="font-semibold">{game.name}</h3>
              {game.genres && game.genres.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {game.genres.map(g => g.name).join(', ')}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Additional Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Any specific version, DLC, or additional information you'd like to include..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-secondary/50 border-border/50 focus:border-primary min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary hover:shadow-glow-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};