import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  Timestamp,
  query,
  collection,
  where,
  getDocs 
} from 'firebase/firestore';
import { 
  updateEmail, 
  updateProfile as updateFirebaseProfile,
  User 
} from 'firebase/auth';
import { db } from '@/lib/firebase';
import { withFirestoreErrorHandling } from '@/utils/firestoreErrorHandler';

export interface UserProfile {
  id: string;
  userName: string;
  email: string;
  bio?: string;
  avatar?: string;
  joinDate: Date;
  favoriteGames: string[];
  totalComments: number;
  averageRating: number;
}

const PROFILES_COLLECTION = 'userProfiles';

export const profileService = {
  // Get user profile from Firestore
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return withFirestoreErrorHandling(async () => {
      const docRef = doc(db, PROFILES_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          joinDate: data.joinDate?.toDate() || new Date()
        } as UserProfile;
      }
      
      return null;
    });
  },

  // Create or update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    return withFirestoreErrorHandling(async () => {
      const docRef = doc(db, PROFILES_COLLECTION, userId);
      const existingDoc = await getDoc(docRef);
      
      const profileData = {
        id: userId,
        ...updates,
        joinDate: existingDoc.exists() 
          ? existingDoc.data().joinDate 
          : Timestamp.now()
      };
      
      await setDoc(docRef, profileData, { merge: true });
      
      return {
        ...profileData,
        joinDate: profileData.joinDate?.toDate() || new Date()
      } as UserProfile;
    });
  },

  // Update email in both Firebase Auth and Firestore
  async updateUserEmail(user: User, newEmail: string): Promise<void> {
    return withFirestoreErrorHandling(async () => {
      // Update email in Firebase Auth
      await updateEmail(user, newEmail);
      
      // Update email in Firestore profile
      const docRef = doc(db, PROFILES_COLLECTION, user.uid);
      await updateDoc(docRef, { email: newEmail });
    });
  },

  // Check if username is available
  async isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean> {
    return withFirestoreErrorHandling(async () => {
      const q = query(
        collection(db, PROFILES_COLLECTION),
        where('userName', '==', username)
      );
      const querySnapshot = await getDocs(q);
      
      // If no documents found, username is available
      if (querySnapshot.empty) return true;
      
      // If current user is checking their own username, it's available
      if (currentUserId && querySnapshot.docs[0].id === currentUserId) {
        return true;
      }
      
      return false;
    });
  },

  // Update username in both Firebase Auth and Firestore
  async updateUserName(user: User, newUserName: string): Promise<void> {
    return withFirestoreErrorHandling(async () => {
      // Check if username is available
      const isAvailable = await this.isUsernameAvailable(newUserName, user.uid);
      if (!isAvailable) {
        throw new Error('Username is already taken. Please choose a different one.');
      }
      
      // Update display name in Firebase Auth
      await updateFirebaseProfile(user, { displayName: newUserName });
      
      // Update username in Firestore profile
      const docRef = doc(db, PROFILES_COLLECTION, user.uid);
      await updateDoc(docRef, { userName: newUserName });
    });
  }
};