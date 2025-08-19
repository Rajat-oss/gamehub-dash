const TWITCH_CLIENT_ID = 'picryc9twxcf895poytzpq0kpil4sc';
const TWITCH_CLIENT_SECRET = 'tjt9b91l94rk07av1nzppbc9zsfvgc';
const TWITCH_API_BASE = 'https://api.twitch.tv/helix';
const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token';

let accessToken: string | null = null;

export interface TwitchGame {
  id: string;
  name: string;
  box_art_url: string;
  igdb_id?: string;
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

export async function searchGames(query: string): Promise<TwitchGame[]> {
  const data = await twitchApiRequest(`/games?name=${encodeURIComponent(query)}`);
  return data.data.map((game: any) => ({
    ...game,
    box_art_url: game.box_art_url.replace('{width}', '285').replace('{height}', '380'),
  }));
}

export async function getGameById(gameId: string): Promise<TwitchGame | null> {
  const data = await twitchApiRequest(`/games?id=${gameId}`);
  return data.data.length > 0 ? {
    ...data.data[0],
    box_art_url: data.data[0].box_art_url.replace('{width}', '285').replace('{height}', '380'),
  } : null;
}

export async function getStreamsForGame(gameId: string, limit: number = 20): Promise<TwitchStream[]> {
  const data = await twitchApiRequest(`/streams?game_id=${gameId}&first=${limit}`);
  return data.data.map((stream: any) => ({
    ...stream,
    thumbnail_url: stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180'),
  }));
}