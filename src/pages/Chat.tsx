import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/homepage/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { subscribeToMessages, sendMessage, Message } from '@/lib/chat';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FaUser, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Chat = () => {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [receiverName, setReceiverName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user && userId) {
        setReceiverName('User');
        
        const unsubscribe = subscribeToMessages(user.uid, userId, (newMessages) => {
          setMessages(newMessages);
          if (newMessages.length > 0) {
            const otherUser = newMessages.find(m => 
              (m.senderId === userId && m.receiverId === user.uid) ||
              (m.senderId === user.uid && m.receiverId === userId)
            );
            if (otherUser) {
              setReceiverName(otherUser.senderId === user.uid ? otherUser.receiverName : otherUser.senderName);
            }
          }
          setLoading(false);
        });
        
        return unsubscribe;
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !userId || !newMessage.trim()) return;

    try {
      await sendMessage(
        userId,
        receiverName || 'User',
        currentUser.uid,
        currentUser.displayName || 'You',
        newMessage
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar onSearch={() => {}} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar onSearch={() => {}} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/community">
            <Button variant="ghost">
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <FaUser className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <h1 className="text-xl font-semibold">{receiverName || 'Chat'}</h1>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="bg-gradient-card border-border/50 h-[600px] flex flex-col">
          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <FaUser className="text-6xl text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.senderId === auth.currentUser?.uid;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Message Input */}
          <div className="border-t border-border/50 p-4">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <FaPaperPlane className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Chat;