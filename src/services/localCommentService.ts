import { PostComment, CreateCommentData } from '@/types/post';

const COMMENTS_KEY = 'gamehub_post_comments';

export const localCommentService = {
  getPostComments(postId: string): PostComment[] {
    const stored = localStorage.getItem(COMMENTS_KEY);
    const allComments: PostComment[] = stored ? JSON.parse(stored) : [];
    return allComments
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  addComment(
    postId: string,
    userId: string,
    username: string,
    userPhotoURL: string | undefined,
    commentData: CreateCommentData
  ): PostComment {
    const comment: PostComment = {
      id: Date.now().toString(),
      postId,
      userId,
      username,
      userPhotoURL,
      content: commentData.content,
      createdAt: new Date()
    };

    const stored = localStorage.getItem(COMMENTS_KEY);
    const allComments: PostComment[] = stored ? JSON.parse(stored) : [];
    allComments.push(comment);
    
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
    return comment;
  },

  getCommentCount(postId: string): number {
    return this.getPostComments(postId).length;
  }
};