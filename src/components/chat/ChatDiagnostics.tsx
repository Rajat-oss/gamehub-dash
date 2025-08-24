import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

export const ChatDiagnostics: React.FC = () => {
  const { user } = useAuth();
  const [diagnostics, setDiagnostics] = useState({
    firebaseConnection: 'checking',
    aiApiKey: 'checking',
    userAuth: 'checking',
    localStorage: 'checking'
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      // Check Firebase connection
      try {
        await db._delegate._databaseId;
        setDiagnostics(prev => ({ ...prev, firebaseConnection: 'success' }));
      } catch (error) {
        setDiagnostics(prev => ({ ...prev, firebaseConnection: 'error' }));
      }

      // Check AI API key
      const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY;
      if (apiKey && apiKey !== 'your_api_key_here') {
        setDiagnostics(prev => ({ ...prev, aiApiKey: 'success' }));
      } else {
        setDiagnostics(prev => ({ ...prev, aiApiKey: 'warning' }));
      }

      // Check user authentication
      if (user) {
        setDiagnostics(prev => ({ ...prev, userAuth: 'success' }));
      } else {
        setDiagnostics(prev => ({ ...prev, userAuth: 'error' }));
      }

      // Check localStorage
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        setDiagnostics(prev => ({ ...prev, localStorage: 'success' }));
      } catch (error) {
        setDiagnostics(prev => ({ ...prev, localStorage: 'error' }));
      }
    };

    runDiagnostics();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaTimesCircle className="text-red-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      default:
        return <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Working';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Limited';
      default:
        return 'Checking...';
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Chat System Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span>Firebase Connection</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(diagnostics.firebaseConnection)}
            <Badge variant={diagnostics.firebaseConnection === 'success' ? 'default' : 'destructive'}>
              {getStatusText(diagnostics.firebaseConnection)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span>AI Chat API</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(diagnostics.aiApiKey)}
            <Badge variant={
              diagnostics.aiApiKey === 'success' ? 'default' : 
              diagnostics.aiApiKey === 'warning' ? 'secondary' : 'destructive'
            }>
              {getStatusText(diagnostics.aiApiKey)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span>User Authentication</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(diagnostics.userAuth)}
            <Badge variant={diagnostics.userAuth === 'success' ? 'default' : 'destructive'}>
              {getStatusText(diagnostics.userAuth)}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Local Storage</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(diagnostics.localStorage)}
            <Badge variant={diagnostics.localStorage === 'success' ? 'default' : 'destructive'}>
              {getStatusText(diagnostics.localStorage)}
            </Badge>
          </div>
        </div>

        <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {diagnostics.firebaseConnection === 'error' && diagnostics.localStorage === 'success' 
              ? "Chat will work in offline mode using local storage."
              : diagnostics.aiApiKey === 'warning'
              ? "AI chat will use fallback responses."
              : "All systems operational."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};