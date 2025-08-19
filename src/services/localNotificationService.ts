// Local notification service as fallback when EmailJS fails
export interface GameRequestNotification {
  id: string;
  gameName: string;
  userName: string;
  userEmail: string;
  message?: string;
  timestamp: string;
}

// Store game requests locally
const STORAGE_KEY = 'gamehub_game_requests';

export const saveGameRequestLocally = async (gameData: {
  gameName: string;
  userName: string;
  userEmail: string;
  message?: string;
}): Promise<void> => {
  try {
    const notification: GameRequestNotification = {
      id: Date.now().toString(),
      gameName: gameData.gameName,
      userName: gameData.userName,
      userEmail: gameData.userEmail,
      message: gameData.message,
      timestamp: new Date().toISOString()
    };

    // Get existing requests
    const existingRequests = getStoredGameRequests();
    
    // Add new request
    existingRequests.push(notification);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingRequests));
    
    // Also log to console for immediate visibility
    console.log('🎮 GAME REQUEST SAVED LOCALLY:', {
      game: gameData.gameName,
      user: `${gameData.userName} (${gameData.userEmail})`,
      message: gameData.message || 'No additional message',
      time: new Date().toLocaleString()
    });
    
    // Create a visual notification in the console
    console.log(`
%c🎯 NEW GAME REQUEST LOGGED 🎯
%cGame: ${gameData.gameName}
%cUser: ${gameData.userName}
%cEmail: ${gameData.userEmail}
%cMessage: ${gameData.message || 'None'}
%cTime: ${new Date().toLocaleString()}
%c
📋 View all requests: console.log(getGameRequests())
🗑️  Clear all requests: clearGameRequests()
    `, 
    'color: #00ff00; font-weight: bold; font-size: 14px;',
    'color: #ffff00; font-weight: bold;',
    'color: #00ffff; font-weight: bold;',
    'color: #00ffff; font-weight: bold;',
    'color: #ffffff;',
    'color: #cccccc;',
    'color: #888888; font-style: italic;'
    );
    
  } catch (error) {
    console.error('Failed to save game request locally:', error);
    throw error;
  }
};

export const getStoredGameRequests = (): GameRequestNotification[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to retrieve stored game requests:', error);
    return [];
  }
};

export const clearStoredGameRequests = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('All game requests cleared from local storage');
};

// Add helper functions to window for easy access
if (typeof window !== 'undefined') {
  (window as any).getGameRequests = getStoredGameRequests;
  (window as any).clearGameRequests = clearStoredGameRequests;
  (window as any).viewGameRequests = () => {
    const requests = getStoredGameRequests();
    console.table(requests);
    return requests;
  };
}
