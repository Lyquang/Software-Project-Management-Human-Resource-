// src/components/SettingsPage/SettingsSidebar.jsx
import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

const NavItem = ({ label, tabKey, activeTab, setActiveTab }) => {
  const isActive = activeTab === tabKey;
  
  return (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`w-full text-left px-4 py-3 rounded-lg text-base font-semibold transition-colors flex justify-between items-center
        ${isActive 
          ? 'bg-indigo-600 text-white' 
          : 'text-gray-600 hover:bg-gray-100'
        }`}
    >
      {label}
      {isActive && <FaChevronRight size={14} />}
    </button>
  );
};

const SettingsSidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { label: 'Basic', key: 'basic' },
    { label: 'Account', key: 'account' },
    // { label: 'Payment', key: 'payment' },
  ];

  return (
    <div className="w-64 flex-shrink-0 pr-8">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="space-y-2">
        {navItems.map(item => (
          <NavItem
            key={item.key}
            label={item.label}
            tabKey={item.key}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        ))}
      </div>
    </div>
  );
};

export default SettingsSidebar;