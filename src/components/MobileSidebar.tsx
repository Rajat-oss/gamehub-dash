import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createPortal } from 'react-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FaHome, FaFileAlt, FaCog, FaUser, FaLightbulb, FaUsers, 
  FaUserCog, FaQuestionCircle, FaSun, FaSignOutAlt, FaGamepad, 
  FaHeart, FaComments, FaBell, FaPlus, FaEnvelope 
} from 'react-icons/fa';

interface MenuItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  route?: string;
  action?: () => void;
  isRed?: boolean;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
  unreadCount: number;
  chatUnreadCount: number;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ 
  isOpen, 
  onClose, 
  userProfile, 
  unreadCount, 
  chatUnreadCount 
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (route: string) => {
    navigate(route);
    onClose();
  };

  const menuItems: MenuItem[] = [
    { id: 'dashboard', icon: FaHome, label: 'Dashboard', route: '/homepage' },
    { id: 'social', icon: FaPlus, label: 'Social', route: '/posts' },
    { id: 'games', icon: FaGamepad, label: 'My Games', route: '/my-games' },
    { id: 'favorites', icon: FaHeart, label: 'Favorites', route: '/favorites' },
    { id: 'chat', icon: FaComments, label: 'Chat', route: '/inbox' },
    { id: 'notifications', icon: FaBell, label: 'Notifications', route: '/notifications' },
    { id: 'settings', icon: FaCog, label: 'Settings', route: '/settings' },
    { id: 'contact', icon: FaEnvelope, label: 'Contact', route: '/contact' },
    { id: 'signout', icon: FaSignOutAlt, label: 'Sign Out', action: handleLogout, isRed: true },
  ];

  const getActiveItem = () => {
    return menuItems.find(item => item.route === location.pathname)?.id || '';
  };

  const getBadgeCount = (itemId: string) => {
    if (itemId === 'chat') return chatUnreadCount;
    if (itemId === 'notifications') return unreadCount;
    return 0;
  };

  const sidebarContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[99999] lg:hidden"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            style={{ touchAction: 'none' }}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-80 bg-black border-l border-gray-800 z-[100000] shadow-2xl lg:hidden"
            style={{ height: '100vh' }}
          >
            <div className="flex flex-col min-h-screen h-full">
              {/* User Profile Section */}
              <div className="p-6 border-b border-gray-800 bg-black">
                <button 
                  onClick={() => handleNavigation('/profile')}
                  className="flex items-center space-x-4 w-full hover:bg-gray-900/50 rounded-lg p-2 -m-2 transition-colors"
                >
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={userProfile?.photoURL || user?.photoURL || ''} alt={userProfile?.username || user?.displayName || ''} />
                    <AvatarFallback className="bg-gray-800 text-white text-lg">
                      {userProfile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-white font-bold text-lg truncate">
                      {userProfile?.username || user?.displayName || 'Gamer'}
                    </p>
                    <p className="text-[#9A9A9A] text-sm truncate">
                      {user?.email}
                    </p>
                  </div>
                </button>
              </div>

              {/* Navigation Menu */}
              <div className="flex-1 min-h-0 overflow-y-auto py-4 bg-black">
                <nav className="space-y-1 px-3">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = getActiveItem() === item.id;
                    const badgeCount = getBadgeCount(item.id);
                    
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => {
                          if (item.action) {
                            item.action();
                          } else if (item.route) {
                            handleNavigation(item.route);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                          isActive 
                            ? 'bg-gray-800 text-white' 
                            : item.isRed
                            ? 'text-red-400 hover:bg-gray-900/20'
                            : 'text-[#9A9A9A] hover:bg-gray-900/50'
                        }`}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${
                            isActive 
                              ? 'text-white' 
                              : item.isRed 
                              ? 'text-red-400' 
                              : 'text-[#9A9A9A] group-hover:text-white'
                          }`} />
                          <span className={`font-medium ${
                            isActive 
                              ? 'text-white' 
                              : item.isRed 
                              ? 'text-red-400' 
                              : 'text-[#9A9A9A] group-hover:text-white'
                          }`}>
                            {item.label}
                          </span>
                        </div>
                        
                        {/* Badge */}
                        {badgeCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                            {badgeCount > 9 ? '9+' : badgeCount}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(sidebarContent, document.body);
};