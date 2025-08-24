import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GENAI_API_KEY);

export interface AIMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const aiChatService = {
  async sendMessage(message: string, conversationHistory: AIMessage[] = []): Promise<string> {
    try {
      // Check if API key is available
      const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
      if (!apiKey || apiKey.includes('your_') || apiKey.length < 10) {
        return this.getFallbackResponse(message);
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Build context from conversation history
      const context = conversationHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => `${msg.isUser ? 'User' : 'AI'}: ${msg.content}`)
        .join('\n');
      
      const prompt = `You are a helpful gaming assistant for GameHub, a gaming community platform. You help users with game recommendations, gaming tips, and general gaming discussions. Keep responses concise and gaming-focused.

${context ? `Previous conversation:\n${context}\n\n` : ''}User: ${message}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling AI service:', error);
      return this.getFallbackResponse(message);
    }
  },

  getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Gaming-related responses
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion')) {
      return "I'd love to help with game recommendations! Some popular games right now include Cyberpunk 2077, Elden Ring, and The Witcher 3. What genre are you interested in?";
    }
    
    if (lowerMessage.includes('fps') || lowerMessage.includes('shooter')) {
      return "For FPS games, I recommend Counter-Strike 2, Valorant, or Call of Duty. Each offers different gameplay styles - tactical, hero-based, or arcade respectively.";
    }
    
    if (lowerMessage.includes('rpg') || lowerMessage.includes('role playing')) {
      return "Great RPG choices include The Witcher 3, Baldur's Gate 3, Elden Ring, and Cyberpunk 2077. Each offers deep storytelling and character progression.";
    }
    
    if (lowerMessage.includes('multiplayer') || lowerMessage.includes('online')) {
      return "Popular multiplayer games include Fortnite, Apex Legends, Rocket League, and Among Us. What type of multiplayer experience are you looking for?";
    }
    
    if (lowerMessage.includes('indie')) {
      return "Indie games have some gems! Try Hades, Celeste, Hollow Knight, or Stardew Valley. They offer unique experiences you won't find in AAA titles.";
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm your gaming assistant. I can help you discover new games, get gaming tips, or just chat about your favorite titles. What would you like to know?";
    }
    
    // Default response
    return "I'm here to help with all things gaming! Ask me about game recommendations, tips, or anything gaming-related. Note: I'm currently running in offline mode, so responses may be limited.";
  }
};