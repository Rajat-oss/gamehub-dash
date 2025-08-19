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
    if (!loading && user && location.pathname === '/auth') {
      navigate('/dashboard');
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

  if (location.pathname === '/dashboard') {
    return user ? <GameDashboard /> : <AuthPage />;
  }

  return <AuthPage />;
};

export default Index;
