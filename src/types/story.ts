export interface Story {
  id: string;
  userId: string;
  username: string;
  userPhotoURL?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: Date;
  expiresAt: Date;
  views: string[];
}

export interface CreateStoryData {
  mediaUrl: string;
  mediaType: 'image' | 'video';
}