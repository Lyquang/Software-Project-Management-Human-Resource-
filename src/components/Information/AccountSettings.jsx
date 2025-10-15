// src/components/SettingsPage/AccountSettings.jsx
import React, { useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

const AccountSettings = () => {
  // State để quản lý dữ liệu form
  const [accountData, setAccountData] = useState({
    username: 'Daffa Naufal Athallah',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccountData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Reset lỗi trước mỗi lần submit

    // Kiểm tra mật khẩu mới
    if (accountData.newPassword !== accountData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    // Kiểm tra độ dài mật khẩu mới (ví dụ)
    if (accountData.newPassword && accountData.newPassword.length < 8) {
        setError('New password must be at least 8 characters long.');
        return;
    }

    console.log('Updating account with data:', {
        username: accountData.username,
        currentPassword: accountData.currentPassword,
        newPassword: accountData.newPassword,
    });

    // Gọi API để cập nhật ở đây
    alert('Account updated successfully!');
    // Reset các trường mật khẩu sau khi cập nhật thành công
    setAccountData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    }));
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 w-full">
      <div className="flex items-center gap-2 mb-8">
        <h2 className="text-xl font-bold text-gray-800">Account Settings</h2>
        <FaInfoCircle className="text-gray-400" />
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={accountData.username}
              onChange={handleInputChange}
              className="input-field" // Sử dụng class tái sử dụng từ index.css
            />
          </div>

          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={accountData.currentPassword}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter your current password"
            />
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={accountData.newPassword}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Enter a new password"
            />
          </div>
          
          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={accountData.confirmPassword}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Confirm your new password"
            />
          </div>
        </div>
        
        {/* Hiển thị lỗi */}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-8">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountSettings;