import { PostComment, CreateCommentData } from '@/types/post';

const COMMENTS_KEY = 'gamehub_post_comments';

export const localCommentService = {
  addComment(postId: string, userId: string, username: string, userPhotoURL: string | undefined, commentData: CreateCommentData): string {
    const comments = this.getAllComments();
    const newComment: PostComment = {
      id: Date.now().toString(),
      postId,
      userId,
      username,
      userPhotoURL: userPhotoURL || '',
      content: commentData.content,
      createdAt: new Date()
    };
    
    comments.push(newComment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    
    // Update post comment count
    this.updatePostCommentCount(postId);
    
    return newComment.id;
  },

  getPostComments(postId: string): PostComment[] {
    const comments = this.getAllComments();
    return comments.filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  },

  getAllComments(): PostComment[] {
    const stored = localStorage.getItem(COMMENTS_KEY);
    if (!stored) return [];
    
    const comments = JSON.parse(stored);
    return comments.map((comment: any) => ({
      ...comment,
      createdAt: new Date(comment.createdAt)
    }));
  },

  updatePostCommentCount(postId: string) {
    const posts = JSON.parse(localStorage.getItem('gamehub_posts') || '[]');
    const postIndex = posts.findIndex((p: any) => p.id === postId);
    if (postIndex !== -1) {
      const commentCount = this.getPostComments(postId).length;
      posts[postIndex].commentCount = commentCount;
      localStorage.setItem('gamehub_posts', JSON.stringify(posts));
    }
  }
};