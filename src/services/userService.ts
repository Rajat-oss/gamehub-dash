import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { UserProfile } from '@/types/user';
import { notificationService } from './notificationService';

const USERS_COLLECTION = 'users';

export const userService = {
  // Create or update user profile
  async createUserProfile(uid: string, userData: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid,
        username: userData.username || `user_${uid.slice(0, 8)}`,
        displayName: userData.displayName || '',
        email: userData.email || '',
        photoURL: userData.photoURL || '',
        bio: userData.bio || '',
        joinDate: new Date(),
        followers: [],
        following: [],
        favoriteGames: [],
        isPublic: true,
        ...userData
      });
    }
  },

  // Get user profile by UID
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        joinDate: data.joinDate ? data.joinDate.toDate() : new Date()
      } as UserProfile;
    }
    return null;
  },

  // Get user profile by username
  async getUserByUsername(username: string): Promise<UserProfile | null> {
    const q = query(collection(db, USERS_COLLECTION), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        ...data,
        joinDate: data.joinDate ? data.joinDate.toDate() : new Date()
      } as UserProfile;
    }
    return null;
  },

  // Check if username is available
  async isUsernameAvailable(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    return !user;
  },

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, updates);
  },

  // Follow a user
  async followUser(followerId: string, followingId: string): Promise<void> {
    try {
      const followerRef = doc(db, USERS_COLLECTION, followerId);
      const followingRef = doc(db, USERS_COLLECTION, followingId);
      
      // Ensure both users exist and have the required arrays
      const [followerDoc, followingDoc] = await Promise.all([
        getDoc(followerRef),
        getDoc(followingRef)
      ]);
      
      // Create user profiles if they don't exist
      if (!followerDoc.exists()) {
        await this.createUserProfile(followerId, {});
      }
      if (!followingDoc.exists()) {
        await this.createUserProfile(followingId, {});
      }
      
      // Initialize arrays if they don't exist
      const followerData = followerDoc.exists() ? followerDoc.data() : {};
      const followingData = followingDoc.exists() ? followingDoc.data() : {};
      
      await Promise.all([
        updateDoc(followerRef, {
          following: arrayUnion(followingId),
          ...(followerData.following ? {} : { following: [] })
        }),
        updateDoc(followingRef, {
          followers: arrayUnion(followerId),
          ...(followingData.followers ? {} : { followers: [] })
        })
      ]);
      
      // Create notification for the followed user
      const followerProfile = await this.getUserProfile(followerId);
      if (followerProfile) {
        console.log('Creating follow notification for:', followingId, 'from:', followerProfile.username);
        await notificationService.createNotification({
          userId: followingId,
          type: 'follow',
          title: 'New Follower',
          message: `${followerProfile.username} started following you`,
          fromUserId: followerId,
          fromUsername: followerProfile.username,
          read: false
        });
        console.log('Follow notification created successfully');
      } else {
        console.log('Could not find follower profile for:', followerId);
      }
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  // Unfollow a user
  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      const followerRef = doc(db, USERS_COLLECTION, followerId);
      const followingRef = doc(db, USERS_COLLECTION, followingId);
      
      await Promise.all([
        updateDoc(followerRef, {
          following: arrayRemove(followingId)
        }),
        updateDoc(followingRef, {
          followers: arrayRemove(followerId)
        })
      ]);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },

  // Search users by username
  async searchUsers(query: string): Promise<UserProfile[]> {
    const q = collection(db, USERS_COLLECTION);
    const querySnapshot = await getDocs(q);
    
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const matchesQuery = !query || data.username.toLowerCase().includes(query.toLowerCase());
      const isPublic = data.isPublic !== false; // Default to public if not set
      if (matchesQuery && isPublic) {
        const joinDate = data.joinDate 
          ? (typeof data.joinDate.toDate === 'function' ? data.joinDate.toDate() : new Date(data.joinDate))
          : new Date();
        
        users.push({
          ...data,
          joinDate
        } as UserProfile);
      }
    });
    
    return users.slice(0, 20);
  },

  // Add game to favorites
  async addToFavorites(uid: string, gameId: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      favoriteGames: arrayUnion(gameId)
    });
  },

  // Remove game from favorites
  async removeFromFavorites(uid: string, gameId: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      favoriteGames: arrayRemove(gameId)
    });
  },

  // Get all public users for suggestions
  async getAllPublicUsers(): Promise<UserProfile[]> {
    const q = query(collection(db, USERS_COLLECTION), where('isPublic', '!=', false));
    const querySnapshot = await getDocs(q);
    
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const joinDate = data.joinDate 
        ? (typeof data.joinDate.toDate === 'function' ? data.joinDate.toDate() : new Date(data.joinDate))
        : new Date();
      
      users.push({
        ...data,
        joinDate
      } as UserProfile);
    });
    
    return users;
  },

  // Cleanup function - remove user document by username (for testing)
  async deleteUserByUsername(username: string): Promise<void> {
    try {
      const q = query(collection(db, USERS_COLLECTION), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await userDoc.ref.delete();
        console.log(`Deleted user document for username: ${username}`);
      }
    } catch (error) {
      console.error('Error deleting user document:', error);
      throw error;
    }
  }
};