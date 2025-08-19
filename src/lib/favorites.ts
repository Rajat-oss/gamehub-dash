import { TwitchGame } from './twitch';

const FAVORITES_KEY = 'gamehub_favorites';

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