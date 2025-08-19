import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, Chrome, User, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { profileService } from '@/services/profileService';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const { register, loginWithGoogle } = useAuth();

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (username.length < 3) {
        setUsernameStatus(null);
        return;
      }
      
      setUsernameStatus('checking');
      try {
        const isAvailable = await profileService.isUsernameAvailable(username);
        setUsernameStatus(isAvailable ? 'available' : 'taken');
      } catch (error) {
        setUsernameStatus(null);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await register(email, password, username);
      
      toast({
        title: "Account created!",
        description: "Welcome to GameHub! You've successfully registered.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: "Welcome to GameHub!",
        description: "You've successfully registered with Google.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/logofinal.png" 
            alt="GameHub" 
            className="h-36 w-36 object-contain" 
          />
        </div>
        <CardDescription>
          Create your gaming account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={`pl-10 pr-10 ${
                  usernameStatus === 'taken' ? 'border-red-500' : 
                  usernameStatus === 'available' ? 'border-green-500' : ''
                }`}
              />
              {usernameStatus === 'checking' && (
                <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              )}
              {usernameStatus === 'available' && (
                <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
              )}
              {usernameStatus === 'taken' && (
                <X className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
              )}
            </div>
            {usernameStatus === 'taken' && (
              <p className="text-sm text-red-500">Username is already taken</p>
            )}
            {usernameStatus === 'available' && (
              <p className="text-sm text-green-500">Username is available</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="gamer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || usernameStatus === 'taken' || usernameStatus === 'checking'}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <button
            type="button"
            onClick={onToggleMode}
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Sign in
          </button>
        </div>
      </CardContent>
    </Card>
  );
};