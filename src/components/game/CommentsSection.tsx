import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getComments, addComment, addReply, getAverageRating, Comment } from '@/lib/comments';
import { FaStar, FaReply, FaUser } from 'react-icons/fa';

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
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadComments();
    
    // Get or create username
    let storedUserName = localStorage.getItem('gamehub_username');
    if (!storedUserName) {
      storedUserName = 'Gamer' + Math.floor(Math.random() * 10000);
      localStorage.setItem('gamehub_username', storedUserName);
    }
    setUserName(storedUserName);
    
    // Listen for real-time updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gamehub_comments') {
        loadComments();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [gameId]);

  const loadComments = () => {
    const gameComments = getComments(gameId);
    setComments(gameComments);
    setAverageRating(getAverageRating(gameId));
  };

  const handleSubmitComment = () => {
    if (!newComment.trim() || !userName) return;
    
    addComment(gameId, userName, newComment, newRating || undefined);
    
    setNewComment('');
    setNewRating(0);
    loadComments();
  };

  const handleSubmitReply = (commentId: string) => {
    if (!replyText.trim() || !userName) return;
    
    addReply(commentId, userName, replyText);
    
    setReplyText('');
    setReplyingTo(null);
    loadComments();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="bg-gradient-card border border-border/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Community Rating</h3>
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold text-primary">{averageRating.toFixed(1)}</div>
          {renderStars(Math.round(averageRating))}
          <div className="text-muted-foreground">
            ({comments.filter(c => c.rating).length} ratings)
          </div>
        </div>
      </div>

      {/* Add Comment */}
      <div className="bg-gradient-card border border-border/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Leave a Review</h3>
          <div className="text-sm text-muted-foreground">
            Posting as: <span className="font-medium text-foreground">{userName}</span>
          </div>
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
            className="bg-secondary/50 border-border/50 focus:border-primary min-h-[100px]"
          />
          
          <Button 
            onClick={handleSubmitComment}
            className="bg-gradient-primary hover:shadow-glow-primary"
            disabled={!newComment.trim()}
          >
            Post Review
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Reviews & Comments ({comments.length})</h3>
        
        {comments.length === 0 ? (
          <div className="text-center py-8 bg-gradient-card border border-border/50 rounded-lg">
            <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gradient-card border border-border/50 rounded-lg p-6">
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
                    <div className="text-sm text-muted-foreground">{formatDate(comment.timestamp)}</div>
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

              {/* Reply Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <FaReply className="w-3 h-3 mr-2" />
                Reply
              </Button>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-4 space-y-3">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="bg-secondary/50 border-border/50 focus:border-primary"
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyText.trim()}
                    >
                      Post Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="mt-4 space-y-3 pl-6 border-l-2 border-border/30">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-secondary/30 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            <FaUser className="w-3 h-3" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{reply.userName}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(reply.timestamp)}</div>
                        </div>
                      </div>
                      <p className="text-sm">{reply.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};