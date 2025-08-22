import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { Post, CreatePostData } from '@/types/post';
import { cloudinaryService } from './cloudinaryService';

export const postService = {
  async createPost(userId: string, username: string, userPhotoURL: string | undefined, postData: CreatePostData): Promise<string> {
    try {
      let mediaUrl = '';
      
      if (postData.mediaFile) {
        mediaUrl = await cloudinaryService.uploadImage(postData.mediaFile);
      }
      
      const docRef = await addDoc(collection(db, 'posts'), {
        userId,
        username,
        userPhotoURL: userPhotoURL || '',
        content: postData.content,
        mediaUrl,
        mediaType: postData.mediaFile?.type.startsWith('video/') ? 'video' : 'image',
        gameTitle: postData.gameTitle || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: [],
        likeCount: 0
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  async getPosts(limitCount: number = 20): Promise<Post[]> {
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Post[];
    } catch (error) {
      console.error('Error getting posts:', error);
      throw error;
    }
  },

  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const q = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Post[];
    } catch (error) {
      console.error('Error getting user posts:', error);
      throw error;
    }
  },

  async likePost(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: arrayUnion(userId),
        likeCount: increment(1)
      });
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: arrayRemove(userId),
        likeCount: increment(-1)
      });
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  },

  async deletePost(postId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }
};