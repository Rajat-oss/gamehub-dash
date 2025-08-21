import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ThemeToggle } from '@/components/ui/theme-toggle';

import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }
  }, [searchParams]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
  };

  const showForgotPasswordForm = () => setShowForgotPassword(true);
  const backToLogin = () => setShowForgotPassword(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="/logofinal.png" 
              alt="GameHub" 
              className="h-32 w-32 object-contain" 
            />
          </div>
          <div className="flex flex-1 items-center justify-end">
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      {/* Auth Content */}
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          {showForgotPassword ? (
            <ForgotPasswordForm onBack={backToLogin} />
          ) : isLogin ? (
            <LoginForm onToggleMode={toggleMode} onForgotPassword={showForgotPasswordForm} />
          ) : (
            <RegisterForm onToggleMode={toggleMode} />
          )}
        </div>
      </div>
    </div>
  );
};