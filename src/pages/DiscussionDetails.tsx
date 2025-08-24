import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { discussionService } from '@/services/discussionService';
import { Discussion, DiscussionReply } from '@/types/discussion';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { FaArrowLeft, FaEye, FaReply, FaThumbtack } from 'react-icons/fa';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const DiscussionDetails: React.FC = () => {
  const { discussionId } = useParams<{ discussionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (discussionId) {
      loadDiscussion();
      loadReplies();
    }
  }, [discussionId]);

  const loadDiscussion = async () => {
    if (!discussionId) return;
    
    try {
      const data = await discussionService.getDiscussion(discussionId);
      setDiscussion(data);
    } catch (error) {
      console.error('Error loading discussion:', error);
      toast.error('Failed to load discussion');
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async () => {
    if (!discussionId) return;
    
    try {
      const data = await discussionService.getReplies(discussionId);
      setReplies(data);
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };



  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !user || !discussionId) return;

    setSubmitting(true);
    try {
      await discussionService.addReply(
        discussionId,
        user.uid,
        user.displayName || 'User',
        user.photoURL,
        newReply
      );
      setNewReply('');
      loadReplies();
      loadDiscussion();
      toast.success('Reply posted successfully!');
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
          <div className="animate-pulse space-y-3 sm:space-y-4">
            <div className="h-6 sm:h-8 bg-muted rounded w-1/4" />
            <div className="h-24 sm:h-32 bg-muted rounded" />
            <div className="h-48 sm:h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Discussion not found</h1>
          <Button onClick={() => navigate('/discussions')} size="sm">Back to Discussions</Button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Button variant="ghost" onClick={() => navigate('/discussions')} className="mb-4 sm:mb-6" size="sm">
          <FaArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden xs:inline">Back to Discussions</span>
          <span className="xs:hidden">Back</span>
        </Button>

        {/* Discussion */}
        <Card className="bg-gradient-card border-border/50 mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <Avatar 
                className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                onClick={() => navigate(`/user/${discussion.authorName}`)}
              >
                <AvatarImage src={discussion.authorPhotoURL || ''} alt={discussion.authorName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {discussion.authorName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  {discussion.isPinned && <FaThumbtack className="text-primary w-3 h-3 sm:w-4 sm:h-4 mt-1 flex-shrink-0" />}
                  <h1 className="text-lg sm:text-2xl font-bold leading-tight">{discussion.title}</h1>
                </div>
                
                <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 text-xs sm:text-sm text-muted-foreground mb-4">
                  <span>by {discussion.authorName}</span>
                  <span className="hidden xs:inline">•</span>
                  <span>{formatDistanceToNow(discussion.createdAt, { addSuffix: true })}</span>
                  <Badge variant="secondary" className="text-xs w-fit">{discussion.category}</Badge>
                </div>
                
                <div className="prose max-w-none mb-4">
                  <p className="text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                    {discussion.content}
                  </p>
                </div>
                
                {discussion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                    {discussion.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-1">
                    <FaEye className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm">{discussion.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaReply className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm">{discussion.replyCount} replies</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reply Form */}
        {user ? (
          <Card className="bg-gradient-card border-border/50 mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Post a Reply</h3>
              <form onSubmit={handleSubmitReply} className="space-y-3 sm:space-y-4">
                <Textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                />
                <Button type="submit" disabled={!newReply.trim() || submitting} size="sm" className="w-full sm:w-auto">
                  {submitting ? 'Posting...' : 'Post Reply'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-card border-border/50 mb-6 sm:mb-8">
            <CardContent className="p-4 sm:p-6 text-center">
              <p className="text-muted-foreground text-sm sm:text-base">Please sign in to post a reply</p>
            </CardContent>
          </Card>
        )}

        {/* Replies */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-semibold">Replies ({replies.length})</h3>
          
          {replies.length === 0 ? (
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-4 sm:p-6 text-center">
                <p className="text-muted-foreground text-sm sm:text-base">No replies yet. Be the first to reply!</p>
              </CardContent>
            </Card>
          ) : (
            replies.map((reply) => (
              <Card key={reply.id} className="bg-gradient-card border-border/50">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <Avatar 
                      className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                      onClick={() => navigate(`/user/${reply.authorName}`)}
                    >
                      <AvatarImage src={reply.authorPhotoURL || ''} alt={reply.authorName} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                        {reply.authorName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mb-2">
                        <span className="font-medium text-sm sm:text-base">{reply.authorName}</span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {formatDistanceToNow(reply.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap mb-3">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default DiscussionDetails;