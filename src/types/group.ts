export interface GameGroup {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  ownerId: string;
  ownerName: string;
  members: GroupMember[];
  memberCount: number;
  isPrivate: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  userId: string;
  username: string;
  photoURL?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface GroupChallenge {
  id: string;
  groupId: string;
  title: string;
  description: string;
  gameId?: string;
  gameName?: string;
  type: 'tournament' | 'challenge' | 'event';
  startDate: Date;
  endDate: Date;
  participants: string[];
  maxParticipants?: number;
  prize?: string;
  status: 'upcoming' | 'active' | 'completed';
  createdBy: string;
  createdAt: Date;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  username: string;
  userPhotoURL?: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system';
}

export interface CreateGroupData {
  name: string;
  description: string;
  isPrivate: boolean;
  tags: string[];
}