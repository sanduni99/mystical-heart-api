import React, { useState, useEffect } from 'react';
import LandingScreen from './components/LandingScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import ProfileScreen from './components/ProfileScreen';
import SettingsScreen from './components/SettingsScreen';
import MemoryGameTutorial from './components/MemoryGameTutorial';
import { authAPI, sessionAPI } from './api';

export default function MysticalAlchemistApp() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        if (parsedUser.tutorialCompleted) {
          setCurrentScreen('lobby');
        } else {
          setCurrentScreen('tutorial');
        }
      }
    } catch (error) {
      console.error('Error loading saved user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentScreen('lobby');
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleRegister = async (userData) => {
    const result = await authAPI.register(userData);
    if (result.success) {
      setUser(result.data.user);
      setIsAuthenticated(true);
      setCurrentScreen('tutorial');
    } else {
      alert('Registration failed: ' + result.error);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentScreen('landing');
  };

  const handleGameEnd = async (gameData) => {
    try {
      await sessionAPI.saveSession(gameData);
      
      const updatedUser = {
        ...user,
        stats: {
          ...user.stats,
          bestScore: Math.max(user.stats.bestScore || 0, gameData.score)
        }
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setCurrentScreen('lobby');
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  // Screen routing
  if (!isAuthenticated && currentScreen === 'landing') {
    return <LandingScreen onLogin={() => setCurrentScreen('login')} onRegister={() => setCurrentScreen('register')} />;
  }

  if (!isAuthenticated && currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} onBack={() => setCurrentScreen('landing')} onRegister={() => setCurrentScreen('register')} />;
  }

  if (!isAuthenticated && currentScreen === 'register') {
    return <RegisterScreen onRegister={handleRegister} onBack={() => setCurrentScreen('landing')} onLogin={() => setCurrentScreen('login')} />;
  }

  if (isAuthenticated && currentScreen === 'tutorial') {
    return (
      <MemoryGameTutorial
        user={user}
        onComplete={(rewards) => {
          const updatedUser = {
            ...user,
            tutorialCompleted: true,
            stats: {
              ...user.stats,
              totalScore: (user.stats?.totalScore || 0) + rewards.score,
              totalGold: (user.stats?.totalGold || 0) + rewards.goldEarned
            }
          };
          
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setCurrentScreen('lobby');
        }}
        onSkip={() => setCurrentScreen('lobby')}
      />
    );
  }

  if (isAuthenticated && currentScreen === 'lobby') {
    if (!user) return <div>Loading user data...</div>;
    return (
      <LobbyScreen 
        user={user} 
        onStartGame={() => setCurrentScreen('game')} 
        onViewLeaderboard={() => setCurrentScreen('leaderboard')}
        onLogout={handleLogout}
        setCurrentScreen={setCurrentScreen}
      />
    );
  }

  if (isAuthenticated && currentScreen === 'game') {
    return <GameScreen user={user} onGameEnd={handleGameEnd} onBack={() => setCurrentScreen('lobby')} />;
  }

  if (isAuthenticated && currentScreen === 'leaderboard') {
    return <LeaderboardScreen user={user} onBack={() => setCurrentScreen('lobby')} />;
  }

  if (isAuthenticated && currentScreen === 'profile') {
    return (
      <ProfileScreen 
        user={user} 
        setUser={setUser} 
        onBack={() => setCurrentScreen('lobby')} 
        onLogout={handleLogout}
        setCurrentScreen={setCurrentScreen}
      />
    );
  }

  if (isAuthenticated && currentScreen === 'settings') {
    return (
      <SettingsScreen 
        user={user} 
        onBack={() => setCurrentScreen('profile')} 
        onLogout={handleLogout}
        setCurrentScreen={setCurrentScreen}
      />
    );
  }

  return null;
}