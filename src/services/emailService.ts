import { Game } from './igdbApi';
import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_zdf9xta';
const EMAILJS_TEMPLATE_ID = 'template_apnp45o';
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
    console.log('Starting email send process...');
    console.log('EmailJS Config:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      publicKey: EMAILJS_PUBLIC_KEY ? '***SET***' : 'NOT SET',
      adminEmail: ADMIN_EMAIL
    });
    console.log('Game request data:', data);

    // Check if EmailJS is properly initialized
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      throw new Error('EmailJS configuration is incomplete. Check environment variables.');
    }

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

    console.log('Template params:', templateParams);

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    
    console.log('Email sent successfully:', result);
    
  } catch (error) {
    console.error('Email sending failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};
