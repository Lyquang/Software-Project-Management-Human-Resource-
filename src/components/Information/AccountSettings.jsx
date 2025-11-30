// src/components/SettingsPage/AccountSettings.jsx
import React, { useState, useEffect } from 'react';
import { FaInfoCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { API_ROUTES } from '../../api/apiRoutes';
import { jwtDecode } from 'jwt-decode';

const AccountSettings = () => {
  // State để quản lý dữ liệu form
  const [accountData, setAccountData] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Fetch user info from myInfo API
    const fetchMyInfo = async () => {
      try {
        const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
        const res = await fetch(API_ROUTES.PERSONNELS.MY_INFO, {
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && (data?.code === 200 || data?.code === 0) && data?.result) {
          const user = data.result;
          setAccountData(prev => ({ ...prev, username: user.username || '' }));
          setAccountId(user.account_id || user.accountId || '');
        }
      } catch (e) {
        console.error('Failed to load user info:', e);
      }
    };
    fetchMyInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccountData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!accountId) {
      setError('Account ID not found. Please log in again.');
      return;
    }

    // Check if changing password or just username
    const isChangingPassword = accountData.newPassword.trim() !== '';

    if (isChangingPassword) {
      // Check password match
      if (accountData.newPassword !== accountData.confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
      
      // Check password length
      if (accountData.newPassword.length < 5) {
        setError('New password must be at least 5 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const payload = {
        username: accountData.username.trim(),
        password: isChangingPassword ? accountData.newPassword : undefined,
      };

      // Xóa password nếu không thay đổi
      if (!isChangingPassword) {
        delete payload.password;
      }

      const res = await fetch(API_ROUTES.ACCOUNTS.UPDATE(accountId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data?.code !== 200 && data?.code !== 0)) {
        throw new Error(data?.message || `Update failed (${res.status})`);
      }

      toast.success('Account updated successfully!');
      
      // Update sessionStorage if needed
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.username = accountData.username.trim();
        sessionStorage.setItem('user', JSON.stringify(parsed));
      }

      // Reset password fields
      setAccountData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setError(err.message || 'Update failed');
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
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
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={accountData.currentPassword}
                onChange={handleInputChange}
                className="input-field pr-10"
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={accountData.newPassword}
                onChange={handleInputChange}
                className="input-field pr-10"
                placeholder="Enter a new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={accountData.confirmPassword}
                onChange={handleInputChange}
                className="input-field pr-10"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Display error */}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountSettings;