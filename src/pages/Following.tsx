import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { UserProfile } from '@/types/user';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FaUsers, FaArrowLeft, FaHeart } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const Following: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFollowing();
    }
  }, [user]);

  const loadFollowing = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userProfile = await userService.getUserProfile(user.uid);
      if (userProfile?.following && userProfile.following.length > 0) {
        const followingData = await Promise.all(
          userProfile.following.map(uid => userService.getUserProfile(uid))
        );
        setFollowing(followingData.filter(Boolean) as UserProfile[]);
      }
    } catch (error) {
      console.error('Error loading following:', error);
      toast.error('Failed to load following');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (targetUser: UserProfile) => {
    if (!user) return;
    
    try {
      await userService.unfollowUser(user.uid, targetUser.uid);
      setFollowing(prev => prev.filter(u => u.uid !== targetUser.uid));
      toast.success(`Unfollowed ${targetUser.username}`);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">Please log in to view who you're following.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Profile
          </Button>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <FaUsers className="text-green-500 text-3xl" />
            <h1 className="text-3xl font-bold text-foreground">Following</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            People you follow ({following.length})
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : following.length > 0 ? (
          <div className="space-y-4">
            {following.map((followedUser) => (
              <Card key={followedUser.uid} className="bg-gradient-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={followedUser.photoURL} alt={followedUser.username} />
                      <AvatarFallback>
                        {followedUser.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">@{followedUser.username}</h3>
                      {followedUser.displayName && (
                        <p className="text-muted-foreground">{followedUser.displayName}</p>
                      )}
                      {followedUser.bio && (
                        <p className="text-sm text-muted-foreground mt-1">{followedUser.bio}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link to={`/user/${followedUser.username}`}>
                        <Button variant="outline">
                          View Profile
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                        onClick={() => handleUnfollow(followedUser)}
                      >
                        Unfollow
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaUsers className="text-6xl text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Not following anyone yet</h3>
            <p className="text-muted-foreground mb-4">
              Discover and follow other gamers!
            </p>
            <Link to="/community">
              <Button variant="outline">
                Browse Community
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Following;