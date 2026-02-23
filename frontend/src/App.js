// import logo from './logo.svg';
// import './App.css';

import React, { useState } from 'react';
import LoginPage from './pages/Login/LoginPage';
import MainView from './pages/MainView/MainView';
import './App.css';

function App() {
  // false = muestra Login | true = muestra Dashboard
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="App">
      {isLoggedIn
        ? <MainView />
        : <LoginPage onLogin={() => setIsLoggedIn(true)} />
      }
    </div>
  );
}

export default App;
