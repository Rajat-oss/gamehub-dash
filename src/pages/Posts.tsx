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
import { FaPlus, FaHeart, FaRegHeart, FaUser, FaComment, FaRegComment } from 'react-icons/fa';
import { CommentSection } from '@/components/posts/CommentSection';
import { formatDistanceToNow } from 'date-fns';

const Posts: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const loadPosts = async () => {
    try {
      const fetchedPosts = await postService.getPosts();
      setPosts(fetchedPosts);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={() => {}} />
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gaming Posts</h1>
          <Button onClick={() => setIsPostModalOpen(true)}>
            <FaPlus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No posts yet. Be the first to share something!
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => {
              const isLiked = user ? post.likes.includes(user.uid) : false;
              
              return (
                <Card key={post.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.userPhotoURL} alt={post.username} />
                        <AvatarFallback>
                          {post.username.charAt(0).toUpperCase() || <FaUser />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{post.username}</h3>
                          {post.gameTitle && (
                            <Badge variant="secondary" className="text-xs">
                              {post.gameTitle}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {post.content && (
                      <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                    )}
                    
                    {post.mediaUrl && (
                      <div className="mb-4">
                        {post.mediaType === 'video' ? (
                          <video
                            src={post.mediaUrl}
                            className="w-full max-h-96 object-cover rounded-lg"
                            controls
                          />
                        ) : (
                          <img
                            src={post.mediaUrl}
                            alt="Post media"
                            className="w-full max-h-96 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id, isLiked)}
                        className="flex items-center gap-2"
                      >
                        {isLiked ? (
                          <FaHeart className="w-4 h-4 text-red-500" />
                        ) : (
                          <FaRegHeart className="w-4 h-4" />
                        )}
                        <span>{post.likeCount}</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-2"
                      >
                        {expandedComments.has(post.id) ? (
                          <FaComment className="w-4 h-4 text-blue-500" />
                        ) : (
                          <FaRegComment className="w-4 h-4" />
                        )}
                        <span>{post.commentCount || 0}</span>
                      </Button>
                    </div>
                    
                    <CommentSection 
                      postId={post.id} 
                      isExpanded={expandedComments.has(post.id)}
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
    </div>
  );
};

export default Posts;