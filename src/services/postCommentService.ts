import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc,
  query, 
  orderBy, 
  where,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { PostComment, CreateCommentData } from '@/types/post';
import { withFirestoreErrorHandling } from '@/utils/firestoreErrorHandler';
import { commentRateLimiter } from '@/utils/rateLimiter';
import { commentsCache } from '@/utils/cache';

export const postCommentService = {
  async addComment(postId: string, userId: string, username: string, userPhotoURL: string | undefined, commentData: CreateCommentData): Promise<string> {
    const rateLimitKey = `postComment_${userId}`;
    
    if (!commentRateLimiter.canMakeRequest(rateLimitKey)) {
      throw new Error('Too many comments. Please wait before commenting again.');
    }

    return withFirestoreErrorHandling(async () => {
      // Add comment
      const docRef = await addDoc(collection(db, 'postComments'), {
        postId,
        userId,
        username,
        userPhotoURL: userPhotoURL || '',
        content: commentData.content,
        createdAt: serverTimestamp()
      });
      
      // Update post comment count
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });
      
      // Clear cache
      commentsCache.delete(`postComments_${postId}`);
      
      return docRef.id;
    });
  },

  async getPostComments(postId: string): Promise<PostComment[]> {
    const cacheKey = `postComments_${postId}`;
    
    // Check cache first
    const cached = commentsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    return withFirestoreErrorHandling(async () => {
      const q = query(
        collection(db, 'postComments'),
        where('postId', '==', postId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const comments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as PostComment[];
      
      // Cache the result
      commentsCache.set(cacheKey, comments);
      
      return comments;
    });
  },

  // Removed real-time subscription to avoid permission errors
  // Using polling instead in the component
};