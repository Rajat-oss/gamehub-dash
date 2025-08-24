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
      
      const prompt = `You are an expert gaming assistant for GameHub. You help with game recommendations, walkthroughs, cheats, tips, and strategies. Keep responses concise and helpful. Only provide detailed lists or guides when specifically asked for "detailed", "list", "guide", or "walkthrough".

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
    
    // Gaming-specific responses
    if (lowerMessage.includes('cheat') || lowerMessage.includes('code')) {
      return "I can help with cheat codes! For example:\n\n**GTA V:**\n• Invincibility: PAINKILLER\n• Weapons: TOOLUP\n• Fast Run: CATCHME\n\n**Skyrim:**\n• God Mode: tgm\n• Add Gold: player.additem 0000000f 1000\n\nWhat game are you looking for cheats for?";
    }
    
    if (lowerMessage.includes('mission') || lowerMessage.includes('walkthrough') || lowerMessage.includes('guide')) {
      return "I can provide mission guides and walkthroughs! Here are some popular ones:\n\n**The Witcher 3:**\n• Main Quest: Find Ciri\n• Side Quest: Bloody Baron\n\n**Elden Ring:**\n• Boss Guide: Margit Strategy\n• Area Guide: Limgrave Secrets\n\nWhich game mission do you need help with?";
    }
    
    if (lowerMessage.includes('secret') || lowerMessage.includes('hidden') || lowerMessage.includes('easter egg')) {
      return "I love sharing secrets and easter eggs! Here are some classics:\n\n**Minecraft:**\n• Herobrine references\n• End Poem secrets\n\n**GTA Series:**\n• Bigfoot sightings\n• UFO locations\n\n**Portal:**\n• Cake references\n• Hidden rooms\n\nWhat game secrets are you curious about?";
    }
    
    if (lowerMessage.includes('tip') || lowerMessage.includes('strategy') || lowerMessage.includes('build')) {
      return "Here are some universal gaming tips:\n\n**RPG Builds:**\n• Balanced: STR/DEX hybrid\n• Magic: INT/FAITH focus\n• Tank: VIT/END priority\n\n**FPS Tips:**\n• Crosshair placement\n• Sound awareness\n• Map control\n\nWhat specific tips do you need?";
    }
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion')) {
      return "I'd love to help with game recommendations! Some popular games right now include Cyberpunk 2077, Elden Ring, and The Witcher 3. What genre are you interested in?";
    }
    
    if (lowerMessage.includes('fps') || lowerMessage.includes('shooter')) {
      return "For FPS games, I recommend Counter-Strike 2, Valorant, or Call of Duty. Each offers different gameplay styles - tactical, hero-based, or arcade respectively.";
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm your expert gaming assistant. I can help with:\n\n• Game recommendations\n• Mission walkthroughs\n• Cheat codes & secrets\n• Gaming tips & strategies\n• Achievement guides\n\nWhat gaming help do you need today?";
    }
    
    // Default response
    return "I'm your gaming expert! I can help with game missions, secret locations, cheat codes, tips, strategies, and more. Ask me about any game and I'll provide detailed guides and information!";
  }
};