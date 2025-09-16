import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { commentService, Comment } from '@/services/commentService';
import { FaStar, FaReply, FaUser, FaHeart, FaTrash, FaEdit } from 'react-icons/fa';
import { AnimatedHeart } from '@/components/ui/animated-heart';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentsSectionProps {
  gameId: string;
  gameName: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ gameId, gameName }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  const handleToggleLike = async (commentId: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please sign in to like comments.',
        variant: 'destructive'
      });
      return;
    }
    
    // Optimistic update
    setComments(prevComments => 
      prevComments.map(comment => {
        if (comment.id === commentId) {
          const likedBy = comment.likedBy || [];
          const isLiked = likedBy.includes(user.uid);
          return {
            ...comment,
            likes: isLiked ? (comment.likes || 0) - 1 : (comment.likes || 0) + 1,
            likedBy: isLiked 
              ? likedBy.filter(uid => uid !== user.uid)
              : [...likedBy, user.uid]
          };
        }
        return comment;
      })
    );
    
    try {
      await commentService.toggleCommentLike(commentId, user.uid);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment.id === commentId) {
            const isLiked = !comment.likedBy.includes(user.uid);
            return {
              ...comment,
              likes: isLiked ? comment.likes - 1 : comment.likes + 1,
              likedBy: isLiked 
                ? comment.likedBy.filter(uid => uid !== user.uid)
                : [...comment.likedBy, user.uid]
            };
          }
          return comment;
        })
      );
      toast({
        title: 'Error',
        description: 'Failed to update like. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentService.deleteComment(commentId, user.uid);
        await loadComments();
        toast({
          title: 'Success',
          description: 'Comment deleted successfully.'
        });
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete comment. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  useEffect(() => {
    loadComments();
  }, [gameId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const [gameComments, averageRating] = await Promise.all([
        commentService.getGameComments(gameId),
        commentService.getGameAverageRating(gameId)
      ]);
      
      setComments(gameComments);
      setAverageRating(averageRating || 0);
      setRatingCount(gameComments.filter(c => c.rating).length);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load comments. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) {
      toast({
        title: 'Error',
        description: 'Please sign in to post a comment.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSubmitting(true);
      await commentService.addComment({
        gameId,
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        userAvatar: user.photoURL || undefined,
        comment: newComment,
        rating: newRating || undefined
      });
      
      setNewComment('');
      setNewRating(0);
      await loadComments();
      
      toast({
        title: 'Success',
        description: 'Your comment has been posted!'
      });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (commentId: string) => {
    if (!replyText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a reply message.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please sign in to post a reply.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSubmitting(true);
      await commentService.addReply(commentId, {
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
        userAvatar: user.photoURL || undefined,
        comment: replyText.trim()
      });
      
      setReplyText('');
      setReplyingTo(null);
      await loadComments();
      
      toast({
        title: 'Success',
        description: 'Your reply has been posted!'
      });
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to post reply. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp: any) => {
    try {
      let date;
      if (timestamp?.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return 'Just now';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Just now';
    }
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Community Rating</h3>
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold text-primary">{(averageRating || 0).toFixed(1)}</div>
          {renderStars(Math.round(averageRating))}
          <div className="text-muted-foreground">
            ({ratingCount} ratings)
          </div>
        </div>
      </div>

      {/* Add Comment */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Leave a Review</h3>
          {user && (
            <div className="text-sm text-muted-foreground">
              Posting as: <span className="font-medium text-foreground">{user.displayName || user.email}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Rating</label>
            {renderStars(newRating, true, setNewRating)}
          </div>
          
          <Textarea
            placeholder={`Share your thoughts about ${gameName}...`}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-background border-border focus:border-primary min-h-[100px]"
          />
          
          <Button 
            onClick={handleSubmitComment}
            className="bg-primary hover:bg-primary/90"
            disabled={!newComment.trim() || !user || submitting}
          >
            {submitting ? 'Posting...' : 'Post Review'}
          </Button>
          
          {!user && (
            <p className="text-sm text-muted-foreground mt-2">
              Please sign in to post a review.
            </p>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Reviews & Comments ({comments.length})</h3>
        
        {loading ? (
          <div className="text-center py-8 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment, index) => (
            <motion.div 
              key={comment.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-card border border-border rounded-lg p-6"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <FaUser className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{comment.userName}</div>
                    <div className="text-sm text-muted-foreground">{formatDate(comment.createdAt)}</div>
                  </div>
                </div>
                {comment.rating && (
                  <div className="flex items-center space-x-2">
                    {renderStars(comment.rating)}
                    <Badge variant="secondary">{comment.rating}/5</Badge>
                  </div>
                )}
              </div>

              {/* Comment Text */}
              <p className="text-foreground mb-4">{comment.comment}</p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-1">
                  <AnimatedHeart
                    isLiked={user ? (comment.likedBy || []).includes(user.uid) : false}
                    onToggle={() => handleToggleLike(comment.id)}
                    size="sm"
                  />
                  <span className="text-sm text-muted-foreground">{comment.likes || 0}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-muted-foreground hover:text-foreground"
                  disabled={!user}
                >
                  <FaReply className="w-3 h-3 mr-2" />
                  Reply
                </Button>
                
                {user && comment.userId === user.uid && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <FaTrash className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Reply Form */}
              <AnimatePresence>
                {replyingTo === comment.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 space-y-3 overflow-hidden"
                  >
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="bg-background border-border focus:border-primary"
                    />
                    <div className="flex space-x-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={!replyText.trim() || !user || submitting}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {submitting ? 'Posting...' : 'Post Reply'}
                        </Button>
                      </motion.div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        disabled={submitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Replies */}
              <AnimatePresence>
                {(comment.replies || []).length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="mt-4 space-y-3 pl-6 border-l-2 border-border/30 overflow-hidden"
                  >
                    {(comment.replies || []).map((reply, index) => (
                      <motion.div 
                        key={reply.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-secondary/30 rounded-lg p-4"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-secondary text-secondary-foreground">
                              <FaUser className="w-3 h-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{reply.userName}</div>
                            <div className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</div>
                          </div>
                        </div>
                        <p className="text-sm">{reply.comment}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};