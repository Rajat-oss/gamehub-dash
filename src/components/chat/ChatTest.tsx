import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aiChatService } from '@/services/aiChatService';
import { toast } from 'sonner';

export const ChatTest: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testAIChat = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      const aiResponse = await aiChatService.sendMessage(message, []);
      setResponse(aiResponse);
      toast.success('AI chat is working!');
    } catch (error) {
      console.error('AI chat test failed:', error);
      toast.error('AI chat test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Chat Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Test message..."
            onKeyPress={(e) => e.key === 'Enter' && testAIChat()}
          />
        </div>
        <Button 
          onClick={testAIChat} 
          disabled={loading || !message.trim()}
          className="w-full"
        >
          {loading ? 'Testing...' : 'Test AI Chat'}
        </Button>
        {response && (
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-sm">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};