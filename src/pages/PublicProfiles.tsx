import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { subscribeToPublicProfiles } from '@/lib/publicProfiles';
import { UserProfile } from '@/lib/profile';
import { FaUser, FaGamepad, FaComments, FaStar, FaCalendar, FaArrowLeft, FaEnvelope, FaUserPlus, FaUserCheck } from 'react-icons/fa';
import { followUser, unfollowUser, isFollowing } from '@/lib/followers';
import { auth } from '@/lib/firebase';
import { Link } from 'react-router-dom';

const PublicProfiles = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});


  useEffect(() => {
    // Subscribe to real-time profiles from Firebase
    const unsubscribe = subscribeToPublicProfiles((newProfiles) => {
      setProfiles(newProfiles);
      checkFollowingStatus(newProfiles);
    });
    
    return () => unsubscribe();
  }, []);

  const checkFollowingStatus = async (profileList: UserProfile[]) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const statusMap: Record<string, boolean> = {};
    for (const profile of profileList) {
      statusMap[profile.id] = await isFollowing(profile.id, currentUser.uid);
    }
    setFollowingStatus(statusMap);
  };

  const handleFollowToggle = async (profile: UserProfile, e: React.MouseEvent) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const isCurrentlyFollowing = followingStatus[profile.id];
    
    if (isCurrentlyFollowing) {
      await unfollowUser(profile.id, currentUser.uid);
    } else {
      await followUser(profile.id, {
        id: currentUser.uid,
        name: currentUser.displayName || 'Anonymous',
        email: currentUser.email || ''
      });
    }
    
    setFollowingStatus(prev => ({
      ...prev,
      [profile.id]: !isCurrentlyFollowing
    }));
  };

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
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#1A1B2E] to-[#16213E] relative overflow-hidden">
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
      <div className="sticky top-0 z-40 h-1 bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#06B6D4] opacity-30" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/homepage">
            <Button variant="ghost" className="mb-6 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-2xl px-4 py-2">
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <FaUser className="text-[#8B5CF6] text-3xl" />
            <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '-0.02em' }}>Gaming Community</h1>
          </div>
          <p className="text-white/70 text-lg">
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
                  <div className="bg-gradient-to-br from-[#1E293B]/90 to-[#0F172A]/95 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-6 hover:from-[#1E293B]/95 hover:to-[#0F172A] hover:border-slate-600/40 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#06B6D4] rounded-full p-0.5 opacity-90">
                            <div className="w-full h-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-full" />
                          </div>
                          <Avatar className="relative h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-[#6366F1] to-[#06B6D4] text-white">
                              <FaUser className="w-6 h-6" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-slate-100">{profile.userName}</h3>
                          {profile.email && (
                            <p className="text-sm text-indigo-400 mb-1">{profile.email}</p>
                          )}
                          <div className="flex items-center space-x-1 text-sm text-slate-400">
                            <FaCalendar className="w-3 h-3 text-amber-400" />
                            <span>Joined {formatDate(profile.joinDate)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${gamerLevel.color} text-white text-xs font-medium px-2 py-1 rounded-full`}>
                        {gamerLevel.level}
                      </Badge>
                    </div>
                  
                    <div className="space-y-4">
                      {/* Bio */}
                      <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                        {profile.bio || 'No bio provided'}
                      </p>
                    
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="flex items-center justify-center space-x-1 text-indigo-400">
                            <FaGamepad className="w-4 h-4" />
                            <span className="font-semibold tabular-nums">{profile.favoriteGames.length}</span>
                          </div>
                          <p className="text-xs text-slate-500">Games</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-center space-x-1 text-cyan-400">
                            <FaComments className="w-4 h-4" />
                            <span className="font-semibold tabular-nums">{profile.totalComments}</span>
                          </div>
                          <p className="text-xs text-slate-500">Comments</p>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-center space-x-1 text-amber-400">
                            <FaStar className="w-4 h-4" />
                            <span className="font-semibold tabular-nums">{profile.averageRating.toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-slate-500">Rating</p>
                        </div>
                      </div>
                    
                      {/* Gaming Style Tags */}
                      <div className="flex flex-wrap gap-2">
                        {profile.totalComments > 5 && (
                          <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/30 text-xs font-medium">Active Reviewer</Badge>
                        )}
                        {profile.averageRating >= 4.0 && (
                          <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/30 text-xs font-medium">Quality Rater</Badge>
                        )}
                        {profile.favoriteGames.length >= 3 && (
                          <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/30 text-xs font-medium">Game Explorer</Badge>
                        )}
                        {Date.now() - profile.joinDate < 86400000 * 30 && (
                          <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/30 text-xs font-medium">New Member</Badge>
                        )}
                      </div>
                    
                      {/* Action Buttons */}
                      <div className="mt-4 pt-4 border-t border-slate-700/40 space-y-2">
                        <Button
                          onClick={(e) => handleFollowToggle(profile, e)}
                          className={`w-full rounded-2xl font-semibold text-sm transition-all duration-200 ${
                            followingStatus[profile.id] 
                              ? 'bg-slate-700/40 text-slate-200 border border-slate-600/30 hover:bg-slate-700/60' 
                              : 'bg-gradient-to-r from-[#6366F1] to-[#06B6D4] text-white hover:shadow-lg hover:shadow-indigo-500/25'
                          }`}
                        >
                          {followingStatus[profile.id] ? (
                            <>
                              <FaUserCheck className="w-4 h-4 mr-2" />
                              Following
                            </>
                          ) : (
                            <>
                              <FaUserPlus className="w-4 h-4 mr-2" />
                              Follow
                            </>
                          )}
                        </Button>
                        
                        {followingStatus[profile.id] && (
                          <Link to={`/chat/${profile.id}`} onClick={(e) => e.stopPropagation()}>
                            <Button className="w-full bg-slate-700/30 text-slate-200 border border-slate-600/30 hover:bg-slate-700/50 rounded-2xl font-semibold text-sm">
                              <FaEnvelope className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-[#1E293B]/90 to-[#0F172A]/95 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-12 max-w-md mx-auto">
              <FaUser className="text-6xl text-slate-600 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-100 mb-3">No Community Members Yet</h3>
              <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                Be the first to join the community! Add games to favorites, write reviews, or update your profile.
              </p>
              <Link to="/profile">
                <Button className="bg-gradient-to-r from-[#6366F1] to-[#06B6D4] text-white hover:shadow-lg hover:shadow-indigo-500/25 rounded-2xl font-semibold px-6 py-3">
                  Complete Your Profile
                </Button>
              </Link>
            </div>
          </div>
        )}


      </main>
    </div>
  );
};

export default PublicProfiles;