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
import { FaUser, FaGamepad, FaCalendar, FaComments, FaStar, FaEdit, FaSave, FaTimes, FaEye, FaEyeSlash, FaUsers, FaCamera, FaCheckCircle } from 'react-icons/fa';
import { cloudinaryService } from '@/services/cloudinaryService';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';


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
      <div className="min-h-screen bg-[#000000] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <Navbar onSearch={() => {}} />
        <div className="sticky top-0 z-40 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] opacity-20" />
        
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-[#9A9A9A]">Loading profile...</div>
        </div>
      </div>
    );
  }

  const favoriteGames = getFavorites();

  return (
    <div className="min-h-screen bg-[#000000] relative overflow-hidden">
      {/* Animated background accent */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3 left-2/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      
      <Navbar onSearch={() => {}} />
      
      {/* Sticky progress bar */}
      <div className="sticky top-0 z-40 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] opacity-20" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="bg-[#000000] border border-[#9A9A9A]/20 rounded-3xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="relative">
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] rounded-full p-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full h-full bg-[#0F1220] rounded-full" />
                </div>
                <Avatar className="relative w-32 h-32 border-2 border-transparent">
                  <AvatarImage src={profile.photoURL} alt={profile.username} className="object-cover" />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] text-white">
                    <FaUser />
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full p-0 bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] hover:shadow-lg transition-all duration-200"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
              <h1 className="text-3xl font-bold text-[#FFFFFF] tracking-tight leading-tight mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
                {profile.username || profile.displayName}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-[#9A9A9A]">
                <FaCalendar className="text-[#F59E0B] w-4 h-4" />
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
              className="bg-[#000000] border border-[#9A9A9A]/20 rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
              
              <h2 className="text-xl font-bold text-[#FFFFFF] mb-6">About</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#FFFFFF]">Email</label>
                  <p className="text-[#9A9A9A]">{profile.email || 'No email provided'}</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-[#FFFFFF]">Bio</label>
                    {isEditingBio ? (
                      <div className="flex space-x-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                          }} className="bg-[#22D3EE] hover:bg-[#22D3EE]/80 text-white">
                            <FaSave className="w-3 h-3" />
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button size="sm" variant="outline" onClick={() => {
                            setBioText(profile.bio || '');
                            setIsEditingBio(false);
                          }} className="border-white/20 text-white/80 hover:bg-white/5">
                            <FaTimes className="w-3 h-3" />
                          </Button>
                        </motion.div>
                      </div>
                    ) : (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingBio(true)} className="border-white/20 text-white/80 hover:bg-white/5">
                          <FaEdit className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                  {isEditingBio ? (
                    <Textarea
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="bg-[#000000] border-[#9A9A9A]/40 text-[#FFFFFF] placeholder:text-[#9A9A9A] min-h-[100px] rounded-2xl focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
                    />
                  ) : (
                    <p className="text-[#9A9A9A] leading-relaxed">{profile.bio || 'No bio provided'}</p>
                  )}
                </div>
                
                {/* Privacy Setting */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2 text-[#FFFFFF]">
                      {isPublic ? <FaEye className="w-4 h-4 text-[#22D3EE]" /> : <FaEyeSlash className="w-4 h-4 text-white/50" />}
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
                  <p className="text-sm text-[#9A9A9A]">
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
              className="bg-[#000000] border border-[#9A9A9A]/20 rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
              
              <h2 className="text-xl font-bold text-[#FFFFFF] mb-6 flex items-center">
                <FaGamepad className="w-5 h-5 mr-3 text-[#8B5CF6]" />
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
                        className="bg-white/5 rounded-2xl p-3 hover:bg-white/8 transition-all duration-300 cursor-pointer border border-white/10 hover:border-white/20 group"
                      >
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <img
                          src={game.box_art_url}
                          alt={game.name}
                          className="w-full h-16 sm:h-20 object-cover rounded-xl mb-2 border border-white/10"
                          loading="lazy"
                        />
                        <p className="text-xs sm:text-sm font-medium truncate text-[#FFFFFF]">{game.name}</p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
                    <FaGamepad className="text-4xl text-white/30 mx-auto mb-4" />
                    <p className="text-[#9A9A9A]">No favorite games yet. Start exploring!</p>
                  </div>
                </div>
              )}
              
              {favoriteGames.length > 6 && (
                <div className="mt-6">
                  <Link to="/favorites">
                    <Button variant="outline" className="w-full border-[#9A9A9A]/40 text-[#FFFFFF] hover:bg-[#9A9A9A]/10 rounded-2xl">
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
              className="bg-[#000000] border border-[#9A9A9A]/20 rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
              
              <h2 className="text-xl font-bold text-[#FFFFFF] mb-6">Stats</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#000000] rounded-2xl border border-[#9A9A9A]/20">
                  <div className="flex items-center space-x-3">
                    <FaGamepad className="text-[#8B5CF6] w-4 h-4" />
                    <span className="text-sm text-[#FFFFFF]">Favorite Games</span>
                  </div>
                  <Badge className="bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30 font-semibold tabular-nums">
                    {favoriteGames.length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#000000] rounded-2xl border border-[#9A9A9A]/20">
                  <div className="flex items-center space-x-3">
                    <FaComments className="text-[#22D3EE] w-4 h-4" />
                    <span className="text-sm text-[#FFFFFF]">Comments</span>
                  </div>
                  <Badge className="bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE]/30 font-semibold tabular-nums">
                    {profile.totalComments || 0}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#000000] rounded-2xl border border-[#9A9A9A]/20">
                  <div className="flex items-center space-x-3">
                    <FaStar className="text-[#F59E0B] w-4 h-4" />
                    <span className="text-sm text-[#FFFFFF]">Avg Rating</span>
                  </div>
                  <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30 font-semibold tabular-nums">
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
              className="bg-[#000000] border border-[#9A9A9A]/20 rounded-3xl p-6 relative overflow-hidden cursor-pointer hover:bg-[#9A9A9A]/10 transition-all duration-300 group"
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
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <h3 className="text-lg font-bold text-[#FFFFFF] mb-2 flex items-center gap-2">
                <FaUser className="w-4 h-4 text-[#8B5CF6]" />
                Following ({profile.following?.length || 0})
              </h3>
              
              {profile.following && profile.following.length > 0 ? (
                <p className="text-sm text-[#9A9A9A]">Tap to view all</p>
              ) : (
                <p className="text-sm text-[#9A9A9A]">Not following anyone yet</p>
              )}
            </motion.div>

            {/* Followers Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-[#000000] border border-[#9A9A9A]/20 rounded-3xl p-6 relative overflow-hidden cursor-pointer hover:bg-[#9A9A9A]/10 transition-all duration-300 group"
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
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22D3EE]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <h3 className="text-lg font-bold text-[#FFFFFF] mb-2 flex items-center gap-2">
                <FaUsers className="w-4 h-4 text-[#22D3EE]" />
                Followers ({profile.followers?.length || 0})
              </h3>
              
              {profile.followers && profile.followers.length > 0 ? (
                <p className="text-sm text-[#9A9A9A]">Tap to view all</p>
              ) : (
                <p className="text-sm text-[#9A9A9A]">No followers yet</p>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-[#000000] border border-[#9A9A9A]/20 rounded-3xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
              
              <h3 className="text-lg font-bold text-[#FFFFFF] mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link to="/homepage">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full justify-start border-[#9A9A9A]/40 text-[#FFFFFF] hover:bg-[#9A9A9A]/10 rounded-2xl">
                      <FaGamepad className="w-4 h-4 mr-2" />
                      Browse Games
                    </Button>
                  </motion.div>
                </Link>
                
                <Link to="/favorites">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full justify-start border-[#9A9A9A]/40 text-[#FFFFFF] hover:bg-[#9A9A9A]/10 rounded-2xl">
                      <FaStar className="w-4 h-4 mr-2" />
                      My Favorites
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Following Modal */}
      <Dialog open={showFollowingModal} onOpenChange={setShowFollowingModal}>
        <DialogContent className="max-w-md bg-[#000000] border border-[#9A9A9A]/40 text-[#FFFFFF]">
          <DialogHeader>
            <DialogTitle className="text-[#FFFFFF]">Following ({profile?.following?.length || 0})</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {loadingFollowing ? (
              <div className="text-center py-4 text-[#9A9A9A]">Loading...</div>
            ) : followingData.length > 0 ? (
              <div className="space-y-3">
                {followingData.map((user) => (
                  <motion.div 
                    key={user.uid} 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 hover:bg-[#9A9A9A]/10 rounded-2xl cursor-pointer transition-all duration-200" 
                    onClick={() => {
                      setShowFollowingModal(false);
                      navigate(`/user/${user.username}`);
                    }}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.photoURL} alt={user.username} />
                      <AvatarFallback className="bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] text-white">
                        {user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-[#FFFFFF]">@{user.username}</p>
                      {user.displayName && (
                        <p className="text-sm text-[#9A9A9A]">{user.displayName}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-[#9A9A9A]">No following found</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Followers Modal */}
      <Dialog open={showFollowersModal} onOpenChange={setShowFollowersModal}>
        <DialogContent className="max-w-md bg-[#000000] border border-[#9A9A9A]/40 text-[#FFFFFF]">
          <DialogHeader>
            <DialogTitle className="text-[#FFFFFF]">Followers ({profile?.followers?.length || 0})</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {loadingFollowers ? (
              <div className="text-center py-4 text-[#9A9A9A]">Loading...</div>
            ) : followersData.length > 0 ? (
              <div className="space-y-3">
                {followersData.map((user) => (
                  <motion.div 
                    key={user.uid} 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 hover:bg-[#9A9A9A]/10 rounded-2xl cursor-pointer transition-all duration-200" 
                    onClick={() => {
                      setShowFollowersModal(false);
                      navigate(`/user/${user.username}`);
                    }}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.photoURL} alt={user.username} />
                      <AvatarFallback className="bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] text-white">
                        {user.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-[#FFFFFF]">@{user.username}</p>
                      {user.displayName && (
                        <p className="text-sm text-[#9A9A9A]">{user.displayName}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-[#9A9A9A]">No followers found</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;