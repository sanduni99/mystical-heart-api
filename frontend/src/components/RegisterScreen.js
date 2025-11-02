import React, { useState } from 'react';
import bgImagetwo from '../assets/images/bg_2.png';

export default function RegisterScreen({ onRegister, onBack, onLogin }) {
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