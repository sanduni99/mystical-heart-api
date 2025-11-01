
import React, { useState, useEffect } from 'react';
import { User, Trophy, LogOut, Crown, TrendingUp } from 'lucide-react';
import bgImage from './assets/images/bg_3.png';
import bgImagetwo from './assets/images/bg_2.png';
import { Key } from "lucide-react";
import MemoryGameTutorial from './components/MemoryGameTutorial';



// FOR NOW: Mock API (replace with real API imports when backend is ready)
const authAPI = {
  login: async (creds) => {
    // This will call your real backend
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
    return response.json();
  },
register: async (data) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    // Try reading as text first to see what came back
    const text = await response.text();

    if (!response.ok) {
      return { success: false, error: text };
    }

    const result = JSON.parse(text); 

    // Save token and user
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));

    return { success: true, data: result };

  } catch (err) {
    return { success: false, error: err.message };
  }
},
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

const leaderboardAPI = {
  getTopPlayers: async () => {
    const response = await fetch('http://localhost:5000/api/leaderboard');
    return response.json();
  }
};

const sessionAPI = {
  saveSession: async (data) => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/sessions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

// Main App Component
export default function MysticalAlchemistApp() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

 useEffect(() => {
  try {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      
      // ✅ ADD THIS: Check if tutorial completed
      if (parsedUser.tutorialCompleted) {
        setCurrentScreen('lobby');
      } else {
        setCurrentScreen('tutorial'); 
      }
    }
  } catch (error) {
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
    // ✅ CHANGE THIS: Go to tutorial instead of lobby
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
    }
  };

  if (!isAuthenticated && currentScreen === 'landing') {
    return <LandingScreen onLogin={() => setCurrentScreen('login')} onRegister={() => setCurrentScreen('register')} />;
  }

  if (!isAuthenticated && currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} onBack={() => setCurrentScreen('landing')} onRegister={() => setCurrentScreen('register')} />;
  }

  if (!isAuthenticated && currentScreen === 'register') {
    return <RegisterScreen onRegister={handleRegister} onBack={() => setCurrentScreen('landing')} onLogin={() => setCurrentScreen('login')} />;
  }
  // Add this AFTER login/register screens, BEFORE lobby
if (isAuthenticated && currentScreen === 'tutorial') {
  return (
    <MemoryGameTutorial
      user={user}
      onComplete={(rewards) => {
        // Update user with tutorial completion + rewards
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
        
        // Save to backend
        fetch(`http://localhost:5000/api/users/${user.id}/stats`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...updatedUser.stats,
            tutorialCompleted: true
          })
        });
        
        // Go to lobby
        setCurrentScreen('lobby');
      }}
      onSkip={() => {
        // Allow skipping tutorial
        setCurrentScreen('lobby');
      }}
    />
  );
}

  if (isAuthenticated && currentScreen === 'lobby') {
  if (!user) return <div>Loading user data...</div>; // temporary fallback
  return (
    <LobbyScreen 
      user={user} 
      onStartGame={() => setCurrentScreen('game')} 
      onViewLeaderboard={() => setCurrentScreen('leaderboard')}
      onLogout={handleLogout}
    />
  );
}


  if (isAuthenticated && currentScreen === 'game') {
    return <GameScreen user={user} onGameEnd={handleGameEnd} onBack={() => setCurrentScreen('lobby')} />;
  }

  if (isAuthenticated && currentScreen === 'leaderboard') {
    return <LeaderboardScreen user={user} onBack={() => setCurrentScreen('lobby')} />;
  }

  return null;
}

// ========================================
// SCREEN COMPONENTS
// ========================================

