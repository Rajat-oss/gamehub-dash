import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/homepage/Navbar';
import { PostModal } from '@/components/posts/PostModal';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { postService } from '@/services/postService';
import { Post } from '@/types/post';
import { FaPlus, FaHeart, FaRegHeart, FaUser, FaComment, FaRegComment, FaShare, FaEllipsisV, FaTrash, FaBookmark, FaHome, FaGamepad, FaUsers, FaBell, FaComments, FaFire, FaTrendingUp, FaUserPlus, FaSmile, FaThumbsUp, FaSurprise, FaCamera } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { CommentSection } from '@/components/posts/CommentSection';
import { ShareModal } from '@/components/posts/ShareModal';
import { commentService } from '@/services/commentService';
import { storyService } from '@/services/storyService';
import { userService } from '@/services/userService';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Story } from '@/types/story';
import { UserProfile } from '@/types/user';
import { StoryModal } from '@/components/posts/StoryModal';
import { StoryViewer } from '@/components/posts/StoryViewer';

const Posts: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [commentCounts, setCommentCounts] = useState<{[key: string]: number}>({});
  const [stories, setStories] = useState<Story[]>([]);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);

  const loadPosts = async () => {
    try {
      const fetchedPosts = await postService.getPosts();
      setPosts(fetchedPosts);
      
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
    if (user) {
      loadStories();
      loadSuggestions();
    }
  }, [user]);

  const loadStories = async () => {
    if (!user) return;
    
    try {
      const unsubscribe = await storyService.subscribeToFollowedUsersStories(user.uid, (userStories) => {
        setStories(userStories);
      });
      return unsubscribe;
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const loadSuggestions = async () => {
    if (!user) return;
    
    try {
      const userProfile = await userService.getUserProfile(user.uid);
      if (!userProfile) return;
      
      const allUsers = await userService.getAllPublicUsers();
      const filteredSuggestions = allUsers.filter(u => 
        u.uid !== user.uid && 
        !userProfile.following?.includes(u.uid) &&
        u.isPublic !== false
      ).slice(0, 3);
      
      setSuggestions(filteredSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleFollowUser = async (targetUserId: string) => {
    if (!user) return;
    
    try {
      await userService.followUser(user.uid, targetUserId);
      loadSuggestions(); // Refresh suggestions
      toast.success('User followed successfully');
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    }
  };

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

  const sidebarItems = [
    { icon: FaHome, label: 'Home', active: true },
  
    
    
    
  ];



  return (
    <div className="min-h-screen bg-black relative">
      <Navbar onSearch={() => {}} />
      
      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-64 p-6 sticky top-0 h-screen">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.02, x: 4 }}
                className={`flex items-center gap-4 p-4 rounded-full cursor-pointer transition-all duration-200 ${
                  item.active 
                    ? 'bg-white/10 border border-white/20' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className={`p-2 rounded-xl ${item.active ? 'bg-white' : 'bg-white/10'}`}>
                  <item.icon className={`w-5 h-5 ${item.active ? 'text-black' : 'text-white'}`} />
                </div>
                <span className={`font-medium ${item.active ? 'text-white' : 'text-[#9A9A9A]'}`}>
                  {item.label}
                </span>
                {item.active && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-2xl mx-auto px-4 py-6">
          {/* Mobile Stories */}
          <div className="xl:hidden mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Stories</h3>
              <motion.button
                onClick={() => setIsStoryModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
              >
                <FaCamera className="w-4 h-4" />
              </motion.button>
            </div>
            
            {stories.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {Object.entries(
                  stories.reduce((acc, story) => {
                    if (!acc[story.userId]) {
                      acc[story.userId] = [];
                    }
                    acc[story.userId].push(story);
                    return acc;
                  }, {} as Record<string, Story[]>)
                ).map(([userId, userStories]) => {
                  const latestStory = userStories[0];
                  const isOwnStory = userId === user?.uid;
                  const hasUnviewedStories = !isOwnStory && userStories.some(story => 
                    user && !story.views.includes(user.uid)
                  );
                  
                  return (
                    <motion.div
                      key={userId}
                      whileHover={{ scale: 1.05 }}
                      className="cursor-pointer flex-shrink-0"
                      onClick={() => {
                        const firstStoryIndex = stories.findIndex(s => s.userId === userId);
                        setSelectedStoryIndex(firstStoryIndex);
                        setIsStoryViewerOpen(true);
                      }}
                    >
                      <div className={`relative p-0.5 rounded-full ${
                        hasUnviewedStories && !isOwnStory
                          ? 'bg-gradient-to-r from-pink-500 via-red-500 to-orange-500' 
                          : 'bg-gray-500'
                      }`}>
                        <div className="p-0.5 bg-black rounded-full">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={latestStory.userPhotoURL} />
                            <AvatarFallback className="bg-white text-black">
                              {latestStory.username.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      <p className="text-xs text-[#9A9A9A] text-center mt-1 truncate w-16">{latestStory.username}</p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[#9A9A9A] text-sm mb-3">No stories yet</p>
                <motion.button
                  onClick={() => setIsStoryModalOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Add Your Story
                </motion.button>
              </div>
            )}
          </div>

          {/* Share Box */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user?.photoURL} />
                <AvatarFallback className="bg-white text-black">
                  {user?.displayName?.charAt(0) || <FaUser />}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="flex-1 bg-black border border-white/10 rounded-full px-6 py-3 text-left text-[#9A9A9A] hover:border-white/30 transition-all duration-200"
              >
                What's on your mind?
              </button>
              <motion.button
                onClick={() => setIsPostModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white rounded-full text-black"
              >
                <FaPlus className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Posts Feed */}
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/5 rounded-3xl p-6 border border-white/10">
                  <div className="animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 bg-white/10 rounded w-32" />
                        <div className="h-3 bg-white/10 rounded w-24" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-white/10 rounded" />
                      <div className="h-4 bg-white/10 rounded w-3/4" />
                    </div>
                    <div className="h-48 bg-white/10 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/5 rounded-3xl p-12 border border-white/10">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
                <p className="text-[#9A9A9A]">Be the first to share something with the community!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post, index) => {
                const isLiked = user ? post.likes.includes(user.uid) : false;
                const isOwner = user?.uid === post.userId;
                
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -2 }}
                    className="bg-white/5 rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    {/* Post Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar 
                        className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-white/50 transition-all"
                        onClick={() => window.location.href = `/user/${post.username}`}
                      >
                        <AvatarImage src={post.userPhotoURL} alt={post.username} />
                        <AvatarFallback className="bg-white text-black">
                          {post.username.charAt(0).toUpperCase() || <FaUser />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{post.username}</h3>
                          {post.gameTitle && (
                            <Badge className="bg-white/10 text-white border-white/20 text-xs">
                              {post.gameTitle}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#9A9A9A]">
                          {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                      {isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#9A9A9A] hover:text-white">
                              <FaEllipsisV className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-black border-white/20">
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
                      <div className="mb-4">
                        <p className="text-white leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      </div>
                    )}
                    
                    {/* Post Media */}
                    {post.mediaUrl && (
                      <div className="mb-6 overflow-hidden rounded-2xl">
                        {post.mediaType === 'video' ? (
                          <video
                            src={post.mediaUrl}
                            className="w-full max-h-96 object-cover"
                            controls
                            preload="metadata"
                            playsInline
                            muted
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img
                            src={post.mediaUrl}
                            alt="Post media"
                            className="w-full max-h-96 object-cover"
                          />
                        )}
                      </div>
                    )}
                    
                    {/* Reactions */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <motion.button
                          onClick={() => handleLike(post.id, isLiked)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                            isLiked 
                              ? 'bg-white/20 text-white border border-white/30' 
                              : 'bg-white/5 text-[#9A9A9A] border border-white/10 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          <motion.div
                            animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {isLiked ? <FaHeart className="w-4 h-4" /> : <FaRegHeart className="w-4 h-4" />}
                          </motion.div>
                          <span className="text-sm font-medium">{post.likeCount}</span>
                        </motion.button>
                        
                        <motion.button
                          onClick={() => toggleComments(post.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                            expandedComments.has(post.id)
                              ? 'bg-white/20 text-white border border-white/30'
                              : 'bg-white/5 text-[#9A9A9A] border border-white/10 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {expandedComments.has(post.id) ? <FaComment className="w-4 h-4" /> : <FaRegComment className="w-4 h-4" />}
                          <span className="text-sm font-medium">{commentCounts[post.id] || 0}</span>
                        </motion.button>


                      </div>
                      
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => handleShare(post)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-full bg-white/5 text-[#9A9A9A] border border-white/10 hover:border-white/30 hover:text-white transition-all duration-200"
                        >
                          <FaShare className="w-4 h-4" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-full bg-white/5 text-[#9A9A9A] border border-white/10 hover:border-white/30 hover:text-white transition-all duration-200"
                        >
                          <FaBookmark className="w-4 h-4" />
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
                          className="border-t border-white/10 pt-4"
                        >
                          <CommentSection 
                            postId={post.id}
                            isExpanded={expandedComments.has(post.id)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-80 p-6 sticky top-0 h-screen overflow-y-auto">
          {/* Desktop Stories */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Stories</h3>
              <motion.button
                onClick={() => setIsStoryModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
              >
                <FaCamera className="w-4 h-4" />
              </motion.button>
            </div>
            
            {stories.length > 0 ? (
              <div className="flex flex-wrap gap-4 justify-center">
                {Object.entries(
                  stories.reduce((acc, story) => {
                    if (!acc[story.userId]) {
                      acc[story.userId] = [];
                    }
                    acc[story.userId].push(story);
                    return acc;
                  }, {} as Record<string, Story[]>)
                ).map(([userId, userStories]) => {
                  const latestStory = userStories[0];
                  const isOwnStory = userId === user?.uid;
                  const hasUnviewedStories = !isOwnStory && userStories.some(story => 
                    user && !story.views.includes(user.uid)
                  );
                  
                  return (
                    <motion.div
                      key={userId}
                      whileHover={{ scale: 1.05 }}
                      className="cursor-pointer"
                      onClick={() => {
                        const firstStoryIndex = stories.findIndex(s => s.userId === userId);
                        setSelectedStoryIndex(firstStoryIndex);
                        setIsStoryViewerOpen(true);
                      }}
                    >
                      <div className={`relative p-0.5 rounded-full ${
                        hasUnviewedStories && !isOwnStory
                          ? 'bg-gradient-to-r from-pink-500 via-red-500 to-orange-500' 
                          : 'bg-gray-500'
                      }`}>
                        <div className="p-0.5 bg-black rounded-full">
                          <Avatar className="w-14 h-14">
                            <AvatarImage src={latestStory.userPhotoURL} />
                            <AvatarFallback className="bg-white text-black">
                              {latestStory.username.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      <p className="text-xs text-[#9A9A9A] text-center mt-2 truncate w-16">{latestStory.username}</p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#9A9A9A] text-sm mb-4">No stories yet</p>
                <motion.button
                  onClick={() => setIsStoryModalOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Add Your Story
                </motion.button>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaUserPlus className="w-5 h-5 text-white" />
                Suggestions
              </h3>
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.uid} className="flex items-center gap-3">
                    <Avatar 
                      className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-white/50 transition-all"
                      onClick={() => window.location.href = `/user/${suggestion.username}`}
                    >
                      <AvatarImage src={suggestion.photoURL} />
                      <AvatarFallback className="bg-white text-black text-xs">
                        {suggestion.username?.slice(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{suggestion.username}</p>
                      <p className="text-[#9A9A9A] text-xs">{suggestion.followers?.length || 0} followers</p>
                    </div>
                    <motion.button
                      onClick={() => handleFollowUser(suggestion.uid)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-white text-black text-xs font-medium rounded-full hover:bg-white/90 transition-all duration-200"
                    >
                      Follow
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
      
      <StoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        onStoryCreated={() => {
          loadStories();
          toast.success('Story added successfully!');
        }}
      />
      
      <StoryViewer
        isOpen={isStoryViewerOpen}
        onClose={() => setIsStoryViewerOpen(false)}
        stories={(() => {
          const selectedUserId = stories[selectedStoryIndex]?.userId;
          return stories.filter(story => story.userId === selectedUserId);
        })()}
        initialStoryIndex={0}
      />
    </div>
  );
};

export default Posts;