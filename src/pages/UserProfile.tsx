import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { gameLogService } from '@/services/gameLogService';
import { UserProfile as UserProfileType } from '@/types/user';
import { GameLog } from '@/types/gameLog';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FaUser, FaGamepad, FaUsers, FaCalendar, FaHeart, FaArrowLeft, FaStar, FaTrophy, FaClock, FaList, FaEnvelope, FaComments, FaCheckCircle, FaFire, FaChartLine } from 'react-icons/fa';
import { AnimatedFollowButton } from '@/components/ui/animated-button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getGameById, TwitchGame } from '@/lib/twitch';
import { motion, AnimatePresence } from 'framer-motion';


const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [userGames, setUserGames] = useState<GameLog[]>([]);
  const [userFavorites, setUserFavorites] = useState<TwitchGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (username) {
      loadUserProfile();
    }
  }, [username]);

  const loadUserProfile = async () => {
    if (!username) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const userProfile = await userService.getUserByUsername(username);
      if (userProfile) {
        setProfile(userProfile);
        
        // Check if current user is following this user
        if (user && userProfile.followers.includes(user.uid)) {
          setIsFollowing(true);
        }
        
        // Load user's public games
        try {
          const games = await gameLogService.getUserGameLogs(userProfile.uid);
          setUserGames(games); // Show all games
        } catch (gameError) {
          console.error('Error loading user games:', gameError);
          // Don't fail the whole page if games can't load
        }
        
        // Load user's favorites
        try {
          if (userProfile.favoriteGames && userProfile.favoriteGames.length > 0) {
            const favoriteGamesData = await Promise.all(
              userProfile.favoriteGames.map(async (gameId: string) => {
                try {
                  const gameData = await getGameById(gameId);
                  return gameData;
                } catch (error) {
                  console.error(`Error loading game ${gameId}:`, error);
                  return null;
                }
              })
            );
            setUserFavorites(favoriteGamesData.filter((game): game is TwitchGame => game !== null));
          } else {
            setUserFavorites([]);
          }
        } catch (favError) {
          console.error('Error loading user favorites:', favError);
          setUserFavorites([]);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !profile) return;
    
    try {
      if (isFollowing) {
        await userService.unfollowUser(user.uid, profile.uid);
        setIsFollowing(false);
        toast.success(`Unfollowed ${profile.username}`);
      } else {
        await userService.followUser(user.uid, profile.uid);
        setIsFollowing(true);
        toast.success(`Following ${profile.username}`);
      }
      
      // Reload profile to update follower count
      loadUserProfile();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#0F1220] to-[#0A021F] relative overflow-hidden">
        {/* Animated background accent */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <Navbar onSearch={() => {}} />
        
        {/* Sticky progress bar */}
        <div className="sticky top-0 z-40 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] opacity-20" />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading skeleton with glassmorphism */}
          <div className="bg-[#0F1220]/92 backdrop-blur-xl border border-white/6 rounded-3xl p-8 mb-8">
            <div className="flex items-center gap-6 mb-6">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#0F1220]/92 backdrop-blur-xl border border-white/6 rounded-2xl p-6">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
          
          <div className="bg-[#0F1220]/92 backdrop-blur-xl border border-white/6 rounded-3xl p-8">
            <div className="flex gap-4 mb-6">
              <Skeleton className="h-10 w-32 rounded-full" />
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#0F1220] to-[#0A021F] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <Navbar onSearch={() => {}} />
        <div className="sticky top-0 z-40 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] opacity-20" />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-[#0F1220]/92 backdrop-blur-xl border border-white/6 rounded-3xl p-12 max-w-md mx-auto">
              <FaUser className="text-6xl text-white/40 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-3 text-white tracking-tight">User not found</h1>
              <p className="text-white/70 text-sm">The user @{username} doesn't exist.</p>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  const isOwnProfile = user?.uid === profile.uid;

  // Check if profile is private and user is not the owner
  if (!isOwnProfile && profile.isPublic === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#0F1220] to-[#0A021F] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <Navbar onSearch={() => {}} />
        <div className="sticky top-0 z-40 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] opacity-20" />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-[#0F1220]/92 backdrop-blur-xl border border-white/6 rounded-3xl p-12 max-w-md mx-auto">
              <FaUser className="text-6xl text-white/40 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-3 text-white tracking-tight">Private Profile</h1>
              <p className="text-white/70 text-sm">This user has set their profile to private.</p>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#0F1220] to-[#0A021F] relative overflow-hidden">
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
        {/* Breadcrumb */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate('/community')}
            className="flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-2xl px-4 py-2 text-sm font-medium"
          >
            <FaArrowLeft className="w-3 h-3" />
            Back to Community
          </Button>
        </motion.div>
        
        {/* Hero Profile Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="bg-[#0F1220]/92 backdrop-blur-xl border border-white/6 rounded-3xl p-8 mb-8 relative overflow-hidden"
        >
          {/* Subtle top-edge glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Avatar Section */}
            <div className="lg:col-span-3 flex flex-col items-center lg:items-start">
              <motion.div 
                className="relative group cursor-pointer"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] rounded-full p-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full h-full bg-[#0F1220] rounded-full" />
                </div>
                <Avatar className="relative w-32 h-32 border-2 border-transparent">
                  <AvatarImage src={profile.photoURL} alt={profile.username} className="object-cover" />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-[#8B5CF6] to-[#22D3EE] text-white">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {/* Optional verified badge */}
                {profile.followers && profile.followers.length > 50 && (
                  <div className="absolute -bottom-1 -right-1 bg-[#22D3EE] rounded-full p-2">
                    <FaCheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Profile Info */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight leading-tight mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em' }}>
                  @{profile.username}
                </h1>
                {profile.displayName && (
                  <p className="text-lg text-white/70 font-medium mb-3">{profile.displayName}</p>
                )}
              </div>
              
              {profile.bio && (
                <p className="text-white/80 text-base leading-relaxed max-w-2xl">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2 text-white/70">
                  <FaCalendar className="w-4 h-4 text-[#F59E0B]" />
                  <span>Joined {profile.joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <FaUsers className="w-4 h-4 text-[#22D3EE]" />
                  <span><strong className="text-white font-semibold">{profile.followers.length}</strong> followers</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <FaUsers className="w-4 h-4 text-[#8B5CF6]" />
                  <span><strong className="text-white font-semibold">{profile.following.length}</strong> following</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            {!isOwnProfile && user && (
              <div className="lg:col-span-3 flex flex-col gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <AnimatedFollowButton
                    isFollowing={isFollowing}
                    onToggle={handleFollowToggle}
                    className="w-full rounded-2xl py-3 px-6 font-semibold text-sm transition-all duration-200 focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 focus:ring-offset-[#0F1220]"
                  />
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={async () => {
                      if (!user) return;
                      
                      // Check if both users follow each other
                      const currentUserProfile = await userService.getUserProfile(user.uid);
                      const mutualFollow = isFollowing && currentUserProfile?.following.includes(profile.uid);
                      
                      if (!mutualFollow) {
                        toast.error('You can only message users who follow you back');
                        return;
                      }
                      
                      navigate(`/chat/${profile.uid}`);
                      toast.success(`Starting chat with ${profile.username}`);
                    }}
                    variant="outline"
                    className="w-full rounded-2xl py-3 px-6 font-semibold text-sm border-white/20 text-white/90 hover:bg-white/5 hover:border-white/30 transition-all duration-200 focus:ring-2 focus:ring-[#22D3EE] focus:ring-offset-2 focus:ring-offset-[#0F1220]"
                  >
                    <FaComments className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Gaming Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              icon: FaGamepad,
              value: userGames.length,
              label: 'Games Logged',
              color: '#8B5CF6',
              bgGradient: 'from-[#8B5CF6]/10 to-[#8B5CF6]/5'
            },
            {
              icon: FaTrophy,
              value: userGames.filter(g => g.status === 'completed').length,
              label: 'Completed',
              color: '#F59E0B',
              bgGradient: 'from-[#F59E0B]/10 to-[#F59E0B]/5'
            },
            {
              icon: FaStar,
              value: userGames.filter(g => g.rating && g.rating >= 4).length,
              label: 'Highly Rated',
              color: '#22D3EE',
              bgGradient: 'from-[#22D3EE]/10 to-[#22D3EE]/5'
            }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className={`bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl border border-white/6 rounded-2xl p-6 text-center group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 relative overflow-hidden`}
              >
                {/* Top edge glow */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="mb-4">
                    <IconComponent 
                      className="text-4xl mx-auto transition-all duration-300 group-hover:scale-110" 
                      style={{ color: stat.color }}
                    />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2 tabular-nums tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/70 font-medium">{stat.label}</div>
                </div>
                
                {/* Hover glow effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"
                  style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px ${stat.color}40` }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Games and Favorites Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-[#0F1220]/92 backdrop-blur-xl border border-white/6 rounded-3xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/30 to-transparent" />
          
          <Tabs defaultValue="games" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-sm">
                <TabsTrigger 
                  value="games" 
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8B5CF6] data-[state=active]:to-[#22D3EE] data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 hover:text-white/90"
                >
                  <FaGamepad className="w-4 h-4" />
                  Overview ({userGames.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="favorites" 
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8B5CF6] data-[state=active]:to-[#22D3EE] data-[state=active]:text-white data-[state=active]:shadow-lg text-white/70 hover:text-white/90"
                >
                  <FaHeart className="w-4 h-4" />
                  Favorites ({userFavorites.length})
                </TabsTrigger>
              </TabsList>
            </div>
              
            <AnimatePresence mode="wait">
              <TabsContent value="games" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {userGames.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userGames.map((game, index) => (
                        <motion.div
                          key={game.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 group hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <div className="flex items-start gap-4 mb-4">
                            {game.gameImageUrl && (
                              <div className="relative flex-shrink-0">
                                <img
                                  src={game.gameImageUrl}
                                  alt={game.gameName}
                                  className="w-16 h-20 object-cover rounded-xl border border-white/10"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 leading-tight">{game.gameName}</h3>
                              <Badge 
                                className={`text-xs mb-2 font-medium ${
                                  game.status === 'completed' 
                                    ? 'bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE]/30' 
                                    : 'bg-white/10 text-white/80 border-white/20'
                                }`}
                              >
                                {game.status.replace('-', ' ')}
                              </Badge>
                              {game.rating && game.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <FaStar className="text-[#F59E0B] w-3 h-3" />
                                  <span className="text-sm font-semibold text-white tabular-nums">{game.rating}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {game.notes && (
                            <p className="text-xs text-white/70 line-clamp-2 mb-3 leading-relaxed">
                              {game.notes}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-1 text-xs text-white/50">
                            <FaClock className="w-3 h-3" />
                            <span>{new Date(game.dateAdded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16"
                    >
                      <div className="bg-white/5 rounded-3xl p-12 max-w-md mx-auto border border-white/10">
                        <FaGamepad className="text-6xl text-white/30 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-white mb-3">No games logged yet</h3>
                        <p className="text-white/70 text-sm leading-relaxed">
                          {isOwnProfile ? 'Start logging your games to build your library!' : `${profile.username} hasn't logged any games yet.`}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>
              
              <TabsContent value="favorites" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {userFavorites.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userFavorites.map((game, index) => (
                        <motion.div
                          key={game.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 group hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8B5CF6]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <div className="flex items-start gap-4 mb-4">
                            {game.box_art_url && (
                              <div className="relative flex-shrink-0">
                                <img
                                  src={game.box_art_url}
                                  alt={game.name}
                                  className="w-16 h-20 object-cover rounded-xl border border-white/10"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 leading-tight">{game.name}</h3>
                              <Badge className="bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30 text-xs font-medium">
                                <FaHeart className="w-3 h-3 mr-1" />
                                Favorite
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16"
                    >
                      <div className="bg-white/5 rounded-3xl p-12 max-w-md mx-auto border border-white/10">
                        <FaHeart className="text-6xl text-white/30 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-white mb-3">No favorite games yet</h3>
                        <p className="text-white/70 text-sm leading-relaxed">
                          {isOwnProfile ? 'Add games to your favorites to see them here!' : `${profile.username} hasn't added any favorite games yet.`}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default UserProfile;