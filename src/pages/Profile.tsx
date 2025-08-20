import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userService } from '@/services/userService';
import { UserProfile } from '@/types/user';
import { getFavorites } from '@/lib/favorites';
import { useAuth } from '@/contexts/AuthContext';
import { FaUser, FaGamepad, FaCalendar, FaComments, FaStar, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';


const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        let userProfile = await userService.getUserProfile(user.uid);
        
        // Create profile if it doesn't exist
        if (!userProfile) {
          await userService.createUserProfile(user.uid, {
            username: user.displayName || 'Gamer' + Math.floor(Math.random() * 10000),
            displayName: user.displayName || '',
            email: user.email || '',
            isPublic: true
          });
          userProfile = await userService.getUserProfile(user.uid);
        }
        
        setProfile(userProfile);
        setBioText(userProfile.bio || '');
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      }
    };
    
    loadProfile();
  }, [user]);



  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  const favoriteGames = getFavorites();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="bg-gradient-card border-border/50 mb-8">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  <FaUser />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{profile.username || profile.displayName}</h1>
                <div className="flex items-center space-x-2 mt-2">
                  <FaCalendar className="text-muted-foreground w-4 h-4" />
                  <span className="text-muted-foreground">Joined {profile.joinDate ? formatDate(profile.joinDate.getTime()) : 'Recently'}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <p className="text-muted-foreground">{profile.email || 'No email provided'}</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Bio</label>
                    {isEditingBio ? (
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={async () => {
                          try {
                            await userService.updateUserProfile(user.uid, { bio: bioText });
                            const updatedProfile = await userService.getUserProfile(user.uid);
                            setProfile(updatedProfile);
                            setIsEditingBio(false);
                            toast.success('Bio updated successfully');
                          } catch (error) {
                            toast.error('Failed to update bio');
                          }
                        }}>
                          <FaSave className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setBioText(profile.bio || '');
                          setIsEditingBio(false);
                        }}>
                          <FaTimes className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setIsEditingBio(true)}>
                        <FaEdit className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  {isEditingBio ? (
                    <Textarea
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="bg-secondary/50 border-border/50 min-h-[100px]"
                    />
                  ) : (
                    <p className="text-muted-foreground">{profile.bio || 'No bio provided'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Favorite Games */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FaGamepad className="w-5 h-5 mr-2" />
                  Favorite Games ({favoriteGames.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favoriteGames.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {favoriteGames.slice(0, 6).map((game) => (
                      <Link key={game.id} to={`/game/${game.id}`}>
                        <div className="bg-secondary/30 rounded-lg p-3 hover:bg-secondary/50 transition-colors cursor-pointer">
                          <img
                            src={game.box_art_url}
                            alt={game.name}
                            className="w-full h-20 object-cover rounded mb-2"
                          />
                          <p className="text-sm font-medium truncate">{game.name}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No favorite games yet. Start exploring!</p>
                )}
                
                {favoriteGames.length > 6 && (
                  <div className="mt-4">
                    <Link to="/favorites">
                      <Button variant="outline" className="w-full">
                        View All Favorites
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaGamepad className="text-primary w-4 h-4" />
                    <span className="text-sm">Favorite Games</span>
                  </div>
                  <Badge variant="secondary">{favoriteGames.length}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaComments className="text-accent w-4 h-4" />
                    <span className="text-sm">Comments</span>
                  </div>
                  <Badge variant="secondary">{profile.totalComments || 0}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaStar className="text-yellow-400 w-4 h-4" />
                    <span className="text-sm">Avg Rating</span>
                  </div>
                  <Badge variant="secondary">{(profile.averageRating || 0).toFixed(1)}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/homepage">
                  <Button variant="outline" className="w-full justify-start">
                    <FaGamepad className="w-4 h-4 mr-2" />
                    Browse Games
                  </Button>
                </Link>
                
                <Link to="/favorites">
                  <Button variant="outline" className="w-full justify-start">
                    <FaStar className="w-4 h-4 mr-2" />
                    My Favorites
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;