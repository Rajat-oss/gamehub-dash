import { TwitchGame } from './twitch';
import { userService } from '@/services/userService';
import { notificationService } from '@/services/notificationService';
import { auth } from './firebase';

const FAVORITES_KEY = 'gamehub_favorites';

// Simple localStorage functions for immediate use
export function getFavorites(): TwitchGame[] {
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export async function addToFavorites(game: TwitchGame): Promise<void> {
  const favorites = getFavorites();
  if (!favorites.find(f => f.id === game.id)) {
    favorites.push(game);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    
    // Notify followers about new favorite game
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userProfile = await userService.getUserProfile(currentUser.uid);
        if (userProfile && userProfile.isPublic !== false) {
          await notificationService.notifyFollowersAboutGame(
            currentUser.uid,
            userProfile.username || 'A user',
            userProfile.photoURL || '',
            game.id,
            game.name,
            game.box_art_url,
            'game_favorited'
          );
        }
      } catch (error) {
        console.error('Error notifying followers about favorite:', error);
      }
    }
  }
}

export function removeFromFavorites(gameId: string): void {
  const favorites = getFavorites().filter(f => f.id !== gameId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function isFavorite(gameId: string): boolean {
  return getFavorites().some(f => f.id === gameId);
}

// Firestore functions for user profiles
export async function addToUserFavorites(userId: string, gameId: string): Promise<void> {
  try {
    await userService.addToFavorites(userId, gameId);
  } catch (error) {
    console.error('Error adding to user favorites:', error);
  }
}

export async function removeFromUserFavorites(userId: string, gameId: string): Promise<void> {
  try {
    await userService.removeFromFavorites(userId, gameId);
  } catch (error) {
    console.error('Error removing from user favorites:', error);
  }
}