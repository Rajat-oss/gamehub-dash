import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  limit,
  where,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { Discussion, DiscussionReply, CreateDiscussionData } from '@/types/discussion';

const DISCUSSIONS_COLLECTION = 'discussions';
const REPLIES_COLLECTION = 'discussionReplies';

export const discussionService = {
  async createDiscussion(userId: string, username: string, userPhotoURL: string | undefined, discussionData: CreateDiscussionData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, DISCUSSIONS_COLLECTION), {
        title: discussionData.title,
        content: discussionData.content,
        authorId: userId,
        authorName: username,
        authorPhotoURL: userPhotoURL || '',
        category: discussionData.category,
        tags: discussionData.tags,
        replies: [],
        replyCount: 0,
        likes: [],
        likeCount: 0,
        views: 0,
        isPinned: false,
        isLocked: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating discussion:', error);
      throw error;
    }
  },

  async getDiscussions(limitCount: number = 20): Promise<Discussion[]> {
    try {
      const q = query(
        collection(db, DISCUSSIONS_COLLECTION),
        orderBy('isPinned', 'desc'),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Discussion[];
    } catch (error) {
      console.error('Error getting discussions:', error);
      return [];
    }
  },

  async getDiscussionsByCategory(category: string): Promise<Discussion[]> {
    try {
      const q = query(
        collection(db, DISCUSSIONS_COLLECTION),
        where('category', '==', category)
      );
      const snapshot = await getDocs(q);
      const discussions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Discussion[];
      
      // Sort in memory
      return discussions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      console.error('Error getting discussions by category:', error);
      return [];
    }
  },

  async getDiscussion(discussionId: string): Promise<Discussion | null> {
    try {
      const docRef = doc(db, DISCUSSIONS_COLLECTION, discussionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Increment view count
        await updateDoc(docRef, {
          views: increment(1)
        });
        
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
        } as Discussion;
      }
      return null;
    } catch (error) {
      console.error('Error getting discussion:', error);
      return null;
    }
  },

  async likeDiscussion(discussionId: string, userId: string): Promise<void> {
    try {
      const discussionRef = doc(db, DISCUSSIONS_COLLECTION, discussionId);
      await updateDoc(discussionRef, {
        likes: arrayUnion(userId),
        likeCount: increment(1)
      });
    } catch (error) {
      console.error('Error liking discussion:', error);
      throw error;
    }
  },

  async unlikeDiscussion(discussionId: string, userId: string): Promise<void> {
    try {
      const discussionRef = doc(db, DISCUSSIONS_COLLECTION, discussionId);
      await updateDoc(discussionRef, {
        likes: arrayRemove(userId),
        likeCount: increment(-1)
      });
    } catch (error) {
      console.error('Error unliking discussion:', error);
      throw error;
    }
  },

  async addReply(discussionId: string, userId: string, username: string, userPhotoURL: string | undefined, content: string): Promise<void> {
    try {
      await addDoc(collection(db, REPLIES_COLLECTION), {
        discussionId,
        content,
        authorId: userId,
        authorName: username,
        authorPhotoURL: userPhotoURL || '',
        likes: [],
        likeCount: 0,
        createdAt: serverTimestamp()
      });

      // Update discussion reply count and last updated
      const discussionRef = doc(db, DISCUSSIONS_COLLECTION, discussionId);
      await updateDoc(discussionRef, {
        replyCount: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  },

  async getReplies(discussionId: string): Promise<DiscussionReply[]> {
    try {
      const q = query(
        collection(db, REPLIES_COLLECTION),
        where('discussionId', '==', discussionId),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as DiscussionReply[];
    } catch (error) {
      console.error('Error getting replies:', error);
      return [];
    }
  }
};