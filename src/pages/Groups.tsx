import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { groupService } from '@/services/groupService';
import { GameGroup } from '@/types/group';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateGroupModal } from '@/components/groups/CreateGroupModal';
import { FaPlus, FaUsers, FaCrown, FaLock, FaGlobe } from 'react-icons/fa';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Groups: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<GameGroup[]>([]);
  const [userGroups, setUserGroups] = useState<GameGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadGroups();
    if (user) {
      loadUserGroups();
    }
  }, [user]);

  const loadGroups = async () => {
    try {
      const allGroups = await groupService.getGroups();
      setGroups(allGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const loadUserGroups = async () => {
    if (!user) return;
    try {
      const myGroups = await groupService.getUserGroups(user.uid);
      setUserGroups(myGroups);
    } catch (error) {
      console.error('Error loading user groups:', error);
    }
  };

  const handleJoinGroup = async (group: GameGroup) => {
    if (!user) {
      toast.error('Please sign in to join groups');
      return;
    }

    try {
      await groupService.joinGroup(group.id, user.uid, user.displayName || 'User');
      toast.success(`Joined ${group.name}!`);
      loadGroups();
      loadUserGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group');
    }
  };

  const handleGroupCreated = () => {
    loadGroups();
    loadUserGroups();
    setIsCreateModalOpen(false);
  };

  const isUserInGroup = (group: GameGroup) => {
    return user && group.members.some(member => member.userId === user.uid);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gaming Groups</h1>
            <p className="text-muted-foreground">Join communities and compete with fellow gamers</p>
          </div>
          {user && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
              <FaPlus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          )}
        </div>

        {/* User's Groups */}
        {user && userGroups.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">My Groups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userGroups.map((group) => (
                <Card key={group.id} className="bg-gradient-card border-border/50 hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => navigate(`/groups/${group.id}`)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {group.ownerId === user?.uid && <FaCrown className="text-yellow-500 w-4 h-4" />}
                        {group.isPrivate ? <FaLock className="text-muted-foreground w-4 h-4" /> : <FaGlobe className="text-muted-foreground w-4 h-4" />}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{group.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaUsers className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{group.memberCount} members</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {group.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Groups */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Discover Groups</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-gradient-card border-border/50">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                      <div className="h-8 bg-muted rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : groups.length === 0 ? (
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="text-center py-12">
                <FaUsers className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No groups yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to create a gaming community!</p>
                {user && (
                  <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
                    <FaPlus className="w-4 h-4 mr-2" />
                    Create First Group
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Card key={group.id} className="bg-gradient-card border-border/50 hover:border-primary/50 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        {group.isPrivate ? <FaLock className="text-muted-foreground w-4 h-4" /> : <FaGlobe className="text-muted-foreground w-4 h-4" />}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{group.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FaUsers className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{group.memberCount} members</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {group.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{group.ownerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">by {group.ownerName}</span>
                      </div>
                      {user && !isUserInGroup(group) ? (
                        <Button size="sm" onClick={() => handleJoinGroup(group)}>
                          Join
                        </Button>
                      ) : isUserInGroup(group) ? (
                        <Button size="sm" variant="outline" onClick={() => navigate(`/groups/${group.id}`)}>
                          View
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Sign in to join
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
};

export default Groups;