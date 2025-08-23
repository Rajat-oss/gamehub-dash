import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { sendMessage } from '@/lib/chat';
import { Post } from '@/types/post';
import { FaUser, FaSearch } from 'react-icons/fa';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
}

interface UserProfile {
  uid: string;
  username: string;
  photoURL?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, post }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFriends, setFilteredFriends] = useState<UserProfile[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadFriends();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredFriends(
        friends.filter(friend =>
          friend.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredFriends(friends);
    }
  }, [searchQuery, friends]);

  const loadFriends = async () => {
    if (!user) return;
    
    try {
      const userProfile = await userService.getUserProfile(user.uid);
      if (userProfile?.following) {
        const friendProfiles = await Promise.all(
          userProfile.following.map(async (friendId: string) => {
            const profile = await userService.getUserProfile(friendId);
            return profile ? {
              uid: friendId,
              username: profile.username || 'Unknown',
              photoURL: profile.photoURL
            } : null;
          })
        );
        setFriends(friendProfiles.filter(Boolean) as UserProfile[]);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const toggleFriend = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleShare = async () => {
    if (!user || !post || selectedFriends.size === 0) return;

    setIsLoading(true);
    try {
      const postUrl = `${window.location.origin}/post/${post.id}`;
      const shareMessage = `Check out this post by ${post.username}: "${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}"\n\n${postUrl}`;
      
      const sharePromises = Array.from(selectedFriends).map(friendId =>
        sendMessage(user.uid, friendId, shareMessage)
      );

      await Promise.all(sharePromises);
      toast.success(`Post shared with ${selectedFriends.size} friend${selectedFriends.size > 1 ? 's' : ''}!`);
      onClose();
      setSelectedFriends(new Set());
    } catch (error) {
      toast.error('Failed to share post');
      console.error('Error sharing post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredFriends.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                {friends.length === 0 ? 'No friends found' : 'No matching friends'}
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <div
                  key={friend.uid}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedFriends.has(friend.uid) ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50'
                  }`}
                  onClick={() => toggleFriend(friend.uid)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.photoURL} alt={friend.username} />
                    <AvatarFallback>
                      {friend.username.charAt(0).toUpperCase() || <FaUser className="w-3 h-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{friend.username}</span>
                  {selectedFriends.has(friend.uid) && (
                    <div className="ml-auto w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleShare} 
              disabled={selectedFriends.size === 0 || isLoading}
            >
              {isLoading ? 'Sharing...' : `Share (${selectedFriends.size})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};