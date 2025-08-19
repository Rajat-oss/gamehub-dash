import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { UserProfile } from '@/types/user';
import { Navbar } from '@/components/dashboard/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FaUsers, FaSearch, FaHeart, FaGamepad, FaUser } from 'react-icons/fa';
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
      // Temporarily show empty due to quota limits
      setUsers([]);
      toast.error('Community temporarily unavailable due to quota limits');
      
      // Load current user's following list
      if (user) {
        const currentUser = await userService.getUserProfile(user.uid);
        if (currentUser) {
          setFollowingUsers(new Set(currentUser.following));
        }
      }
    } catch (error) {
      console.error('Error loading community users:', error);
      toast.error('Failed to load community users');
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
      setUsers(searchResults.filter(u => u.isPublic && u.uid !== user?.uid));
      toast.success(`Found ${searchResults.length} users`);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
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

  const handleUserClick = (username: string) => {
    navigate(`/user/${username}`);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <FaUsers className="text-primary text-3xl" />
            <h1 className="text-3xl font-bold text-foreground">Gaming Community</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Connect with fellow gamers and discover new friends
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
            />
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-gradient-card border-border/50">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((userProfile) => (
              <Card 
                key={userProfile.uid} 
                className="bg-gradient-card border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer"
                onClick={() => handleUserClick(userProfile.username)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={userProfile.photoURL} alt={userProfile.username} />
                      <AvatarFallback className="text-lg">
                        {userProfile.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">@{userProfile.username}</h3>
                      {userProfile.displayName && (
                        <p className="text-sm text-muted-foreground truncate">
                          {userProfile.displayName}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{userProfile.followers.length} followers</span>
                        <span>{userProfile.following.length} following</span>
                      </div>
                    </div>
                  </div>

                  {userProfile.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
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
                      <Button
                        size="sm"
                        variant={followingUsers.has(userProfile.uid) ? "outline" : "default"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowToggle(userProfile);
                        }}
                        className={followingUsers.has(userProfile.uid) ? "border-red-500 text-red-500 hover:bg-red-50" : ""}
                      >
                        <FaHeart className="w-3 h-3 mr-2" />
                        {followingUsers.has(userProfile.uid) ? 'Unfollow' : 'Follow'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaUsers className="text-6xl text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Be the first to join the community!'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Community;