import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthPage } from '@/components/auth/AuthPage';
import { GameDashboard } from '@/components/dashboard/GameDashboard';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user) {
      if (location.pathname === '/auth' || location.pathname === '/') {
        navigate('/dashboard', { replace: true });
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

  // Show dashboard if user is authenticated and on dashboard route
  if (user && location.pathname === '/dashboard') {
    return <GameDashboard />;
  }

  // Show auth page if not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Show dashboard if authenticated
  return <GameDashboard />;
};

export default Index;
