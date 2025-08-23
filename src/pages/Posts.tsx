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
import { FaPlus, FaHeart, FaRegHeart, FaUser, FaComment, FaRegComment, FaShare, FaEllipsisV, FaTrash, FaEdit, FaBookmark } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
      </div>
      
      <Navbar onSearch={() => {}} />
      
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        {/* Modern Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Social Feed
            </h1>
            <p className="text-sm text-gray-400 mt-1">Connect with the gaming community</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => setIsPostModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 shadow-lg shadow-purple-500/25 transition-all duration-300"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </motion.div>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-gray-400 text-lg">No posts yet. Be the first to share something!</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {posts.map((post, index) => {
                const isLiked = user ? post.likes.includes(user.uid) : false;
                const isOwner = user?.uid === post.userId;
                
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:border-purple-500/30">
                      {/* Post Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="relative"
                        >
                          <Avatar className="h-12 w-12 ring-2 ring-purple-500/30">
                            <AvatarImage src={post.userPhotoURL} alt={post.username} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                              {post.username.charAt(0).toUpperCase() || <FaUser />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{post.username}</h3>
                            {post.gameTitle && (
                              <Badge className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-200 border-purple-500/30 text-xs">
                                {post.gameTitle}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                        {isOwner && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                <FaEllipsisV className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-red-400 focus:text-red-300">
                                <FaTrash className="mr-2 h-4 w-4" />
                                Delete Post
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      {/* Post Content */}
                      {post.content && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mb-4"
                        >
                          <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                        </motion.div>
                      )}
                      
                      {/* Post Media */}
                      {post.mediaUrl && (
                        <motion.div 
                          className="mb-6 overflow-hidden rounded-xl"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                        >
                          {post.mediaType === 'video' ? (
                            <video
                              src={post.mediaUrl}
                              className="w-full max-h-96 object-cover"
                              controls
                            />
                          ) : (
                            <img
                              src={post.mediaUrl}
                              alt="Post media"
                              className="w-full max-h-96 object-cover"
                            />
                          )}
                        </motion.div>
                      )}
                      
                      {/* Interactive Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {/* Like Button - Ripple Effect */}
                          <motion.button
                            onClick={() => handleLike(post.id, isLiked)}
                            className={`relative overflow-hidden px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
                              isLiked 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-slate-700/50 text-gray-400 border border-slate-600/50 hover:border-red-500/30 hover:text-red-400'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-red-500/20 rounded-full"
                              initial={{ scale: 0, opacity: 0 }}
                              whileHover={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                            <motion.div
                              animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              {isLiked ? (
                                <FaHeart className="w-4 h-4 relative z-10" />
                              ) : (
                                <FaRegHeart className="w-4 h-4 relative z-10" />
                              )}
                            </motion.div>
                            <span className="text-sm font-medium relative z-10">{post.likeCount}</span>
                          </motion.button>
                          
                          {/* Comment Button - Expand Effect */}
                          <motion.button
                            onClick={() => toggleComments(post.id)}
                            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
                              expandedComments.has(post.id)
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-slate-700/50 text-gray-400 border border-slate-600/50 hover:border-blue-500/30 hover:text-blue-400'
                            }`}
                            whileHover={{ scale: 1.1, rotateZ: 5 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {expandedComments.has(post.id) ? (
                              <FaComment className="w-4 h-4" />
                            ) : (
                              <FaRegComment className="w-4 h-4" />
                            )}
                            <span className="text-sm font-medium">{commentCounts[post.id] || 0}</span>
                          </motion.button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Share Button - Transform Effect */}
                          <motion.button
                            onClick={() => handleShare(post)}
                            className="p-2 rounded-full bg-slate-700/50 text-gray-400 border border-slate-600/50 hover:border-green-500/30 hover:text-green-400 transition-all duration-300"
                            whileHover={{ 
                              scale: 1.1,
                              rotate: [0, -10, 10, 0],
                              transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaShare className="w-4 h-4" />
                          </motion.button>
                          
                          {/* Bookmark Button - Glow Effect */}
                          <motion.button
                            className="relative p-2 rounded-full bg-slate-700/50 text-gray-400 border border-slate-600/50 hover:border-yellow-500/30 hover:text-yellow-400 transition-all duration-300"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <motion.div
                              className="absolute inset-0 bg-yellow-500/20 rounded-full blur-md"
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                            <FaBookmark className="w-4 h-4 relative z-10" />
                          </motion.button>
                        </div>
                      </div>
                      
                      {/* Comments Section */}
                      <AnimatePresence>
                        {expandedComments.has(post.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CommentSection 
                              postId={post.id}
                              isExpanded={expandedComments.has(post.id)}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
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