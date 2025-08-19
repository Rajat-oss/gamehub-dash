import { TwitchGame } from '@/lib/twitch';
import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

// Initialize EmailJS
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

export interface GameRequestSubmission {
  game: TwitchGame;
  userEmail: string;
  userName: string;
  message?: string;
}

export const submitGameRequest = async (data: GameRequestSubmission): Promise<void> => {
  try {
    // Validate configuration
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      throw new Error('EmailJS configuration is missing. Please check your environment variables.');
    }

    console.log('Sending game request email via EmailJS...');

    // Prepare template parameters
    const templateParams = {
      from_name: data.userName,
      from_email: data.userEmail,
      game_name: data.game.name,
      game_cover: data.game.box_art_url,
      user_message: data.message || 'No additional message',
      request_date: new Date().toLocaleString(),
      subject: `Game Request: ${data.game.name}`
    };

    console.log('EmailJS template params:', templateParams);

    // Send email using EmailJS
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Game request email sent successfully!', result);
    
  } catch (error) {
    console.error('❌ Failed to send game request email:', error);
    throw error;
  }
};
