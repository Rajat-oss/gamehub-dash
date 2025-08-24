/**
 * Navigation utility functions
 */

/**
 * Navigate to user profile by username
 * @param username - The username to navigate to
 */
export const navigateToUserProfile = (username: string) => {
  if (username && username !== 'ai-assistant') {
    // Remove @ symbol if present
    const cleanUsername = username.replace('@', '');
    window.location.href = `/user/${cleanUsername}`;
  }
};

/**
 * Handle avatar click to open user profile
 * @param username - The username to navigate to
 * @param event - Optional click event to prevent propagation
 */
export const handleAvatarClick = (username: string, event?: React.MouseEvent) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  navigateToUserProfile(username);
};