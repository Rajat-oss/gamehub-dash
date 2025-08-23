import { gameLogService } from './gameLogService';
import { getFavorites } from '@/lib/favorites';
import { fetchPopularGames, Game } from './igdbApi';
import { TwitchGame } from '@/lib/twitch';

export interface GameRecommendation extends Game {
  score: number;
  reason: string;
}

export const gameRecommendationService = {
  async getRecommendations(userId: string): Promise<GameRecommendation[]> {
    try {
      // Get user's game library and favorites
      const [userGames, favorites, allGames] = await Promise.all([
        gameLogService.getUserGameLogs(userId),
        Promise.resolve(getFavorites()),
        fetchPopularGames()
      ]);

      // Extract genres and preferences from user's games
      const userGenres = new Map<string, number>();
      const completedGames = new Set<string>();
      const highRatedGames: string[] = [];

      // Analyze user's library
      userGames.forEach(log => {
        completedGames.add(log.gameId);
        if (log.genre) {
          userGenres.set(log.genre, (userGenres.get(log.genre) || 0) + 1);
        }
        if (log.rating && log.rating >= 4) {
          highRatedGames.push(log.gameId);
        }
      });

      // Analyze favorites
      favorites.forEach(fav => {
        completedGames.add(fav.id);
        // Boost genre preference for favorites
        if (fav.name) {
          // Simple genre detection based on game name
          const detectedGenre = this.detectGenreFromName(fav.name);
          if (detectedGenre) {
            userGenres.set(detectedGenre, (userGenres.get(detectedGenre) || 0) + 2);
          }
        }
      });

      // Get top user genres
      const topGenres = Array.from(userGenres.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);

      // If user has no preferences, show popular games
      if (topGenres.length === 0 && userGames.length === 0 && favorites.length === 0) {
        return allGames
          .filter(game => game.rating && game.rating > 80)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 12)
          .map(game => ({
            ...game,
            score: game.rating || 0,
            reason: 'Popular recommendation'
          }));
      }

      // Score and filter recommendations
      const recommendations: GameRecommendation[] = allGames
        .filter(game => !completedGames.has(game.id.toString()))
        .map(game => {
          let score = 0;
          let reason = '';

          // Genre matching
          if (game.genres && topGenres.length > 0) {
            const gameGenres = game.genres.map(g => g.name.toLowerCase());
            const genreMatches = topGenres.filter(userGenre => 
              gameGenres.some(gameGenre => 
                gameGenre.includes(userGenre.toLowerCase()) || 
                userGenre.toLowerCase().includes(gameGenre)
              )
            );
            
            if (genreMatches.length > 0) {
              score += genreMatches.length * 30;
              reason = `Similar to your favorite ${genreMatches[0]} games`;
            }
          }

          // Rating boost
          if (game.rating && game.rating > 85) {
            score += 20;
            if (!reason) reason = 'Highly rated game';
          }

          // Popular game boost
          if (game.rating && game.rating > 80) {
            score += 10;
          }

          // Base score for all games if no preferences
          if (topGenres.length === 0) {
            score += game.rating || 50;
          }

          // Default reason if none set
          if (!reason) reason = 'Popular recommendation';

          return {
            ...game,
            score,
            reason
          };
        })
        .filter(rec => rec.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12);

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  },

  detectGenreFromName(gameName: string): string | null {
    const name = gameName.toLowerCase();
    
    if (name.includes('rpg') || name.includes('witcher') || name.includes('elder scrolls')) {
      return 'RPG';
    }
    if (name.includes('shooter') || name.includes('call of duty') || name.includes('battlefield')) {
      return 'Shooter';
    }
    if (name.includes('racing') || name.includes('forza') || name.includes('gran turismo')) {
      return 'Racing';
    }
    if (name.includes('strategy') || name.includes('civilization') || name.includes('total war')) {
      return 'Strategy';
    }
    if (name.includes('sports') || name.includes('fifa') || name.includes('nba')) {
      return 'Sports';
    }
    if (name.includes('adventure') || name.includes('assassin') || name.includes('tomb raider')) {
      return 'Adventure';
    }
    
    return null;
  }
};