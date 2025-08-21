import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userService } from '@/services/userService';
import { UserProfile } from '@/types/user';
import { getFavorites } from '@/lib/favorites';
import { useAuth } from '@/contexts/AuthContext';
import { FaUser, FaGamepad, FaCalendar, FaComments, FaStar, FaEdit, FaSave, FaTimes, FaEye, FaEyeSlash, FaUsers, FaCamera } from 'react-icons/fa';
import { cloudinaryService } from '@/services/cloudinaryService';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';


const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersData, setFollowersData] = useState<UserProfile[]>([]);
  const [followingData, setFollowingData] = useState<UserProfile[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
        setIsPublic(userProfile.isPublic !== false);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      }
    };
    
    loadProfile();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingAvatar(true);
    try {
      const imageUrl = await cloudinaryService.uploadImage(file);
      
      // Update user profile with new avatar
      await userService.updateUserProfile(user.uid, { photoURL: imageUrl });
      
      // Reload profile to show new avatar
      const updatedProfile = await userService.getUserProfile(user.uid);
      setProfile(updatedProfile);
      
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      e.target.value = '';
    }
  };



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
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.photoURL} alt={profile.username} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    <FaUser />
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaCamera className="w-3 h-3" />
                  )}
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
                
                {/* Privacy Setting */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      {isPublic ? <FaEye className="w-4 h-4" /> : <FaEyeSlash className="w-4 h-4" />}
                      Profile Visibility
                    </Label>
                    <Switch 
                      checked={isPublic} 
                      onCheckedChange={async (checked) => {
                        try {
                          await userService.updateUserProfile(user.uid, { isPublic: checked });
                          setIsPublic(checked);
                          toast.success(checked ? 'Profile is now public' : 'Profile is now private');
                        } catch (error) {
                          toast.error('Failed to update privacy setting');
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isPublic ? 'Your profile is visible to everyone' : 'Your profile is private and hidden from others'}
                  </p>
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3 sm:gap-4">
                    {favoriteGames.slice(0, 6).map((game) => (
                      <Link key={game.id} to={`/game/${game.id}`}>
                        <div className="bg-secondary/30 rounded-lg p-2 sm:p-3 hover:bg-secondary/50 transition-colors cursor-pointer">
                          <img
                            src={game.box_art_url}
                            alt={game.name}
                            className="w-full h-16 sm:h-20 object-cover rounded mb-2"
                          />
                          <p className="text-xs sm:text-sm font-medium truncate">{game.name}</p>
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

            {/* Following */}
            <Card className="bg-gradient-card border-border/50 cursor-pointer hover:border-primary/50 transition-colors" onClick={async () => {
              if (profile.following && profile.following.length > 0) {
                setLoadingFollowing(true);
                setShowFollowingModal(true);
                try {
                  const followingProfiles = await Promise.all(
                    profile.following.map(uid => userService.getUserProfile(uid))
                  );
                  setFollowingData(followingProfiles.filter(Boolean) as UserProfile[]);
                } catch (error) {
                  console.error('Error loading following:', error);
                } finally {
                  setLoadingFollowing(false);
                }
              }
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaUser className="w-4 h-4" />
                  Following ({profile.following?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.following && profile.following.length > 0 ? (
                  <p className="text-sm text-muted-foreground">Tap to view all</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not following anyone yet</p>
                )}
              </CardContent>
            </Card>

            {/* Followers */}
            <Card className="bg-gradient-card border-border/50 cursor-pointer hover:border-primary/50 transition-colors" onClick={async () => {
              if (profile.followers && profile.followers.length > 0) {
                setLoadingFollowers(true);
                setShowFollowersModal(true);
                try {
                  const followersProfiles = await Promise.all(
                    profile.followers.map(uid => userService.getUserProfile(uid))
                  );
                  setFollowersData(followersProfiles.filter(Boolean) as UserProfile[]);
                } catch (error) {
                  console.error('Error loading followers:', error);
                } finally {
                  setLoadingFollowers(false);
                }
              }
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaUsers className="w-4 h-4" />
                  Followers ({profile.followers?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.followers && profile.followers.length > 0 ? (
                  <p className="text-sm text-muted-foreground">Tap to view all</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No followers yet</p>
                )}
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

      {/* Following Modal */}
      <Dialog open={showFollowingModal} onOpenChange={setShowFollowingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Following ({profile?.following?.length || 0})</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {loadingFollowing ? (
              <div className="text-center py-4">Loading...</div>
            ) : followingData.length > 0 ? (
              <div className="space-y-3">
                {followingData.map((user) => (
                  <div key={user.uid} className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-lg cursor-pointer" onClick={() => {
                    setShowFollowingModal(false);
                    navigate(`/user/${user.username}`);
                  }}>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.photoURL} alt={user.username} />
                      <AvatarFallback>
                        {user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">@{user.username}</p>
                      {user.displayName && (
                        <p className="text-sm text-muted-foreground">{user.displayName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No following found</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Followers Modal */}
      <Dialog open={showFollowersModal} onOpenChange={setShowFollowersModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Followers ({profile?.followers?.length || 0})</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {loadingFollowers ? (
              <div className="text-center py-4">Loading...</div>
            ) : followersData.length > 0 ? (
              <div className="space-y-3">
                {followersData.map((user) => (
                  <div key={user.uid} className="flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-lg cursor-pointer" onClick={() => {
                    setShowFollowersModal(false);
                    navigate(`/user/${user.username}`);
                  }}>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.photoURL} alt={user.username} />
                      <AvatarFallback>
                        {user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">@{user.username}</p>
                      {user.displayName && (
                        <p className="text-sm text-muted-foreground">{user.displayName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No followers found</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;