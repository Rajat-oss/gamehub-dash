import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { postService } from '@/services/postService';
import { userService } from '@/services/userService';
import { toast } from '@/hooks/use-toast';
import { FaImage, FaTimes } from 'react-icons/fa';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [gameTitle, setGameTitle] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || (!content.trim() && !mediaFile)) {
      toast({
        title: "Invalid post",
        description: "Please add some content or media",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const userProfile = await userService.getUserProfile(user.uid);
      
      await postService.createPost(
        user.uid,
        userProfile?.username || user.displayName || 'Anonymous',
        userProfile?.photoURL || user.photoURL || undefined,
        {
          content: content.trim(),
          mediaFile: mediaFile || undefined,
          gameTitle: gameTitle.trim() || undefined
        }
      );

      toast({
        title: "Post created!",
        description: "Your post has been shared successfully"
      });

      setContent('');
      setGameTitle('');
      setMediaFile(null);
      setMediaPreview('');
      
      onPostCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">What's on your mind?</Label>
            <Textarea
              id="content"
              placeholder="Share your gaming experience..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="gameTitle">Game (Optional)</Label>
            <Input
              id="gameTitle"
              placeholder="What game are you playing?"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
            />
          </div>

          <div>
            <Label>Media (Optional)</Label>
            <div className="flex gap-2 mt-2">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="media-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('media-upload')?.click()}
              >
                <FaImage className="w-4 h-4 mr-2" />
                Add Photo/Video
              </Button>
            </div>
            
            {mediaPreview && (
              <div className="mt-3 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70"
                >
                  <FaTimes className="w-3 h-3" />
                </Button>
                {mediaFile?.type.startsWith('video/') ? (
                  <video
                    src={mediaPreview}
                    className="w-full max-h-48 object-cover rounded-lg"
                    controls
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full max-h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};