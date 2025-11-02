import React, { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import bgImage from '../assets/images/bg_3.png';

const leaderboardAPI = {
  getTopPlayers: async () => {
    const response = await fetch('http://localhost:5000/api/leaderboard');
    return response.json();
  }
};

export default function LeaderboardScreen({ user, onBack }) {
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
      console.error('Failed to load leaderboard:', error);
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