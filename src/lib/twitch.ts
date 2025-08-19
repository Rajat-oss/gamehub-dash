const TWITCH_CLIENT_ID = 'picryc9twxcf895poytzpq0kpil4sc';
const TWITCH_CLIENT_SECRET = 'tjt9b91l94rk07av1nzppbc9zsfvgc';
const TWITCH_API_BASE = 'https://api.twitch.tv/helix';
const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';
const RAWG_API_KEY = 'a3abcc7420fd4c08be50dd90a8365cb8';

let accessToken: string | null = null;

export interface TwitchGame {
  id: string;
  name: string;
  box_art_url: string;
  igdb_id?: string;
  isRawgGame?: boolean;
  rawgId?: number;
}

export interface GameDetails {
  id: string;
  name: string;
  summary?: string;
  storyline?: string;
  genres?: string[];
  platforms?: string[];
  release_date?: string;
  rating?: number;
  box_art_url: string;
}

export interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
}

async function getAccessToken(): Promise<string> {
  if (accessToken) return accessToken;

  const response = await fetch(TWITCH_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  accessToken = data.access_token;
  return accessToken!;
}

async function twitchApiRequest(endpoint: string): Promise<any> {
  const token = await getAccessToken();
  
  const response = await fetch(`${TWITCH_API_BASE}${endpoint}`, {
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Twitch API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getTopGames(limit: number = 100): Promise<TwitchGame[]> {
  const data = await twitchApiRequest(`/games/top?first=${limit}`);
  return data.data.map((game: any) => ({
    ...game,
    box_art_url: game.box_art_url.replace('{width}', '285').replace('{height}', '380'),
  }));
}

let cachedTopGames: TwitchGame[] | null = null;

// Extended game database for better search coverage
const popularGames = [
  { id: '1', name: 'Fortnite', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/33214-{width}x{height}.jpg' },
  { id: '2', name: 'Minecraft', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/27471_IGDB-{width}x{height}.jpg' },
  { id: '3', name: 'Grand Theft Auto V', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/32982_IGDB-{width}x{height}.jpg' },
  { id: '4', name: 'Call of Duty: Modern Warfare', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/512710-{width}x{height}.jpg' },
  { id: '5', name: 'League of Legends', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/21779-{width}x{height}.jpg' },
  { id: '6', name: 'Valorant', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/516575-{width}x{height}.jpg' },
  { id: '7', name: 'Apex Legends', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/511224-{width}x{height}.jpg' },
  { id: '8', name: 'Counter-Strike 2', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/32399_IGDB-{width}x{height}.jpg' },
  { id: '9', name: 'World of Warcraft', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/18122-{width}x{height}.jpg' },
  { id: '10', name: 'Overwatch 2', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/515025-{width}x{height}.jpg' },
  { id: '11', name: 'Rocket League', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/30921-{width}x{height}.jpg' },
  { id: '12', name: 'FIFA 24', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/1869092879-{width}x{height}.jpg' },
  { id: '13', name: 'Cyberpunk 2077', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/65876_IGDB-{width}x{height}.jpg' },
  { id: '14', name: 'The Witcher 3', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/115977_IGDB-{width}x{height}.jpg' },
  { id: '15', name: 'Red Dead Redemption 2', box_art_url: 'https://static-cdn.jtvnw.net/ttv-boxart/493959-{width}x{height}.jpg' }
];

export async function searchGames(query: string): Promise<TwitchGame[]> {
  try {
    // Try RAWG API for comprehensive game search
    const response = await fetch(`https://api.rawg.io/api/games?key=a3abcc7420fd4c08be50dd90a8365cb8&search=${encodeURIComponent(query)}&page_size=10`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.results) {
        return data.results.map((game: any) => ({
          id: `rawg_${game.id}`,
          name: game.name,
          box_art_url: game.background_image || 'https://via.placeholder.com/285x380?text=' + encodeURIComponent(game.name),
          isRawgGame: true,
          rawgId: game.id
        }));
      }
    }
  } catch (error) {
    console.log('RAWG API failed, using fallback');
  }
  
  // Fallback to static + Twitch API
  const lowerQuery = query.toLowerCase();
  
  // Search in static popular games
  const staticResults = popularGames
    .filter(game => game.name.toLowerCase().includes(lowerQuery))
    .map(game => ({
      ...game,
      box_art_url: game.box_art_url.replace('{width}', '285').replace('{height}', '380')
    }));
  
  // Search in Twitch API
  if (!cachedTopGames) {
    try {
      cachedTopGames = await getTopGames(100);
    } catch {
      cachedTopGames = [];
    }
  }
  
  const apiResults = cachedTopGames.filter(game => 
    game.name.toLowerCase().includes(lowerQuery)
  );
  
  // Combine and deduplicate results
  const allResults = [...staticResults, ...apiResults];
  const uniqueResults = allResults.filter((game, index, self) => 
    index === self.findIndex(g => g.name.toLowerCase() === game.name.toLowerCase())
  );
  
  return uniqueResults.slice(0, 8);
}

export async function getGameById(gameId: string): Promise<TwitchGame | null> {
  if (gameId.startsWith('rawg_')) {
    const rawgId = gameId.replace('rawg_', '');
    try {
      const response = await fetch(`https://api.rawg.io/api/games/${rawgId}?key=${RAWG_API_KEY}`);
      if (response.ok) {
        const game = await response.json();
        return {
          id: gameId,
          name: game.name,
          box_art_url: game.background_image || 'https://via.placeholder.com/285x380?text=' + encodeURIComponent(game.name),
          isRawgGame: true,
          rawgId: game.id
        };
      }
    } catch (error) {
      console.error('Error fetching RAWG game:', error);
    }
    return null;
  }
  
  const data = await twitchApiRequest(`/games?id=${gameId}`);
  return data.data.length > 0 ? {
    ...data.data[0],
    box_art_url: data.data[0].box_art_url.replace('{width}', '285').replace('{height}', '380'),
  } : null;
}

export async function getGameDetails(gameName: string): Promise<GameDetails | null> {
  try {
    // Try RAWG API
    const response = await fetch(`https://api.rawg.io/api/games?key=a3abcc7420fd4c08be50dd90a8365cb8&search=${encodeURIComponent(gameName)}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const game = data.results[0];
        return {
          id: game.id.toString(),
          name: game.name,
          summary: game.description_raw || game.description,
          genres: game.genres?.map((g: any) => g.name) || [],
          platforms: game.platforms?.map((p: any) => p.platform.name) || [],
          release_date: game.released ? new Date(game.released).getFullYear().toString() : undefined,
          rating: game.rating ? Math.round(game.rating) : undefined,
          box_art_url: game.background_image || ''
        };
      }
    }
  } catch (error) {
    console.log('Game API not available');
  }
  
  // Generate a basic description based on game name
  const gameDescriptions = {
    'Fortnite': 'A free-to-play battle royale game where 100 players fight to be the last one standing.',
    'Minecraft': 'A sandbox game where players can build, explore, and survive in procedurally generated worlds.',
    'Grand Theft Auto V': 'An open-world action-adventure game set in the fictional city of Los Santos.',
    'Call of Duty': 'A first-person shooter franchise known for its intense multiplayer combat.',
    'League of Legends': 'A multiplayer online battle arena game where teams compete to destroy the enemy base.',
    'Valorant': 'A tactical first-person shooter with unique agent abilities and strategic gameplay.',
    'Apex Legends': 'A free-to-play battle royale game featuring unique characters with special abilities.'
  };
  
  const description = gameDescriptions[gameName as keyof typeof gameDescriptions] || 
    `${gameName} is a popular game enjoyed by millions of players worldwide. Experience exciting gameplay and join the community.`;
  
  return {
    id: '0',
    name: gameName,
    summary: description,
    genres: ['Gaming'],
    platforms: ['PC', 'Console'],
    box_art_url: ''
  };
}

export async function getStreamsForGame(gameId: string, limit: number = 20): Promise<TwitchStream[]> {
  const data = await twitchApiRequest(`/streams?game_id=${gameId}&first=${limit}`);
  return data.data.map((stream: any) => ({
    ...stream,
    thumbnail_url: stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
  }));
}