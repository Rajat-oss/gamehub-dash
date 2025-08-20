import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthPage } from '@/components/auth/AuthPage';
import { GameDashboard } from '@/components/homepage/GameDashboard';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user) {
      if (location.pathname === '/auth' || location.pathname === '/') {
        navigate('/homepage', { replace: true });
      }
    }
  }, [user, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading GameHub...</p>
        </div>
      </div>
    );
  }

  // Show homepage if user is authenticated and on homepage route
  if (user && location.pathname === '/homepage') {
    return <GameDashboard />;
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Show homepage if authenticated
  return <GameDashboard />;
};

export default Index;
