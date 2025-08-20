import { UserProfile, getUserProfile } from './profile';
import { getFavorites } from './favorites';
import { db, auth } from './firebase';
import { collection, addDoc, query, onSnapshot, doc, setDoc, getDocs, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Track all users who have used the app in Firebase
export async function trackUser(profile: UserProfile): Promise<void> {
  try {
    // Get current auth user for real data
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    // Calculate real stats
    const realProfile = {
      ...profile,
      email: currentUser.email || profile.email || '',
      displayName: currentUser.displayName || profile.userName,
      photoURL: currentUser.photoURL || '',
      uid: currentUser.uid,
      favoriteGames: getFavorites().map(g => g.id),
      totalComments: calculateUserComments(profile.userName),
      averageRating: calculateUserAverageRating(profile.userName),
      lastActive: Date.now(),
      createdAt: profile.joinDate || Date.now()
    };
    
    // Use Firebase Auth UID as document ID
    await setDoc(doc(db, 'users', currentUser.uid), realProfile, { merge: true });
    console.log('User profile saved to Firebase:', realProfile);
  } catch (error) {
    console.error('Error tracking user:', error);
  }
}

function calculateUserComments(userName: string): number {
  const allComments = localStorage.getItem('gamehub_comments_global');
  if (!allComments) return 0;
  
  const comments = JSON.parse(allComments);
  return comments.filter((c: any) => c.userName === userName).length;
}

function calculateUserAverageRating(userName: string): number {
  const allComments = localStorage.getItem('gamehub_comments_global');
  if (!allComments) return 0;
  
  const comments = JSON.parse(allComments);
  const userComments = comments.filter((c: any) => c.userName === userName && c.rating);
  
  if (userComments.length === 0) return 0;
  
  const sum = userComments.reduce((acc: number, c: any) => acc + c.rating, 0);
  return Math.round((sum / userComments.length) * 10) / 10;
}

export function subscribeToPublicProfiles(callback: (profiles: UserProfile[]) => void) {
  // Get all users from Firestore
  const q = query(collection(db, 'users'));
  
  return onSnapshot(q, (snapshot) => {
    const profiles: UserProfile[] = [];
    const currentUser = auth.currentUser;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const profile: UserProfile = {
        id: doc.id,
        userName: data.userName || data.displayName || 'Anonymous User',
        email: data.email || '',
        bio: data.bio || '',
        joinDate: data.joinDate || data.createdAt || Date.now(),
        favoriteGames: data.favoriteGames || [],
        totalComments: data.totalComments || 0,
        averageRating: data.averageRating || 0
      };
      
      // Show only public profiles except current user
      if (profile.id !== currentUser?.uid && 
          profile.userName !== 'Anonymous User' && 
          !profile.userName.startsWith('Gamer') &&
          profile.email &&
          data.isPublic !== false) {
        profiles.push(profile);
      }
    });
    
    // Removed automatic user tracking to prevent infinite saves
    
    callback(profiles);
  }, (error) => {
    console.error('Error fetching profiles:', error);
    callback([]);
  });
}

export async function addToPublicProfiles(profile: UserProfile): Promise<void> {
  await trackUser(profile);
}

// Clear all users from Firebase (for testing/reset purposes)
export async function clearAllUsers(): Promise<void> {
  try {
    const q = query(collection(db, 'users'));
    const snapshot = await getDocs(q);
    
    const deletePromises = snapshot.docs.map(doc => {
      return setDoc(doc.ref, {}, { merge: false });
    });
    
    await Promise.all(deletePromises);
    console.log('All users cleared from Firebase');
  } catch (error) {
    console.error('Error clearing users:', error);
  }
}