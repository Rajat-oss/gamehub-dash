export interface Post {
  id: string;
  userId: string;
  username: string;
  userPhotoURL?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  gameTitle?: string;
  createdAt: Date;
  updatedAt: Date;
  likes: string[];
  likeCount: number;
}

export interface CreatePostData {
  content: string;
  mediaFile?: File;
  gameTitle?: string;
}