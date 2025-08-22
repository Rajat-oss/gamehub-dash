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
  commentCount: number;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userPhotoURL?: string;
  content: string;
  createdAt: Date;
}

export interface CreatePostData {
  content: string;
  mediaFile?: File;
  gameTitle?: string;
}

export interface CreateCommentData {
  content: string;
}