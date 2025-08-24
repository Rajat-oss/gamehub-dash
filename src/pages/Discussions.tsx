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
    <>
      {/* Mobile Dark Theme View */}
      <div className="min-h-screen bg-black text-white sm:hidden">
        {/* Top Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <button onClick={() => navigate('/community')} className="p-2">
            <FaArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          <h1 className="text-lg font-semibold text-white">Discussions</h1>
          
          {user && (
            <button onClick={() => setIsCreateModalOpen(true)} className="p-2">
              <FaPlus className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto p-4 space-x-2 border-b border-gray-800">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-white'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Discussions List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-800 rounded w-3/4 mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-800 rounded w-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : discussions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <FaComments className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No discussions yet</h3>
              <p className="text-gray-400 text-center mb-4">Start the first discussion in this category!</p>
              {user && (
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-6 py-2 bg-white text-black rounded-lg font-medium"
                >
                  Create Discussion
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {discussions.map((discussion) => {
                const isLiked = user && discussion.likes.includes(user.uid);
                
                return (
                  <div 
                    key={discussion.id} 
                    onClick={() => navigate(`/discussions/${discussion.id}`)}
                    className="p-4 hover:bg-gray-900 active:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar 
                        className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-white/50 transition-all"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/user/${discussion.authorName}`);
                        }}
                      >
                        <AvatarImage src={discussion.authorPhotoURL || ''} alt={discussion.authorName} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {discussion.authorName?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {discussion.isPinned && <FaThumbtack className="text-white w-3 h-3" />}
                          <h3 className="font-semibold text-white text-sm line-clamp-2">
                            {discussion.title}
                          </h3>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                          {discussion.content}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-xs text-gray-400">
                            <span>by {discussion.authorName}</span>
                            <span>{formatDistanceToNow(discussion.createdAt, { addSuffix: true })}</span>
                          </div>
                          
                          <div className="flex items-center space-x-3 text-xs text-gray-400">
                            <div className="flex items-center space-x-1">
                              <FaEye className="w-3 h-3" />
                              <span>{discussion.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaReply className="w-3 h-3" />
                              <span>{discussion.replyCount}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikeDiscussion(discussion.id, !!isLiked);
                              }}
                              className="flex items-center space-x-1"
                            >
                              <FaHeart className={`w-3 h-3 ${isLiked ? 'text-red-500' : 'text-gray-400'}`} />
                              <span>{discussion.likeCount}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Desktop View - Original Layout */}
      <div className="hidden sm:block min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" onClick={() => navigate('/community')} size="sm">
                <FaArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Back to Community</span>
                <span className="xs:hidden">Back</span>
              </Button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Gaming Discussions</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Join the conversation about your favorite games</p>
          </div>
          {user && (
            <Button 
              onClick={() => setIsCreateModalOpen(true)} 
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
              size="sm"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">New Discussion</span>
              <span className="xs:hidden">New</span>
            </Button>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
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
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Avatar 
                        className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/user/${discussion.authorName}`);
                        }}
                      >
                        <AvatarImage src={discussion.authorPhotoURL || ''} alt={discussion.authorName} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {discussion.authorName?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          {discussion.isPinned && <FaThumbtack className="text-primary w-3 h-3 sm:w-4 sm:h-4 mt-1 flex-shrink-0" />}
                          <h3 className="font-semibold text-base sm:text-lg hover:text-primary transition-colors line-clamp-2">
                            {discussion.title}
                          </h3>
                        </div>
                        
                        <p className="text-muted-foreground text-xs sm:text-sm mb-3 line-clamp-2">
                          {discussion.content}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span>by {discussion.authorName}</span>
                              <span className="hidden xs:inline">•</span>
                              <span className="text-xs">{formatDistanceToNow(discussion.createdAt, { addSuffix: true })}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs w-fit">
                              {categories.find(c => c.id === discussion.category)?.name || discussion.category}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-1">
                              <FaEye className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                              <span>{discussion.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaReply className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                              <span>{discussion.replyCount}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLikeDiscussion(discussion.id, !!isLiked);
                              }}
                              className="flex items-center gap-1 hover:text-red-500 transition-colors p-1"
                            >
                              <FaHeart className={`w-3 h-3 sm:w-4 sm:h-4 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`} />
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
      </div>

      <CreateDiscussionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDiscussionCreated={handleDiscussionCreated}
      />
    </>
  );
};

export default Discussions;