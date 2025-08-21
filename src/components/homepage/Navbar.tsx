import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userService } from '@/services/userService';
import { UserProfile } from '@/types/user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FaSearch, FaUser, FaSignOutAlt, FaCog, FaHeart, FaGamepad, FaComments, FaBell } from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchGames, TwitchGame } from '@/lib/twitch';

import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useChatUnreadCount } from '@/hooks/useChatUnreadCount';

interface NavbarProps {
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<TwitchGame[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatUnreadCount = useChatUnreadCount();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Define pages where game search should be shown
  const showGameSearch = ['/homepage', '/'].includes(location.pathname);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    setShowSuggestions(false);
  };
  
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (query.length > 1) {
      const timeout = setTimeout(async () => {
        try {
          const results = await searchGames(query);
          setSuggestions(results.slice(0, 6));
          setShowSuggestions(true);
        } catch (error) {
          console.error('Search error:', error);
        }
      }, 300);
      setSearchTimeout(timeout);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (game: TwitchGame) => {
    setSearchQuery(game.name);
    onSearch(game.name);
    setShowSuggestions(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const profile = await userService.getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
    };

    loadUserProfile();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    
    // Set up real-time listener for unread notifications (excluding chat)
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Filter out chat notifications
      const nonChatNotifications = snapshot.docs.filter(doc => 
        doc.data().type !== 'chat_message'
      );
      setUnreadCount(nonChatNotifications.length);
    }, (error) => {
      console.error('Error listening to notification count:', error);
    });
    
    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-card/50 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="/logofinal.png" 
              alt="GameHub" 
              className="h-20 w-20 sm:h-28 sm:w-28 object-contain" 
            />
          </div>

          {/* Search - Only show on specific pages */}
          {showGameSearch && (
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg mx-2 sm:mx-8">
              <div className="relative" ref={searchRef}>
                <FaSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3 h-3 sm:w-4 sm:h-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-8 sm:pl-10 bg-secondary/50 border-border/50 focus:border-primary text-sm sm:text-base"
                />
                
                {/* Search Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg mt-1 shadow-xl z-50 max-h-72 overflow-y-auto">
                    {suggestions.map((game, index) => (
                      <div
                        key={game.id}
                        className="flex items-center gap-3 p-2.5 hover:bg-primary/10 cursor-pointer transition-colors duration-150 border-b border-border/20 last:border-b-0"
                        onClick={() => handleSuggestionClick(game)}
                      >
                        <div className="w-10 h-12 flex-shrink-0 bg-secondary/30 rounded overflow-hidden">
                          <img
                            src={game.box_art_url.replace('{width}', '40').replace('{height}', '48')}
                            alt={game.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{game.name}</div>
                          <div className="text-xs text-muted-foreground">Game</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>
          )}
          
          {/* Spacer when search is hidden */}
          {!showGameSearch && <div className="flex-1" />}

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 mr-2 sm:mr-4">
            <Button 
              variant={location.pathname === '/my-games' ? 'default' : 'ghost'}
              onClick={() => navigate('/my-games')}
              size="sm"
            >
              <FaGamepad className="w-4 h-4 sm:mr-2" />
              <span className="hidden lg:inline">My Games</span>
            </Button>
            
            <Button 
              variant={location.pathname === '/favorites' ? 'default' : 'ghost'}
              onClick={() => navigate('/favorites')}
              size="sm"
            >
              <FaHeart className="w-4 h-4 sm:mr-2" />
              <span className="hidden lg:inline">Favorites</span>
            </Button>
            
            <Button 
              variant={location.pathname === '/inbox' ? 'default' : 'ghost'}
              onClick={() => navigate('/inbox')}
              size="sm"
              className="relative"
            >
              <FaComments className="w-4 h-4 sm:mr-2" />
              <span className="hidden lg:inline">Chat</span>
              {chatUnreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-green-500 text-white">
                  {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Notifications */}
          <div className="mr-4">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => navigate('/notifications')}
            >
              <FaBell className="w-4 h-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userProfile?.photoURL || user?.photoURL || ''} alt={userProfile?.username || user?.displayName || ''} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userProfile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || <FaUser />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userProfile?.username || user?.displayName || 'Gamer'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <FaUser className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <FaCog className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <FaSignOutAlt className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};