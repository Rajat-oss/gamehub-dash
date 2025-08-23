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
      throw new Error('Failed to get AI response');
    }
  }
};