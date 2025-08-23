export interface Discussion {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  category: string;
  tags: string[];
  replies: DiscussionReply[];
  replyCount: number;
  likes: string[];
  likeCount: number;
  views: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  likes: string[];
  likeCount: number;
  createdAt: Date;
}

export interface CreateDiscussionData {
  title: string;
  content: string;
  category: string;
  tags: string[];
}