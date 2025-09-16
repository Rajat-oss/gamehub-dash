import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { commentService } from '@/services/commentService';
import { PostComment } from '@/types/post';
import { FaUser, FaPaperPlane, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface CommentSectionProps {
  postId: string;
  postAuthorId: string;
  isExpanded: boolean;
  onCommentAdded?: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, postAuthorId, isExpanded, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isExpanded) {
      setComments([]);
      return;
    }
    
    setIsLoading(true);
    const unsubscribe = commentService.subscribeToComments(postId, (newComments) => {
      setComments(newComments);
      setIsLoading(false);
    });
    
    return unsubscribe;
  }, [postId, isExpanded]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await commentService.addComment(
        postId,
        postAuthorId,
        user.uid,
        user.displayName || 'Anonymous',
        user.photoURL || undefined,
        { content: newComment.trim() }
      );
      setNewComment('');
      toast.success('Comment added!');
      onCommentAdded?.();
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentService.deleteComment(postId, commentId);
        toast.success('Comment deleted');
      } catch (error) {
        toast.error('Failed to delete comment');
      }
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
              <Avatar 
                className="h-8 w-8 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                onClick={() => window.location.href = `/user/${comment.username}`}
              >
                <AvatarImage src={comment.userPhotoURL} alt={comment.username} />
                <AvatarFallback className="text-xs">
                  {comment.username.charAt(0).toUpperCase() || <FaUser className="w-3 h-3" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="bg-secondary/30 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    {user && comment.userId === user.uid && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                            <FaEllipsisV className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleDeleteComment(comment.id)} 
                            className="text-red-600 focus:text-red-600"
                          >
                            <FaTrash className="mr-2 h-3 w-3" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
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