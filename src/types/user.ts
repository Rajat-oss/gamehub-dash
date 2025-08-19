export interface UserProfile {
  uid: string;
  username: string;
  displayName?: string;
  email: string;
  photoURL?: string;
  bio?: string;
  joinDate: Date;
  followers: string[];
  following: string[];
  isPublic: boolean;
}

export interface FollowData {
  followerId: string;
  followingId: string;
  timestamp: Date;
}