function LandingScreen({ onLogin, onRegister }) {
  return (
    <div
  className="flex items-center justify-center min-h-screen"
  style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
      <div className="w-full max-w-2xl p-12 text-center bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl">
        <div className="mb-6 text-8xl animate-bounce">🧪</div>
        <h1 className="mb-4 text-6xl font-bold text-white">
          Mystical Alchemist's World
        </h1>
        <p className="mb-8 text-xl text-gray-300">
          Master the art of alchemy, discover recipes, and climb the global leaderboard!
        </p>
        <div className="space-y-4">
          <button
            onClick={onLogin}
            className="w-full px-8 py-4 text-xl font-bold text-white transition-all transform bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl hover:from-blue-600 hover:to-cyan-700 hover:scale-105"
          >
            🔑 Login
          </button>
          <button
            onClick={onRegister}
            className="w-full px-8 py-4 text-xl font-bold text-white transition-all transform bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl hover:from-purple-600 hover:to-pink-700 hover:scale-105"
          >
            ✨ Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, onBack, onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (username && password) {
      onLogin({ username, password });
    }
  };

  return (
    <div
  className="flex items-center justify-center min-h-screen"
  style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
      <div className="w-full max-w-md p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl">
        <button onClick={onBack} className="mb-6 text-white hover:text-gray-300">← Back</button>
        
        <div className="mb-8 text-center">
          <div className="mb-4 text-6xl">🔐</div>
          <h2 className="text-3xl font-bold text-white">Welcome Back!</h2>
          <p className="mt-2 text-gray-300">Login to continue your adventure</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold text-white">Email</label>
            <input
              type="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your username"
              className="w-full px-4 py-3 text-white placeholder-gray-400 bg-white border-2 border-transparent outline-none rounded-xl bg-opacity-20 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-white">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-white placeholder-gray-400 bg-white border-2 border-transparent outline-none rounded-xl bg-opacity-20 focus:border-blue-400"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-4 font-bold text-white transition-all transform bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl hover:from-blue-600 hover:to-cyan-700 hover:scale-105"
          >
            Login
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Don't have an account?{' '}
            <button onClick={onRegister} className="font-bold text-cyan-400 hover:text-cyan-300">
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function RegisterScreen({ onRegister, onBack, onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    avatar: '🧙‍♀️',
    specialty: 'Potion Master'
  });

  const avatars = ['🧙‍♀️', '🧙‍♂️', '🧑‍🔬', '👨‍🔬', '👩‍🔬', '🧝‍♀️', '🧝‍♂️', '👨‍🔬'];
  const specialties = ['Potion Master', 'Spell Crafter', 'Crystal Alchemist', 'Herb Specialist'];

  const handleSubmit = () => {
    if (formData.username && formData.email && formData.password.length >= 6) {
      onRegister(formData);
    } else {
      alert('Please fill all fields. Password must be at least 6 characters.');
    }
  };

  return (
    <div
  className="flex items-center justify-center min-h-screen"
  style={{
    backgroundImage: `url(${bgImagetwo})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
      <div className="w-full max-w-md p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl">
        <button onClick={onBack} className="mb-6 text-white hover:text-gray-300">← Back</button>
        
        <div className="mb-8 text-center">
          <div className="mb-4 text-6xl">✨</div>
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-gray-300">Join the Alchemist's World</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-white">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="Choose username"
              className="w-full px-4 py-3 text-white placeholder-gray-400 bg-white border-2 border-transparent outline-none rounded-xl bg-opacity-20 focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-white">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="your@email.com"
              className="w-full px-4 py-3 text-white placeholder-gray-400 bg-white border-2 border-transparent outline-none rounded-xl bg-opacity-20 focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-white">Password (min 6 chars)</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-white placeholder-gray-400 bg-white border-2 border-transparent outline-none rounded-xl bg-opacity-20 focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-white">Avatar</label>
            <div className="grid grid-cols-4 gap-2">
              {avatars.map(av => (
                <button
                  key={av}
                  onClick={() => setFormData({...formData, avatar: av})}
                  className={`text-3xl p-2 rounded-lg transition-all ${
                    formData.avatar === av ? 'bg-purple-500 ring-4 ring-purple-300' : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-white">Specialty</label>
            <div className="grid grid-cols-2 gap-2">
              {specialties.map(spec => (
                <button
                  key={spec}
                  onClick={() => setFormData({...formData, specialty: spec})}
                  className={`p-2 rounded-lg text-sm transition-all ${
                    formData.specialty === spec ? 'bg-purple-500 text-white font-bold' : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-4 font-bold text-white transition-all transform bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl hover:from-purple-600 hover:to-pink-700 hover:scale-105"
          >
            Create Account
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Already have an account?{' '}
            <button onClick={onLogin} className="font-bold text-pink-400 hover:text-pink-300">
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function LobbyScreen({ user, onStartGame, onViewLeaderboard, onLogout }) {
  return (
    <div
  className="flex items-center justify-center min-h-screen"
  style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">🧪 Alchemist's Lobby</h1>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-white transition-all bg-red-500 rounded-xl hover:bg-red-600"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="p-6 mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{user.avatar}</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-black">Welcome, {user.username}!</h2>
              <p className="text-lg text-black opacity-90">{user.specialty}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <StatCard icon="🏆" label="Best Score" value={user.stats?.bestScore || 0} />
            <StatCard icon="⭐" label="Level" value={user.stats?.level || 'Apprentice'} />
            <StatCard icon="🎮" label="Games" value={user.stats?.gamesPlayed || 0} />
            <StatCard icon="💰" label="Gold" value={user.stats?.totalGold || 0} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <button
            onClick={onStartGame}
            className="p-8 transition-all transform bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl hover:from-green-600 hover:to-emerald-700 hover:scale-105"
          >
            <div className="mb-4 text-6xl">🎮</div>
            <h3 className="mb-2 text-2xl font-bold text-white">Start New Game</h3>
            <p className="text-white opacity-90">Begin your alchemical adventure!</p>
          </button>

          <button
            onClick={onViewLeaderboard}
            className="p-8 transition-all transform bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl hover:from-purple-600 hover:to-pink-700 hover:scale-105"
          >
            <div className="mb-4 text-6xl">🏆</div>
            <h3 className="mb-2 text-2xl font-bold text-white">Leaderboard</h3>
            <p className="text-white opacity-90">See top alchemists worldwide!</p>
          </button>
        </div>
      </div>
    </div>
  );
}

function LeaderboardScreen({ user, onBack }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await leaderboardAPI.getTopPlayers();
      setLeaderboard(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  className="flex items-center justify-center min-h-screen"
  style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-white hover:text-gray-300">
          ← Back to Lobby
        </button>

        <div className="p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl">
          <div className="mb-8 text-center">
            <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h2 className="mb-2 text-4xl font-bold text-white">Global Leaderboard</h2>
            <p className="text-gray-300">Top Alchemists Worldwide</p>
          </div>

          {loading ? (
            <div className="text-center text-white">Loading...</div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((player) => (
                <div
                  key={player.rank}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    player.username === user.username
                      ? 'bg-yellow-400 bg-opacity-30 ring-2 ring-yellow-400'
                      : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
                >
                  <div className={`text-3xl font-bold ${
                    player.rank === 1 ? 'text-yellow-400' :
                    player.rank === 2 ? 'text-gray-300' :
                    player.rank === 3 ? 'text-orange-400' :
                    'text-white'
                  }`}>
                    #{player.rank}
                  </div>
                  <div className="text-4xl">{player.avatar}</div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-white">{player.username}</div>
                    <div className="text-sm text-gray-300">{player.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">{player.bestScore}</div>
                    <div className="text-sm text-gray-300">points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GameScreen({ user, onGameEnd, onBack }) {
  const [puzzle, setPuzzle] = useState(null);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [questsCompleted, setQuestsCompleted] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [goldEarned, setGoldEarned] = useState(0);
  const [gameStartTime] = useState(Date.now());

  useEffect(() => {
    loadNewPuzzle();
  }, []);

  const loadNewPuzzle = async () => {
    setLoading(true);
    setFeedback('');
    setAnswer('');
    
    try {
      // ✅ CORRECT - Use backend proxy
      const response = await fetch('http://localhost:5000/api/puzzle');
      const data = await response.json();
      setPuzzle(data);
    } catch (error) {
      setFeedback('Failed to load puzzle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!answer || !puzzle) return;

    const userAnswer = parseInt(answer);
    const correctAnswer = puzzle.solution;

    if (userAnswer === correctAnswer) {
      const points = 50;
      const gold = 25;
      setScore(prev => prev + points);
      setGoldEarned(prev => prev + gold);
      setQuestsCompleted(prev => prev + 1);
      setFeedback(`✅ Correct! +${points} points, +${gold} gold`);
      
      setTimeout(() => {
        loadNewPuzzle();
      }, 1500);
    } else {
      setLives(prev => prev - 1);
      setFeedback(`❌ Wrong! The answer was ${correctAnswer}. Lives: ${lives - 1}`);
      
      if (lives - 1 <= 0) {
        setTimeout(() => {
          endGame(false);
        }, 2000);
      } else {
        setTimeout(() => {
          loadNewPuzzle();
        }, 2000);
      }
    }
  };

 const endGame = (survived) => {
    const duration = Math.floor((Date.now() - gameStartTime) / 1000);
    let level = 'Apprentice';
    if (score >= 300) {
        level = 'Master';
    } else if (score >= 150) {
        level = 'Expert';
    } else if (score >= 50) {
        level = 'Advanced';
    }
    
    onGameEnd({
      score,
      level,
      recipesDiscovered: 0,
      questsCompleted,
      goldEarned,
      duration,
      survived,
      livesRemaining: lives
    });
};

  return (
    <div
  className="flex items-center justify-center min-h-screen"
  style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-white hover:text-gray-300">
            ← Back
          </button>
          <div className="flex gap-4 text-white">
            <div className="px-4 py-2 bg-white rounded-lg bg-opacity-20">
              ❤️ Lives: {lives}
            </div>
            <div className="px-4 py-2 bg-white rounded-lg bg-opacity-20">
              ⭐ Score: {score}
            </div>
            <div className="px-4 py-2 bg-white rounded-lg bg-opacity-20">
              💰 Gold: {goldEarned}
            </div>
          </div>
        </div>

        {/* Game Card */}
        <div className="p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-4xl font-bold text-white">🧪 Alchemy Puzzle</h2>
            <p className="text-gray-300">Solve the mystical equation!</p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-white">
              <div className="mb-4 text-6xl animate-bounce">🔮</div>
              <p>Loading puzzle...</p>
            </div>
          ) : puzzle ? (
            <div className="space-y-6">
              {/* Puzzle Image */}
              <div className="flex items-center justify-center p-6 bg-white rounded-2xl">
                <img 
                  src={puzzle.question} 
                  alt="Puzzle" 
                  className="max-w-full max-h-96"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`p-4 rounded-xl text-center font-bold text-lg ${
                  feedback.includes('✅') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {feedback}
                </div>
              )}

              {/* Answer Input */}
              <div className="flex gap-3">
                <input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Enter your answer..."
                  disabled={!!feedback}
                  className="flex-1 px-6 py-4 text-xl text-center text-white placeholder-gray-400 bg-white border-2 border-transparent outline-none rounded-xl bg-opacity-20 focus:border-yellow-400 disabled:opacity-50"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!answer || !!feedback}
                  className="px-8 py-4 text-xl font-bold text-white transition-all transform bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Submit
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 text-center bg-white rounded-xl bg-opacity-10">
                  <div className="mb-1 text-2xl">🎯</div>
                  <div className="text-sm text-gray-300">Quests</div>
                  <div className="text-2xl font-bold text-white">{questsCompleted}</div>
                </div>
                <div className="p-4 text-center bg-white rounded-xl bg-opacity-10">
                  <div className="mb-1 text-2xl">⚡</div>
                  <div className="text-sm text-gray-300">Streak</div>
                  <div className="text-2xl font-bold text-yellow-400">{questsCompleted}</div>
                </div>
                <div className="p-4 text-center bg-white rounded-xl bg-opacity-10">
                  <div className="mb-1 text-2xl">👤</div>
                  <div className="text-sm text-gray-300">Player</div>
                  <div className="text-2xl">{user.avatar}</div>
                </div>
              </div>

              {/* End Game Button */}
              <button
                onClick={() => endGame(true)}
                className="w-full py-3 text-white transition-all bg-gray-600 rounded-xl hover:bg-gray-700"
              >
                End Game
              </button>
            </div>
          ) : (
            <div className="py-20 text-center text-white">
              <p>Failed to load puzzle</p>
              <button
                onClick={loadNewPuzzle}
                className="px-6 py-3 mt-4 font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="p-3 text-center bg-black bg-opacity-20 rounded-xl">
      <div className="mb-1 text-2xl">{icon}</div>
      <div className="text-xs text-black opacity-75">{label}</div>
      <div className="text-lg font-bold text-black">{value}</div>
    </div>
  );
}