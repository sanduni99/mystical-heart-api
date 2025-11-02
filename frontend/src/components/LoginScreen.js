import React, { useState } from 'react';
import bgImage from '../assets/images/bg_3.png';

export default function LoginScreen({ onLogin, onBack, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (email && password) {
      onLogin({ email, password });
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
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