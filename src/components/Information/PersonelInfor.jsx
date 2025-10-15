// src/components/SettingsPage/SettingsPage.jsx
import React, { useState } from 'react';
import SettingsSidebar from './SettingsSidebar';
import BasicInfo from './BasicInfo';
import AccountSettings from './AccountSettings';
// import PaymentSettings from './PaymentSettings';

const PersonnelInfo = () => {
  const [activeTab, setActiveTab] = useState('basic');

  // Hàm để render component tương ứng với tab đang active
  const renderContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicInfo />;
      case 'account':
        return <AccountSettings />;
      // case 'payment':
      //   return <PaymentSettings />;
      default:
        return <BasicInfo />;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex">
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-grow">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default PersonnelInfo;