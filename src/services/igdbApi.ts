import axios from 'axios';

const IGDB_API_URL = 'https://api.igdb.com/v4';

// Note: In a real app, you'd need to proxy this through your backend
// or use a CORS proxy due to IGDB API CORS restrictions
export const igdbApi = axios.create({
  baseURL: IGDB_API_URL,
  headers: {
    'Client-ID': 'your-client-id',
    'Authorization': 'Bearer your-access-token',
    'Accept': 'application/json',
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
    // For demo purposes, return mock data
    // In production, uncomment below and remove mock data
    /*
    const response = await igdbApi.post('/games', `
      fields name,summary,cover.url,rating,platforms.name,genres.name;
      where rating > 80;
      sort rating desc;
      limit 20;
    `);
    return response.data;
    */
    
    return getMockGames();
  } catch (error) {
    console.error('Error fetching games:', error);
    return getMockGames(); // Fallback to mock data
  }
};

export const searchGames = async (query: string): Promise<Game[]> => {
  try {
    // Mock search functionality
    const allGames = getMockGames();
    return allGames.filter(game => 
      game.name.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching games:', error);
    return [];
  }
};