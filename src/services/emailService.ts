import { Game } from './igdbApi';
import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'pixelpilgrim-service';
const EMAILJS_TEMPLATE_ID = 'template_game_request';
const EMAILJS_PUBLIC_KEY = 'meXmdsep-Hf_vqEqa';
const ADMIN_EMAIL = 'vedantvyas79@gmail.com';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

interface GameRequestData {
  game: Game;
  userEmail: string;
  userName: string;
  message?: string;
}

export const sendGameRequest = async (data: GameRequestData): Promise<void> => {
  try {
    // Email content
    const emailContent = `
New Game Request from GameHub

User: ${data.userName}
Email: ${data.userEmail}

Game Details:
- Name: ${data.game.name}
- Genres: ${data.game.genres?.map(g => g.name).join(', ') || 'N/A'}
- Rating: ${data.game.rating || 'N/A'}
- Cover Image: ${data.game.cover?.url || 'No image available'}

User Message:
${data.message || 'No additional message'}

---
Sent from GameHub Platform
    `;

    const templateParams = {
      to_email: ADMIN_EMAIL,
      from_name: data.userName,
      from_email: data.userEmail,
      game_name: data.game.name,
      game_genres: data.game.genres?.map(g => g.name).join(', ') || 'N/A',
      game_rating: data.game.rating?.toString() || 'N/A',
      game_cover: data.game.cover?.url || 'No image available',
      user_message: data.message || 'No additional message',
      request_date: new Date().toLocaleString()
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};