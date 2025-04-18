import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import './styles/global.css';
import { initializeApp } from './utils/initApp';

const App = () => {
  // Initialize app data when the application starts
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <div className="app">
      <Router>
        <AppRoutes />
      </Router>
    </div>
  );
};

export default App;