import React from 'react';
import { LogOut } from 'lucide-react';
import bgImage from '../assets/images/bg_3.png';
import StatCard from './StatCard';

export default function LobbyScreen({ user, onStartGame, onViewLeaderboard, onLogout, setCurrentScreen }) {
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={onStartGame}
            className="p-8 transition-all transform bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl hover:from-green-600 hover:to-emerald-700 hover:scale-105"
          >
            <div className="mb-4 text-6xl">🎮</div>
            <h3 className="mb-2 text-2xl font-bold text-white">Start Game</h3>
            <p className="text-white opacity-90">Play puzzles!</p>
          </button>

          <button
            onClick={onViewLeaderboard}
            className="p-8 transition-all transform bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl hover:from-purple-600 hover:to-pink-700 hover:scale-105"
          >
            <div className="mb-4 text-6xl">🏆</div>
            <h3 className="mb-2 text-2xl font-bold text-white">Leaderboard</h3>
            <p className="text-white opacity-90">Top players</p>
          </button>

          <button
            onClick={() => setCurrentScreen('profile')}
            className="p-8 transition-all transform bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl hover:from-blue-600 hover:to-indigo-700 hover:scale-105"
          >
            <div className="mb-4 text-6xl">👤</div>
            <h3 className="mb-2 text-2xl font-bold text-white">Profile</h3>
            <p className="text-white opacity-90">View & edit</p>
          </button>
        </div>
      </div>
    </div>
  );
}