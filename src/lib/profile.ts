export interface UserProfile {
  id: string;
  userName: string;
  email?: string;
  bio?: string;
  avatar?: string;
  joinDate: number;
  favoriteGames: string[];
  totalComments: number;
  averageRating: number;
}

const PROFILE_KEY = 'gamehub_user_profile';

export function getUserProfile(): UserProfile | null {
  const stored = localStorage.getItem(PROFILE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function createUserProfile(userName: string): UserProfile {
  const profile: UserProfile = {
    id: Date.now().toString(),
    userName,
    joinDate: Date.now(),
    favoriteGames: [],
    totalComments: 0,
    averageRating: 0
  };
  
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  
  // Immediately track user in Firebase
  import('./publicProfiles').then(({ trackUser }) => {
    trackUser(profile);
  });
  
  return profile;
}

export function updateUserProfile(updates: Partial<UserProfile>): UserProfile {
  const currentProfile = getUserProfile();
  if (!currentProfile) {
    throw new Error('No profile found');
  }
  
  const updatedProfile = { ...currentProfile, ...updates };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
  
  // Update username in localStorage if changed
  if (updates.userName) {
    localStorage.setItem('gamehub_username', updates.userName);
  }
  
  // Track user in public profiles
  import('./publicProfiles').then(({ trackUser }) => {
    trackUser(updatedProfile);
  });
  
  return updatedProfile;
}

export function getOrCreateProfile(): UserProfile {
  let profile = getUserProfile();
  if (!profile) {
    // Get real user data from Firebase Auth
    import('./firebase').then(({ auth }) => {
      const user = auth.currentUser;
      const storedUserName = localStorage.getItem('gamehub_username') || user?.displayName || 'Gamer' + Math.floor(Math.random() * 10000);
      profile = createUserProfile(storedUserName);
      
      // Set real email from Firebase Auth
      if (user?.email) {
        profile!.email = user.email;
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      }
    });
    
    if (!profile) {
      const storedUserName = localStorage.getItem('gamehub_username') || 'Gamer' + Math.floor(Math.random() * 10000);
      profile = createUserProfile(storedUserName);
    }
  }
  
  // Track user in public profiles
  import('./publicProfiles').then(({ trackUser }) => {
    trackUser(profile!);
  });
  
  return profile;
}