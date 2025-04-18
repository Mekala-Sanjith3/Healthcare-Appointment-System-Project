/**
 * Initializes the app by checking for active user sessions
 * This was previously used for localStorage-based data, but now uses MySQL database
 */
const initializeApp = () => {
  console.log('Initializing app...');
  
  // Check for active user session
  const token = localStorage.getItem('token');
  const userDataStr = localStorage.getItem('userData');
  
  if (token && userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      console.log(`Active user session found for ${userData.role}`);
    } catch (error) {
      console.error('Error processing user session:', error);
      // Clear invalid session data
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
    }
  } else {
    console.log('No active user session');
  }
  
  console.log('App initialization complete!');
};

export default initializeApp; 