import React, { useState } from 'react';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import MainView from './pages/MainView/MainView';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import './App.css';

console.log({ LoginPage, RegisterPage, MainView, AdminDashboard });

function App() {
  const [page, setPage] = useState('login');

  if (page === 'register') return <RegisterPage onGoToLogin={() => setPage('login')} />;
  if (page === 'main') return <MainView />;
  if (page === 'admin') return <AdminDashboard />;

  return (
    <LoginPage
      onLogin={() => setPage('main')}
      onGoToRegister={() => setPage('register')}
    />
  );
}

export default App;
