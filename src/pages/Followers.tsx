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
import { FaUsers, FaArrowLeft, FaUser } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const Followers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFollowers();
    }
  }, [user]);

  const loadFollowers = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userProfile = await userService.getUserProfile(user.uid);
      if (userProfile?.followers && userProfile.followers.length > 0) {
        const followersData = await Promise.all(
          userProfile.followers.map(uid => userService.getUserProfile(uid))
        );
        setFollowers(followersData.filter(Boolean) as UserProfile[]);
      }
    } catch (error) {
      console.error('Error loading followers:', error);
      toast.error('Failed to load followers');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">Please log in to view your followers.</div>
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
            <FaUsers className="text-blue-500 text-3xl" />
            <h1 className="text-3xl font-bold text-foreground">My Followers</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            People who follow you ({followers.length})
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : followers.length > 0 ? (
          <div className="space-y-4">
            {followers.map((follower) => (
              <Card key={follower.uid} className="bg-gradient-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={follower.photoURL} alt={follower.username} />
                      <AvatarFallback>
                        {follower.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">@{follower.username}</h3>
                      {follower.displayName && (
                        <p className="text-muted-foreground">{follower.displayName}</p>
                      )}
                      {follower.bio && (
                        <p className="text-sm text-muted-foreground mt-1">{follower.bio}</p>
                      )}
                    </div>
                    
                    <Link to={`/user/${follower.username}`}>
                      <Button variant="outline">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaUsers className="text-6xl text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No followers yet</h3>
            <p className="text-muted-foreground">
              Share your profile to gain followers!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Followers;