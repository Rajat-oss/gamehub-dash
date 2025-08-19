export interface GameLog {
  id: string;
  userId: string;
  gameId: string;
  gameName: string;
  gameImageUrl?: string;
  status: GameStatus;
  rating?: number; // 1-5 stars
  notes?: string;
  dateAdded: Date;
  dateUpdated: Date;
  hoursPlayed?: number;
  platform?: string;
  genre?: string;
}

export type GameStatus = 
  | 'want-to-play' 
  | 'playing' 
  | 'completed' 
  | 'on-hold' 
  | 'dropped';

export interface GameLogInput {
  gameId: string;
  gameName: string;
  gameImageUrl?: string;
  status: GameStatus;
  rating?: number;
  notes?: string;
  hoursPlayed?: number;
  platform?: string;
  genre?: string;
}

export interface GameLogStats {
  totalGames: number;
  completed: number;
  playing: number;
  wantToPlay: number;
  onHold: number;
  dropped: number;
  averageRating: number;
}

export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  'want-to-play': 'Want to Play',
  'playing': 'Currently Playing',
  'completed': 'Completed',
  'on-hold': 'On Hold',
  'dropped': 'Dropped'
};

export const GAME_STATUS_COLORS: Record<GameStatus, string> = {
  'want-to-play': 'bg-blue-500',
  'playing': 'bg-green-500',
  'completed': 'bg-purple-500',
  'on-hold': 'bg-yellow-500',
  'dropped': 'bg-red-500'
};
