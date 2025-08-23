import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/homepage/Navbar';
import { PostModal } from '@/components/posts/PostModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { postService } from '@/services/postService';
import { Post } from '@/types/post';
import { FaPlus, FaHeart, FaRegHeart, FaUser, FaComment, FaRegComment, FaShare, FaEllipsisV, FaTrash, FaEdit } from 'react-icons/fa';
import { CommentSection } from '@/components/posts/CommentSection';
import { ShareModal } from '@/components/posts/ShareModal';
import { commentService } from '@/services/commentService';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const Posts: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [commentCounts, setCommentCounts] = useState<{[key: string]: number}>({});

  const loadPosts = async () => {
    try {
      const fetchedPosts = await postService.getPosts();
      setPosts(fetchedPosts);
      
      // Load comment counts for each post
      fetchedPosts.forEach(post => {
        commentService.subscribeToComments(post.id, (comments) => {
          setCommentCounts(prev => ({
            ...prev,
            [post.id]: comments.length
          }));
        });
      });
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;
    
    try {
      if (isLiked) {
        await postService.unlikePost(postId, user.uid);
      } else {
        await postService.likePost(postId, user.uid);
      }
      loadPosts();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const handleShare = (post: Post) => {
    setSharePost(post);
    setIsShareModalOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(postId);
        toast.success('Post deleted successfully');
        loadPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gaming Posts</h1>
            <p className="text-muted-foreground">Share your gaming moments with the community</p>
          </div>
          <Button onClick={() => setIsPostModalOpen(true)} className="bg-primary hover:bg-primary/90">
            <FaPlus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-gradient-card border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-3 bg-muted rounded animate-pulse w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-4" />
                  <div className="h-48 bg-muted rounded-xl animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaComment className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">Be the first to share something with the community!</p>
              <Button onClick={() => setIsPostModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <FaPlus className="w-4 h-4 mr-2" />
                Create Your First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const isLiked = user ? post.likes.includes(user.uid) : false;
              const isOwner = user?.uid === post.userId;
              
              return (
                <Card key={post.id} className="bg-gradient-card border-border/50 hover:border-primary/20 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                          <AvatarImage src={post.userPhotoURL} alt={post.username} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {post.username.charAt(0).toUpperCase() || <FaUser />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{post.username}</h3>
                            {post.gameTitle && (
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                                {post.gameTitle}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      
                      {isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <FaEllipsisV className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-red-600 focus:text-red-600">
                              <FaTrash className="mr-2 h-4 w-4" />
                              Delete Post
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {post.content && (
                      <p className="mb-6 text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    )}
                    
                    {post.mediaUrl && (
                      <div className="mb-6">
                        {post.mediaType === 'video' ? (
                          <video
                            src={post.mediaUrl}
                            className="w-full max-h-96 object-cover rounded-xl border border-border/50"
                            controls
                          />
                        ) : (
                          <img
                            src={post.mediaUrl}
                            alt="Post media"
                            className="w-full max-h-96 object-cover rounded-xl border border-border/50"
                          />
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between border-t border-border/50 pt-4">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id, isLiked)}
                          className={`flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors ${isLiked ? 'text-red-500' : ''}`}
                        >
                          {isLiked ? (
                            <FaHeart className="w-4 h-4" />
                          ) : (
                            <FaRegHeart className="w-4 h-4" />
                          )}
                          <span className="font-medium">{post.likeCount}</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleComments(post.id)}
                          className={`flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors ${expandedComments.has(post.id) ? 'text-blue-500' : ''}`}
                        >
                          {expandedComments.has(post.id) ? (
                            <FaComment className="w-4 h-4" />
                          ) : (
                            <FaRegComment className="w-4 h-4" />
                          )}
                          <span className="font-medium">{commentCounts[post.id] || 0}</span>
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(post)}
                        className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <FaShare className="w-4 h-4" />
                        <span className="font-medium">Share</span>
                      </Button>
                    </div>
                    
                    <CommentSection 
                      postId={post.id}
                      postAuthorId={post.userId}
                      isExpanded={expandedComments.has(post.id)}
                      onCommentAdded={loadPosts}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPostCreated={loadPosts}
      />
      
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSharePost(null);
        }}
        post={sharePost}
      />
    </div>
  );
};

export default Posts;