import React, { useState } from 'react';
import bgImage from '../assets/images/bg_3.png';
import { profileAPI, authAPI } from '../api'; 

export default function SettingsScreen({ user, onBack, onLogout ,setCurrentScreen}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage(' Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setMessage(' Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await profileAPI.changePassword({
        currentPassword,
        newPassword
      });

      if (result.success) {
        setMessage('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(' ' + result.message);
      }
    } catch (error) {
      setMessage(' Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setMessage(' Please enter your password to delete account');
      return;
    }

    setLoading(true);

    try {
      const result = await profileAPI.deleteAccount(deletePassword);

      if (result.success) {
        alert('Account deleted successfully. You will be logged out.');
        authAPI.logout();
        window.location.href = '/';
      } else {
        setMessage(' ' + result.message);
      }
    } catch (error) {
      setMessage(' Failed to delete account');
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
      <div className="w-full max-w-2xl p-8 bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl">
        <button onClick={onBack} className="mb-6 text-white hover:text-gray-300">← Back</button>
        
        <div className="mb-8 text-center">
          <div className="mb-4 text-6xl"></div>
          <h2 className="text-3xl font-bold text-white">Settings & Security</h2>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-center font-bold ${
            message.includes('✅') ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {message}
          </div>
        )}

        {/* Change Password Section */}
        <div className="p-6 mb-6 bg-white rounded-2xl bg-opacity-10">
          <h3 className="mb-4 text-2xl font-bold text-white"> Change Password</h3>
          
          <div className="space-y-4">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              className="w-full px-4 py-3 text-white placeholder-gray-400 bg-white border-2 border-transparent outline-none rounded-xl bg-opacity-20 focus:border-blue-400"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password (min 6 chars)"
              className="w-full px-4 py-3 text-white placeholder-gray-400 bg-white border-2 border-transparent outline-none rounded-xl bg-opacity-20 focus:border-blue-400"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full px-4 py-3 text-white placeholder-gray-400 bg-white border-2 border-transparent outline-none rounded-xl bg-opacity-20 focus:border-blue-400"
            />
            <button
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full py-3 font-bold text-white transition-all bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="p-6 bg-red-500 rounded-2xl bg-opacity-20">
          <h3 className="mb-4 text-2xl font-bold text-white">⚠️ Danger Zone</h3>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 font-bold text-white transition-all bg-red-600 rounded-xl hover:bg-red-700"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-white">This action cannot be undone. All your data will be permanently deleted.</p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password to confirm"
                className="w-full px-4 py-3 text-white placeholder-gray-400 bg-white border-2 border-transparent outline-none rounded-xl bg-opacity-20 focus:border-red-400"
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="py-3 font-bold text-white transition-all bg-gray-600 rounded-xl hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="py-3 font-bold text-white transition-all bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}