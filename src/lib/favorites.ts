import { TwitchGame } from './twitch';
import { userService } from '@/services/userService';

const FAVORITES_KEY = 'gamehub_favorites';

// Simple localStorage functions for immediate use
export function getFavorites(): TwitchGame[] {
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addToFavorites(game: TwitchGame): void {
  const favorites = getFavorites();
  if (!favorites.find(f => f.id === game.id)) {
    favorites.push(game);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
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