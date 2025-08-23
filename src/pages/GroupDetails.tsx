import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { groupService } from '@/services/groupService';
import { GameGroup, GroupChallenge, GroupMessage } from '@/types/group';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FaArrowLeft, FaUsers, FaTrophy, FaComments, FaCrown, FaPlus } from 'react-icons/fa';
import { toast } from 'sonner';

const GroupDetails: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GameGroup | null>(null);
  const [challenges, setChallenges] = useState<GroupChallenge[]>([]);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupId) {
      loadGroupData();
    }
  }, [groupId]);

  const loadGroupData = async () => {
    if (!groupId) return;
    
    try {
      const [allGroups, challengeData, messageData] = await Promise.all([
        groupService.getGroups(),
        groupService.getGroupChallenges(groupId),
        groupService.getGroupMessages(groupId)
      ]);
      
      let groupData = allGroups.find(g => g.id === groupId);
      
      // If not found in public groups, check user's groups
      if (!groupData && user) {
        const userGroups = await groupService.getUserGroups(user.uid);
        groupData = userGroups.find(g => g.id === groupId);
      }
      
      setGroup(groupData || null);
      setChallenges(challengeData);
      setMessages(messageData.reverse());
    } catch (error) {
      console.error('Error loading group data:', error);
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !groupId) return;

    try {
      await groupService.sendMessage(groupId, user.uid, user.displayName || 'User', newMessage);
      setNewMessage('');
      loadGroupData();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleLeaveGroup = async () => {
    if (!user || !groupId || !group) return;
    
    if (group.ownerId === user.uid) {
      toast.error('Group owners cannot leave their groups');
      return;
    }

    if (confirm('Are you sure you want to leave this group?')) {
      try {
        await groupService.leaveGroup(groupId, user.uid);
        toast.success('Left group successfully');
        navigate('/groups');
      } catch (error) {
        console.error('Error leaving group:', error);
        toast.error('Failed to leave group');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Group not found</h1>
          <Button onClick={() => navigate('/groups')}>Back to Groups</Button>
        </div>
      </div>
    );
  }

  const isUserMember = user && group.members.some(member => member.userId === user.uid);
  const isOwner = user && group.ownerId === user.uid;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate('/groups')} className="mb-6">
          <FaArrowLeft className="w-4 h-4 mr-2" />
          Back to Groups
        </Button>

        {/* Group Header */}
        <Card className="bg-gradient-card border-border/50 mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{group.name}</CardTitle>
                  {isOwner && <FaCrown className="text-yellow-500 w-5 h-5" />}
                </div>
                <p className="text-muted-foreground mb-4">{group.description}</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FaUsers className="w-4 h-4" />
                    <span>{group.memberCount} members</span>
                  </div>
                  <div className="flex gap-2">
                    {group.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              {user && !isUserMember && (
                <Button onClick={() => groupService.joinGroup(group.id, user.uid, user.displayName || 'User')}>
                  Join Group
                </Button>
              )}
              {isUserMember && !isOwner && (
                <Button variant="outline" onClick={handleLeaveGroup}>
                  Leave Group
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <FaComments className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <FaTrophy className="w-4 h-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <FaUsers className="w-4 h-4" />
              Members
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-6">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Group Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto mb-4 space-y-3 p-4 bg-secondary/20 rounded-lg">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">{message.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{message.username}</span>
                            <span className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {isUserMember ? (
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      Send
                    </Button>
                  </form>
                ) : (
                  <p className="text-center text-muted-foreground">Join the group to participate in chat</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Group Challenges</h3>
              {isUserMember && (
                <Button size="sm">
                  <FaPlus className="w-4 h-4 mr-2" />
                  Create Challenge
                </Button>
              )}
            </div>
            {challenges.length === 0 ? (
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="text-center py-12">
                  <FaTrophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No challenges yet</h3>
                  <p className="text-muted-foreground">Create the first challenge for your group!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {challenges.map((challenge) => (
                  <Card key={challenge.id} className="bg-gradient-card border-border/50">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{challenge.title}</h4>
                          <p className="text-muted-foreground">{challenge.description}</p>
                        </div>
                        <Badge variant={challenge.status === 'active' ? 'default' : 'secondary'}>
                          {challenge.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{challenge.participants.length} participants</span>
                        <span>{challenge.endDate.toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="mt-6">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Members ({group.memberCount})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {group.members.map((member) => (
                    <div key={member.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{member.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.username}</span>
                            {member.role === 'owner' && <FaCrown className="text-yellow-500 w-4 h-4" />}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Joined {member.joinedAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GroupDetails;