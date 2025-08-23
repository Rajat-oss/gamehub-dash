import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { discussionService } from '@/services/discussionService';
import { Discussion } from '@/types/discussion';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateDiscussionModal } from '@/components/discussions/CreateDiscussionModal';
import { FaPlus, FaComments, FaHeart, FaEye, FaReply, FaArrowLeft, FaThumbtack } from 'react-icons/fa';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const Discussions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'general', name: 'General Gaming' },
    { id: 'reviews', name: 'Game Reviews' },
    { id: 'tips', name: 'Tips & Tricks' },
    { id: 'news', name: 'Gaming News' },
    { id: 'help', name: 'Help & Support' }
  ];

  useEffect(() => {
    loadDiscussions();
  }, [selectedCategory]);

  const loadDiscussions = async () => {
    try {
      setLoading(true);
      const data = selectedCategory === 'all' 
        ? await discussionService.getDiscussions()
        : await discussionService.getDiscussionsByCategory(selectedCategory);
      setDiscussions(data);
    } catch (error) {
      console.error('Error loading discussions:', error);
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeDiscussion = async (discussionId: string, isLiked: boolean) => {
    if (!user) {
      toast.error('Please sign in to like discussions');
      return;
    }

    try {
      if (isLiked) {
        await discussionService.unlikeDiscussion(discussionId, user.uid);
      } else {
        await discussionService.likeDiscussion(discussionId, user.uid);
      }
      loadDiscussions();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleDiscussionCreated = () => {
    loadDiscussions();
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" onClick={() => navigate('/community')} size="sm">
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Back to Community
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gaming Discussions</h1>
            <p className="text-muted-foreground">Join the conversation about your favorite games</p>
          </div>
          {user && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
              <FaPlus className="w-4 h-4 mr-2" />
              New Discussion
            </Button>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Discussions List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="bg-gradient-card border-border/50">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : discussions.length === 0 ? (
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="text-center py-12">
              <FaComments className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No discussions yet</h3>
              <p className="text-muted-foreground mb-4">Start the first discussion in this category!</p>
              {user && (
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
                  <FaPlus className="w-4 h-4 mr-2" />
                  Create Discussion
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => {
              const isLiked = user && discussion.likes.includes(user.uid);
              
              return (
                <Card key={discussion.id} className="bg-gradient-card border-border/50 hover:border-primary/20 transition-all cursor-pointer"
                      onClick={() => navigate(`/discussions/${discussion.id}`)}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <AvatarImage src={discussion.authorPhotoURL} alt={discussion.authorName} />
                        <AvatarFallback>{discussion.authorName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {discussion.isPinned && <FaThumbtack className="text-primary w-4 h-4" />}
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                            {discussion.title}
                          </h3>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {discussion.content}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>by {discussion.authorName}</span>
                            <span>{formatDistanceToNow(discussion.createdAt, { addSuffix: true })}</span>
                            <Badge variant="secondary" className="text-xs">
                              {categories.find(c => c.id === discussion.category)?.name || discussion.category}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <FaEye className="w-4 h-4 text-muted-foreground" />
                              <span>{discussion.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaReply className="w-4 h-4 text-muted-foreground" />
                              <span>{discussion.replyCount}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikeDiscussion(discussion.id, !!isLiked);
                              }}
                              className="flex items-center gap-1 hover:text-red-500 transition-colors"
                            >
                              <FaHeart className={`w-4 h-4 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`} />
                              <span>{discussion.likeCount}</span>
                            </button>
                          </div>
                        </div>
                        
                        {discussion.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {discussion.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <CreateDiscussionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDiscussionCreated={handleDiscussionCreated}
      />
    </div>
  );
};

export default Discussions;