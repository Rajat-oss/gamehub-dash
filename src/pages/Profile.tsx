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
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
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

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingAvatar(true);
    try {
      const imageUrl = await cloudinaryService.uploadImage(file);
      await userService.updateUserProfile(user.uid, { photoURL: imageUrl });

      // Update Firebase Auth profile to keep it in sync
      await updateUserProfile({ photoURL: imageUrl });

      const updatedProfile = await userService.getUserProfile(user.uid);
      setProfile(updatedProfile);
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
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
      <div className="min-h-screen bg-background">
        <Navbar onSearch={() => { }} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-muted-foreground">Loading profile...</div>
        </div>
      </div>
    );
  }

  const favoriteGames = getFavorites();

  return (
    <div className="min-h-screen bg-background">
      <Navbar onSearch={() => { }} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card border border-border rounded-3xl p-8 mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="relative">
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full p-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full h-full bg-background rounded-full" />
                </div>
                <Avatar className="relative w-32 h-32 border-2 border-transparent">
                  <AvatarImage src={profile.photoURL} alt={profile.username} className="object-cover" />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    <FaUser />
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full p-0 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-200"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaCamera className="w-4 h-4" />
                  )}
                </Button>
              </motion.div>

              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight mb-2">
                {profile.username || profile.displayName}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <FaCalendar className="text-primary w-4 h-4" />
                <span className="text-sm">Joined {profile.joinDate ? formatDate(profile.joinDate.getTime()) : 'Recently'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card border border-border rounded-3xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h2 className="text-xl font-bold text-foreground mb-6">About</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
                  <p className="text-muted-foreground">{profile.email || 'No email provided'}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-foreground">Bio</label>
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
                        }} className="bg-primary hover:bg-primary/90">
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
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[100px] rounded-2xl"
                    />
                  ) : (
                    <p className="text-muted-foreground leading-relaxed">{profile.bio || 'No bio provided'}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2 text-foreground">
                      {isPublic ? <FaEye className="w-4 h-4 text-primary" /> : <FaEyeSlash className="w-4 h-4 text-muted-foreground" />}
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
              </div>
            </motion.div>

            {/* Favorite Games */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card border border-border rounded-3xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center">
                <FaGamepad className="w-5 h-5 mr-3 text-primary" />
                Favorite Games ({favoriteGames.length})
              </h2>

              {favoriteGames.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-4">
                  {favoriteGames.slice(0, 6).map((game, index) => (
                    <Link key={game.id} to={`/game/${game.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        className="bg-secondary/50 rounded-2xl p-3 hover:bg-secondary/80 transition-all duration-300 cursor-pointer border border-border hover:border-border/80"
                      >
                        <img
                          src={game.box_art_url}
                          alt={game.name}
                          className="w-full h-16 sm:h-20 object-cover rounded-xl mb-2 border border-border"
                          loading="lazy"
                        />
                        <p className="text-xs sm:text-sm font-medium truncate text-foreground">{game.name}</p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-secondary/30 rounded-3xl p-8 border border-border">
                    <FaGamepad className="text-4xl text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No favorite games yet. Start exploring!</p>
                  </div>
                </div>
              )}

              {favoriteGames.length > 6 && (
                <div className="mt-6">
                  <Link to="/favorites">
                    <Button variant="outline" className="w-full rounded-2xl">
                      View All Favorites
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card border border-border rounded-3xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h2 className="text-xl font-bold text-foreground mb-6">Stats</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-2xl border border-border">
                  <div className="flex items-center space-x-3">
                    <FaGamepad className="text-primary w-4 h-4" />
                    <span className="text-sm text-foreground">Favorite Games</span>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {favoriteGames.length}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-2xl border border-border">
                  <div className="flex items-center space-x-3">
                    <FaComments className="text-accent w-4 h-4" />
                    <span className="text-sm text-foreground">Comments</span>
                  </div>
                  <Badge className="bg-accent/20 text-accent border-accent/30">
                    {profile.totalComments || 0}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-2xl border border-border">
                  <div className="flex items-center space-x-3">
                    <FaStar className="text-yellow-500 w-4 h-4" />
                    <span className="text-sm text-foreground">Avg Rating</span>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                    {(profile.averageRating || 0).toFixed(1)}
                  </Badge>
                </div>
              </div>
            </motion.div>

            {/* Following Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card border border-border rounded-3xl p-6 cursor-pointer hover:bg-muted/50 hover:shadow-lg transition-all duration-300 shadow-sm"
              onClick={async () => {
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
              }}
            >
              <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                <FaUser className="w-4 h-4 text-primary" />
                Following ({profile.following?.length || 0})
              </h3>

              {profile.following && profile.following.length > 0 ? (
                <p className="text-sm text-foreground/70">Tap to view all</p>
              ) : (
                <p className="text-sm text-foreground/70">Not following anyone yet</p>
              )}
            </motion.div>

            {/* Followers Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card border border-border rounded-3xl p-6 cursor-pointer hover:bg-muted/50 hover:shadow-lg transition-all duration-300 shadow-sm"
              onClick={async () => {
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
              }}
            >
              <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                <FaUsers className="w-4 h-4 text-accent" />
                Followers ({profile.followers?.length || 0})
              </h3>

              {profile.followers && profile.followers.length > 0 ? (
                <p className="text-sm text-foreground/70">Tap to view all</p>
              ) : (
                <p className="text-sm text-foreground/70">No followers yet</p>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <Link to="/homepage">
                  <Button variant="outline" className="w-full justify-start rounded-2xl">
                    <FaGamepad className="w-4 h-4 mr-2" />
                    Browse Games
                  </Button>
                </Link>

                <Link to="/favorites">
                  <Button variant="outline" className="w-full justify-start rounded-2xl">
                    <FaStar className="w-4 h-4 mr-2" />
                    My Favorites
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Following Modal */}
      <Dialog open={showFollowingModal} onOpenChange={setShowFollowingModal}>
        <DialogContent className="max-w-md bg-card border border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Following ({profile?.following?.length || 0})</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {loadingFollowing ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : followingData.length > 0 ? (
              <div className="space-y-3">
                {followingData.map((user) => (
                  <motion.div
                    key={user.uid}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-2xl cursor-pointer transition-all duration-200"
                    onClick={() => {
                      setShowFollowingModal(false);
                      navigate(`/user/${user.username}`);
                    }}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.photoURL} alt={user.username} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">@{user.username}</p>
                      {user.displayName && (
                        <p className="text-sm text-muted-foreground">{user.displayName}</p>
                      )}
                    </div>
                  </motion.div>
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
        <DialogContent className="max-w-md bg-card border border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Followers ({profile?.followers?.length || 0})</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {loadingFollowers ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : followersData.length > 0 ? (
              <div className="space-y-3">
                {followersData.map((user) => (
                  <motion.div
                    key={user.uid}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-2xl cursor-pointer transition-all duration-200"
                    onClick={() => {
                      setShowFollowersModal(false);
                      navigate(`/user/${user.username}`);
                    }}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.photoURL} alt={user.username} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">@{user.username}</p>
                      {user.displayName && (
                        <p className="text-sm text-muted-foreground">{user.displayName}</p>
                      )}
                    </div>
                  </motion.div>
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