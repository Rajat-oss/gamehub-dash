import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/dashboard/Navbar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { subscribeToPublicProfiles } from '@/lib/publicProfiles';
import { UserProfile } from '@/lib/profile';
import { FaUser, FaGamepad, FaComments, FaStar, FaCalendar, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PublicProfiles = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);


  useEffect(() => {
    // Subscribe to real-time profiles from Firebase
    const unsubscribe = subscribeToPublicProfiles((newProfiles) => {
      setProfiles(newProfiles);
    });
    
    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const sortedProfiles = profiles;

  const getGamerLevel = (comments: number, rating: number) => {
    const score = comments * 0.1 + rating;
    if (score >= 10) return { level: 'Elite Gamer', color: 'bg-purple-600' };
    if (score >= 7) return { level: 'Pro Gamer', color: 'bg-blue-600' };
    if (score >= 4) return { level: 'Active Gamer', color: 'bg-green-600' };
    return { level: 'Casual Gamer', color: 'bg-gray-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4">
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <FaUser className="text-primary text-3xl" />
            <h1 className="text-3xl font-bold text-foreground">Gaming Community</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover fellow gamers and their gaming profiles on Pixel Pilgrim
          </p>
        </div>



        {/* Profiles Grid */}
        {sortedProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProfiles.map((profile) => {
              const gamerLevel = getGamerLevel(profile.totalComments, profile.averageRating);
              
              return (
                <Link key={profile.id} to={`/user/${profile.id}`}>
                  <Card className="bg-gradient-card border-border/50 hover:shadow-glow-primary transition-all duration-300 cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <FaUser className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{profile.userName}</h3>
                          {profile.email && (
                            <p className="text-sm text-primary mb-1">{profile.email}</p>
                          )}
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <FaCalendar className="w-3 h-3" />
                            <span>Joined {formatDate(profile.joinDate)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${gamerLevel.color} text-white text-xs`}>
                        {gamerLevel.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Bio */}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {profile.bio || 'No bio provided'}
                    </p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center space-x-1 text-primary">
                          <FaGamepad className="w-4 h-4" />
                          <span className="font-semibold">{profile.favoriteGames.length}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Games</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-center space-x-1 text-accent">
                          <FaComments className="w-4 h-4" />
                          <span className="font-semibold">{profile.totalComments}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Comments</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-center space-x-1 text-yellow-400">
                          <FaStar className="w-4 h-4" />
                          <span className="font-semibold">{profile.averageRating.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                    </div>
                    
                    {/* Gaming Style Tags */}
                    <div className="flex flex-wrap gap-1">
                      {profile.totalComments > 5 && (
                        <Badge variant="secondary" className="text-xs">Active Reviewer</Badge>
                      )}
                      {profile.averageRating >= 4.0 && (
                        <Badge variant="secondary" className="text-xs">Quality Rater</Badge>
                      )}
                      {profile.favoriteGames.length >= 3 && (
                        <Badge variant="secondary" className="text-xs">Game Explorer</Badge>
                      )}
                      {Date.now() - profile.joinDate < 86400000 * 30 && (
                        <Badge variant="secondary" className="text-xs">New Member</Badge>
                      )}
                    </div>
                  </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-card border border-border/50 rounded-lg">
            <FaUser className="text-6xl text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Community Members Yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to join the community! Add games to favorites, write reviews, or update your profile.
            </p>
            <Link to="/profile">
              <Button className="bg-gradient-primary hover:shadow-glow-primary">
                Complete Your Profile
              </Button>
            </Link>
          </div>
        )}


      </main>
    </div>
  );
};

export default PublicProfiles;