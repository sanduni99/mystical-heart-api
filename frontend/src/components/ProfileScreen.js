import React, { useState, useEffect } from "react";
import bgImage from "../assets/images/bg_2.png";
import { profileAPI } from "../api";

export default function ProfileScreen({ user, setUser, onBack, onLogout, setCurrentScreen }) {
  const [formData, setFormData] = useState({
    username: user.username,
    avatar: user.avatar,
    specialty: user.specialty,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const avatars = ["🧙‍♀️", "🧙‍♂️", "🧑‍🔬", "👨‍🔬", "👩‍🔬", "🧝‍♀️", "🧝‍♂️", "👨‍🔬"];
  const specialties = [
    "Potion Master",
    "Spell Crafter",
    "Crystal Alchemist",
    "Herb Specialist",
  ];

  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");

    try {
      const result = await profileAPI.updateProfile(formData);

      if (result.success) {
        setUser(result.user);
        localStorage.setItem("user", JSON.stringify(result.user));
        setMessage(" Profile updated successfully!");
      } else {
        setMessage("" + result.message);
      }
    } catch (error) {
      setMessage(" Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-2xl p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl">
        <button
          onClick={onBack}
          className="mb-6 text-white hover:text-gray-300"
        >
          ← Back
        </button>

        <div className="mb-8 text-center">
          <div className="mb-4 text-6xl">{formData.avatar}</div>
          <h2 className="text-3xl font-bold text-white">Your Profile</h2>
          <p className="mt-2 text-gray-300">{user.email}</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-center font-bold ${
              message.includes("✅") ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {message}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block mb-2 font-semibold text-white">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-4 py-3 text-white placeholder-gray-400 bg-white border-2 border-transparent outline-none rounded-xl bg-opacity-20 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-white">
              Avatar
            </label>
            <div className="grid grid-cols-4 gap-2">
              {avatars.map((av) => (
                <button
                  key={av}
                  onClick={() => setFormData({ ...formData, avatar: av })}
                  className={`text-3xl p-2 rounded-lg transition-all ${
                    formData.avatar === av
                      ? "bg-blue-500 ring-4 ring-blue-300"
                      : "bg-white bg-opacity-20 hover:bg-opacity-30"
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-white">
              Specialty
            </label>
            <div className="grid grid-cols-2 gap-2">
              {specialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setFormData({ ...formData, specialty: spec })}
                  className={`p-2 rounded-lg text-sm transition-all ${
                    formData.specialty === spec
                      ? "bg-blue-500 text-white font-bold"
                      : "bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full py-4 font-bold text-white transition-all transform bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl hover:from-blue-600 hover:to-cyan-700 hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>

          <button
            onClick={() => setCurrentScreen("settings")}
            className="w-full py-3 text-white transition-all bg-gray-600 rounded-xl hover:bg-gray-700"
          >
             Settings & Security
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-4 text-center bg-white rounded-xl bg-opacity-10">
            <div className="mb-1 text-2xl"></div>
            <div className="text-xs text-gray-300">Member Since</div>
            <div className="text-sm font-bold text-white">
              {new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
          <div className="p-4 text-center bg-white rounded-xl bg-opacity-10">
            <div className="mb-1 text-2xl"></div>
            <div className="text-xs text-gray-300">Total Games</div>
            <div className="text-sm font-bold text-white">
              {user.stats?.gamesPlayed || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
