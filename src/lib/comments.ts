export interface Comment {
  id: string;
  gameId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  rating?: number;
  timestamp: number;
  replies: Reply[];
}

export interface Reply {
  id: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  timestamp: number;
}

const COMMENTS_KEY = 'gamehub_comments';

export function getComments(gameId: string): Comment[] {
  const stored = localStorage.getItem(COMMENTS_KEY);
  const allComments: Comment[] = stored ? JSON.parse(stored) : [];
  return allComments.filter(comment => comment.gameId === gameId);
}

export function addComment(gameId: string, userName: string, comment: string, rating?: number): void {
  const stored = localStorage.getItem(COMMENTS_KEY);
  const allComments: Comment[] = stored ? JSON.parse(stored) : [];
  
  const newComment: Comment = {
    id: Date.now().toString(),
    gameId,
    userName,
    comment,
    rating,
    timestamp: Date.now(),
    replies: []
  };
  
  allComments.push(newComment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
  
  // Trigger storage event for real-time updates
  window.dispatchEvent(new StorageEvent('storage', {
    key: COMMENTS_KEY,
    newValue: JSON.stringify(allComments)
  }));
}

export function addReply(commentId: string, userName: string, comment: string): void {
  const stored = localStorage.getItem(COMMENTS_KEY);
  const allComments: Comment[] = stored ? JSON.parse(stored) : [];
  
  const commentIndex = allComments.findIndex(c => c.id === commentId);
  if (commentIndex !== -1) {
    const newReply: Reply = {
      id: Date.now().toString(),
      userName,
      comment,
      timestamp: Date.now()
    };
    
    allComments[commentIndex].replies.push(newReply);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
    
    // Trigger storage event for real-time updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: COMMENTS_KEY,
      newValue: JSON.stringify(allComments)
    }));
  }
}

export function getAverageRating(gameId: string): number {
  const comments = getComments(gameId);
  const ratingsOnly = comments.filter(c => c.rating).map(c => c.rating!);
  
  if (ratingsOnly.length === 0) return 0;
  
  const sum = ratingsOnly.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratingsOnly.length) * 10) / 10;
}