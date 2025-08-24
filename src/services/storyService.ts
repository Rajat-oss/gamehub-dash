import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc, arrayUnion, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Story, CreateStoryData } from '@/types/story';
import { userService } from './userService';

export const storyService = {
  async createStory(userId: string, storyData: CreateStoryData): Promise<string> {
    const user = await userService.getUserProfile(userId);
    if (!user) throw new Error('User not found');

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const docRef = await addDoc(collection(db, 'stories'), {
      userId,
      username: user.username,
      userPhotoURL: user.photoURL,
      mediaUrl: storyData.mediaUrl,
      mediaType: storyData.mediaType,
      createdAt: Timestamp.fromDate(now),
      expiresAt: Timestamp.fromDate(expiresAt),
      views: []
    });

    return docRef.id;
  },

  subscribeToFollowedUsersStories(userId: string, callback: (stories: Story[]) => void) {
    return new Promise(async (resolve) => {
      const userProfile = await userService.getUserProfile(userId);
      if (!userProfile) {
        callback([]);
        resolve(() => {});
        return;
      }

      const followingIds = [...(userProfile.following || []), userId]; // Include own stories
      
      // Simplified query - just filter by expiry, then filter by userId in memory
      const q = query(
        collection(db, 'stories'),
        where('expiresAt', '>', Timestamp.now()),
        orderBy('expiresAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const allStories = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          expiresAt: doc.data().expiresAt.toDate()
        })) as Story[];

        // Filter stories from followed users in memory
        const filteredStories = allStories
          .filter(story => followingIds.includes(story.userId))
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        callback(filteredStories);
      });

      resolve(unsubscribe);
    });
  },

  async viewStory(storyId: string, userId: string) {
    const storyRef = doc(db, 'stories', storyId);
    await updateDoc(storyRef, {
      views: arrayUnion(userId)
    });
  },

  async deleteStory(storyId: string) {
    const storyRef = doc(db, 'stories', storyId);
    await deleteDoc(storyRef);
  },

  async deleteExpiredStories() {
    const q = query(
      collection(db, 'stories'),
      where('expiresAt', '<=', Timestamp.now())
    );
    
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  },

  async getStoryViewers(storyId: string) {
    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDocs(query(collection(db, 'stories'), where('__name__', '==', storyId)));
    
    if (storyDoc.empty) return [];
    
    const story = storyDoc.docs[0].data();
    const viewerIds = story.views || [];
    
    const viewers = await Promise.all(
      viewerIds.map(async (uid: string) => {
        const user = await userService.getUserProfile(uid);
        return user ? {
          uid,
          username: user.username,
          photoURL: user.photoURL
        } : null;
      })
    );
    
    return viewers.filter(Boolean);
  }
};