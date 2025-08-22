import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { localCommentService } from '@/services/localCommentService';
import { PostComment } from '@/types/post';
import { FaUser, FaPaperPlane } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface CommentSectionProps {
  postId: string;
  isExpanded: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, isExpanded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = () => {
    if (!isExpanded) return;
    
    setIsLoading(true);
    try {
      const fetchedComments = localCommentService.getPostComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isExpanded) {
      setComments([]);
      return;
    }
    
    loadComments();
    
    // Listen for storage changes (comments from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gamehub_post_comments') {
        loadComments();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [postId, isExpanded]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      localCommentService.addComment(
        postId,
        user.uid,
        user.displayName || 'Anonymous',
        user.photoURL || undefined,
        { content: newComment.trim() }
      );
      setNewComment('');
      toast.success('Comment added!');
      loadComments();
      
      // Trigger storage event for other tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'gamehub_post_comments',
        newValue: localStorage.getItem('gamehub_post_comments')
      }));
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) return null;

  return (
    <div className="border-t border-border/50 pt-4 mt-4">
      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmitComment} className="flex gap-2 mb-4">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
            <AvatarFallback className="text-xs">
              {user.displayName?.charAt(0).toUpperCase() || <FaUser className="w-3 h-3" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1"
              disabled={isSubmitting}
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={!newComment.trim() || isSubmitting}
              className="px-3"
            >
              <FaPaperPlane className="w-3 h-3" />
            </Button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={comment.userPhotoURL} alt={comment.username} />
                <AvatarFallback className="text-xs">
                  {comment.username.charAt(0).toUpperCase() || <FaUser className="w-3 h-3" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="bg-secondary/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};