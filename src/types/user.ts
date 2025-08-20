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
  favoriteGames?: string[]; // Array of game IDs
}

export interface FollowData {
  followerId: string;
  followingId: string;
  timestamp: Date;
}