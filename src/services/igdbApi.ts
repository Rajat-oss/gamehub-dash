import axios from 'axios';

const RAPIDAPI_BASE_URL = 'https://gamedatabasestefan-skliarovv1.p.rapidapi.com';

export const gameApi = axios.create({
  baseURL: RAPIDAPI_BASE_URL,
  headers: {
    'x-rapidapi-host': import.meta.env.VITE_RAPIDAPI_HOST,
    'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

export interface Game {
  id: number;
  name: string;
  summary?: string;
  cover?: {
    url: string;
    image_id: string;
  };
  rating?: number;
  platforms?: Array<{
    id: number;
    name: string;
  }>;
  release_dates?: Array<{
    date: number;
    platform: number;
  }>;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  first_release_date?: number;
}

// Mock data for demo - replace with real API calls
export const getMockGames = (): Game[] => [
  {
    id: 1,
    name: "The Witcher 3: Wild Hunt",
    summary: "As war rages on throughout the Northern Realms, you take on the greatest contract of your life — tracking down the Child of Prophecy, a living weapon that can alter the shape of the world.",
    cover: {
      url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.webp",
      image_id: "co1wyy"
    },
    rating: 93,
    genres: [{ id: 1, name: "RPG" }, { id: 2, name: "Adventure" }]
  },
  {
    id: 2,
    name: "Cyberpunk 2077",
    summary: "Cyberpunk 2077 is an open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.",
    cover: {
      url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.webp",
      image_id: "co2lbd"
    },
    rating: 86,
    genres: [{ id: 3, name: "Action" }, { id: 4, name: "RPG" }]
  },
  {
    id: 3,
    name: "Red Dead Redemption 2",
    summary: "America, 1899. The end of the wild west era has begun as lawmen hunt down the last remaining outlaw gangs.",
    cover: {
      url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1q1f.webp",
      image_id: "co1q1f"
    },
    rating: 97,
    genres: [{ id: 5, name: "Action" }, { id: 6, name: "Adventure" }]
  }
];

export const fetchPopularGames = async (): Promise<Game[]> => {
  try {
    if (!import.meta.env.VITE_RAPIDAPI_KEY || !import.meta.env.VITE_RAPIDAPI_HOST) {
      console.warn('RapidAPI credentials not found, using mock data');
      return getMockGames();
    }

    // Try different possible endpoints
    const endpoints = ['/getPages', '/games', '/popular'];
    let response;
    
    for (const endpoint of endpoints) {
      try {
        response = await gameApi.post(endpoint, 'page=1');
        break;
      } catch (err) {
        console.log(`Endpoint ${endpoint} failed, trying next...`);
      }
    }
    
    if (!response) {
      throw new Error('All API endpoints failed');
    }
    
    // Transform the data to match our Game interface
    const games = Array.isArray(response.data) ? response.data : response.data.games || [];
    
    return games.slice(0, 50).map((game: any, index: number) => ({
      id: game.id || index + 1,
      name: game.title || game.name || `Game ${index + 1}`,
      summary: game.description || game.summary || 'No description available.',
      cover: {
        url: game.image || game.cover || 'https://via.placeholder.com/300x400?text=No+Image',
        image_id: `game_${index + 1}`
      },
      rating: game.rating || Math.floor(Math.random() * 30) + 70,
      genres: game.genres ? game.genres.map((g: string, i: number) => ({ id: i + 1, name: g })) : [{ id: 1, name: 'Action' }]
    }));
  } catch (error) {
    console.error('Error fetching games:', error);
    return getMockGames();
  }
};

export const searchGames = async (query: string): Promise<Game[]> => {
  try {
    if (!import.meta.env.VITE_IGDB_CLIENT_ID || !import.meta.env.VITE_IGDB_ACCESS_TOKEN) {
      const allGames = getMockGames();
      return allGames.filter(game => 
        game.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    const response = await igdbApi.post('/games', `
      search "${query}";
      fields name,summary,cover.url,rating,platforms.name,genres.name;
      where cover != null;
      limit 20;
    `);
    
    return response.data.map((game: any) => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: game.cover.url.replace('t_thumb', 't_cover_big')
      } : null
    }));
  } catch (error) {
    console.error('Error searching games:', error);
    const allGames = getMockGames();
    return allGames.filter(game => 
      game.name.toLowerCase().includes(query.toLowerCase())
    );
  }
};

export const fetchTopRatedGames = async (): Promise<Game[]> => {
  try {
    if (!import.meta.env.VITE_IGDB_CLIENT_ID || !import.meta.env.VITE_IGDB_ACCESS_TOKEN) {
      return getMockGames().sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    const response = await igdbApi.post('/games', `
      fields name,summary,cover.url,rating,platforms.name,genres.name;
      where rating > 85 & cover != null & rating_count > 100;
      sort rating desc;
      limit 50;
    `);
    
    return response.data.map((game: any) => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: game.cover.url.replace('t_thumb', 't_cover_big')
      } : null
    }));
  } catch (error) {
    console.error('Error fetching top rated games:', error);
    return getMockGames().sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
};

export const fetchNewReleases = async (): Promise<Game[]> => {
  try {
    if (!import.meta.env.VITE_IGDB_CLIENT_ID || !import.meta.env.VITE_IGDB_ACCESS_TOKEN) {
      return getMockGames();
    }

    const currentDate = Math.floor(Date.now() / 1000);
    const sixMonthsAgo = currentDate - (6 * 30 * 24 * 60 * 60);

    const response = await igdbApi.post('/games', `
      fields name,summary,cover.url,rating,platforms.name,genres.name,first_release_date;
      where first_release_date > ${sixMonthsAgo} & cover != null;
      sort first_release_date desc;
      limit 50;
    `);
    
    return response.data.map((game: any) => ({
      ...game,
      cover: game.cover ? {
        ...game.cover,
        url: game.cover.url.replace('t_thumb', 't_cover_big')
      } : null
    }));
  } catch (error) {
    console.error('Error fetching new releases:', error);
    return getMockGames();
  }
};