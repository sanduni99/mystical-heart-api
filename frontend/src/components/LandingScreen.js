import React from 'react';
import bgImage from '../assets/images/bg_3.png';

export default function LandingScreen({ onLogin, onRegister }) {
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
            🔐 Login
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