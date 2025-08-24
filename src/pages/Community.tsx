import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { UserProfile } from '@/types/user';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FaUsers, FaSearch, FaHeart, FaGamepad, FaUser, FaArrowLeft, FaUserFriends } from 'react-icons/fa';
import { AnimatedFollowButton } from '@/components/ui/animated-button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Community: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCommunityUsers();
  }, []);

  const loadCommunityUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await userService.searchUsers('');
      const publicUsers = allUsers.filter(u => 
        u.isPublic !== false && 
        u.uid !== user?.uid &&
        u.username &&
        u.username !== 'Anonymous User' &&
        !u.username.startsWith('Gamer')
      );
      setUsers(publicUsers);
      
      if (user) {
        const currentUser = await userService.getUserProfile(user.uid);
        if (currentUser && currentUser.following) {
          setFollowingUsers(new Set(currentUser.following));
        }
      }
    } catch (error) {
      console.error('Error loading community users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadCommunityUsers();
      return;
    }

    setLoading(true);
    try {
      const searchResults = await userService.searchUsers(query);
      const publicUsers = searchResults.filter(u => 
        u.isPublic !== false && 
        u.uid !== user?.uid &&
        u.username &&
        u.username !== 'Anonymous User' &&
        !u.username.startsWith('Gamer')
      );
      setUsers(publicUsers);
      toast.success(`Found ${publicUsers.length} users`);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUser: UserProfile) => {
    if (!user) return;

    try {
      const isFollowing = followingUsers.has(targetUser.uid);
      
      if (isFollowing) {
        await userService.unfollowUser(user.uid, targetUser.uid);
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(targetUser.uid);
          return newSet;
        });
        toast.success(`Unfollowed ${targetUser.username}`);
      } else {
        await userService.followUser(user.uid, targetUser.uid);
        setFollowingUsers(prev => new Set(prev).add(targetUser.uid));
        toast.success(`Following ${targetUser.username}`);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  const handleUserClick = (userProfile: UserProfile) => {
    navigate(`/user/${userProfile.username}`);
  };

  return (
    <>
      {/* Mobile Instagram-style Search UI */}
      <div className="min-h-screen bg-[#000000] text-[#FFFFFF] sm:hidden">
        {/* Top Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-[#9A9A9A]/20">
          <button onClick={() => navigate('/homepage')} className="p-2">
            <FaArrowLeft className="w-5 h-5 text-[#FFFFFF]" />
          </button>
          
          <div className="flex-1 mx-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9A9A9A] w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="w-full pl-10 pr-4 py-2 bg-[#000000] border border-[#9A9A9A]/40 rounded-lg text-[#FFFFFF] placeholder-[#9A9A9A] focus:outline-none focus:border-[#9A9A9A]/60"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/discussions')} className="p-2">
              <FaUserFriends className="w-5 h-5 text-[#FFFFFF]" />
            </button>
            {user && (
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.photoURL} alt={user.displayName} />
                <AvatarFallback className="bg-[#9A9A9A] text-[#FFFFFF] text-xs">
                  {user.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#9A9A9A]/20 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 bg-[#9A9A9A]/20 rounded w-24 mb-1 animate-pulse" />
                    <div className="h-3 bg-[#9A9A9A]/20 rounded w-32 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length > 0 ? (
            <div className="divide-y divide-[#9A9A9A]/20">
              {users.map((userProfile) => (
                <div
                  key={userProfile.uid}
                  onClick={() => handleUserClick(userProfile)}
                  className="flex items-center space-x-3 p-4 hover:bg-[#9A9A9A]/10 active:bg-[#9A9A9A]/20 transition-colors cursor-pointer"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={userProfile.photoURL} alt={userProfile.username} />
                    <AvatarFallback className="bg-[#9A9A9A] text-[#FFFFFF]">
                      {userProfile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <p 
                        className="font-semibold text-[#FFFFFF] truncate cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/${userProfile.username}`);
                        }}
                      >
                        @{userProfile.username}
                      </p>
                      {userProfile.isPublic && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-[#9A9A9A] text-sm truncate">
                      {userProfile.displayName || `${userProfile.followers.length} followers`}
                    </p>
                  </div>
                  
                  {user && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollowToggle(userProfile);
                      }}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        followingUsers.has(userProfile.uid)
                          ? 'bg-[#9A9A9A]/20 text-[#FFFFFF] border border-[#9A9A9A]/40'
                          : 'bg-blue-600 text-[#FFFFFF] hover:bg-blue-700'
                      }`}
                    >
                      {followingUsers.has(userProfile.uid) ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <FaUsers className="w-16 h-16 text-[#9A9A9A] mb-4" />
              <h3 className="text-lg font-medium text-[#FFFFFF] mb-2">No users found</h3>
              <p className="text-[#9A9A9A] text-center">
                {searchQuery ? 'Try a different search term' : 'Start typing to search for users'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop View - Original Layout */}
      <div className="hidden sm:block min-h-screen bg-[#000000]">
        <Navbar onSearch={() => {}} />
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <FaUsers className="text-primary text-2xl sm:text-3xl" />
              <h1 className="text-2xl sm:text-3xl font-bold text-[#FFFFFF]">Gaming Community</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/discussions')}
                className="flex items-center gap-2"
                size="sm"
              >
                <FaUserFriends className="w-4 h-4" />
                Discussions
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/homepage')}
                className="flex items-center gap-2"
                size="sm"
              >
                <FaArrowLeft className="w-4 h-4" />
                Back to Marketplace
              </Button>
            </div>
          </div>
          <p className="text-[#9A9A9A] text-lg">
            Connect with fellow gamers and discover new friends
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9A9A9A] w-4 h-4" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="pl-10 bg-[#000000] border-[#9A9A9A]/40 text-[#FFFFFF] placeholder-[#9A9A9A] focus:border-[#9A9A9A]/60"
            />
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-[#000000] border-[#9A9A9A]/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {users.map((userProfile) => (
              <Card 
                key={userProfile.uid} 
                className="bg-[#000000] border-[#9A9A9A]/20 hover:border-[#9A9A9A]/40 transition-all duration-300 cursor-pointer"
                onClick={() => handleUserClick(userProfile)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
                    <Avatar className="w-16 h-16 flex-shrink-0">
                      <AvatarImage src={userProfile.photoURL} alt={userProfile.username} />
                      <AvatarFallback className="text-lg">
                        {userProfile.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h3 
                        className="font-semibold text-lg truncate text-[#FFFFFF] cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/${userProfile.username}`);
                        }}
                      >
                        @{userProfile.username}
                      </h3>
                      {userProfile.displayName && (
                        <p className="text-sm text-[#9A9A9A] truncate">
                          {userProfile.displayName}
                        </p>
                      )}
                      <div className="flex items-center justify-center sm:justify-start gap-3 mt-1 text-xs text-[#9A9A9A]">
                        <span>{userProfile.followers.length} followers</span>
                        <span>{userProfile.following.length} following</span>
                      </div>
                    </div>
                  </div>

                  {userProfile.bio && (
                    <p className="text-sm text-[#9A9A9A] mb-4 line-clamp-2">
                      {userProfile.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <FaGamepad className="w-3 h-3 mr-1" />
                        Gamer
                      </Badge>
                      {userProfile.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          <FaUser className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </div>

                    {user && (
                      <AnimatedFollowButton
                        isFollowing={followingUsers.has(userProfile.uid)}
                        onToggle={(e) => {
                          e?.stopPropagation();
                          e?.preventDefault();
                          handleFollowToggle(userProfile);
                        }}
                        className="text-sm"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaUsers className="text-6xl text-[#9A9A9A] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-[#FFFFFF]">No users found</h3>
            <p className="text-[#9A9A9A]">
              {searchQuery ? 'Try a different search term' : 'Be the first to join the community!'}
            </p>
          </div>
        )}
        </main>
      </div>
    </>
  );
};

export default Community;