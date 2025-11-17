import React, { useState } from 'react';
import ManagerDashboard from '../components/MeetingRoom/Manager/ManagerDashboard';
import MyBookings from '../components/MeetingRoom/Manager/MyBooking';
import BookRoom from '../components/MeetingRoom/Manager/BookRoom';
import TeamBookings from '../components/MeetingRoom/Manager/TeamBookings';
import RoomOverview from '../components/MeetingRoom/Manager/RoomManagement';

const ManagerMeetingRoom = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const navigation = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'team-bookings', icon: '👥', label: 'Booking Team' },
    { id: 'my-bookings', icon: '📋', label: 'My Booking' },
    { id: 'book-room', icon: '➕', label: 'Đặt phòng' },
    { id: 'rooms', icon: '🚪', label: 'Quản lý Phòng' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <ManagerDashboard />;
      case 'team-bookings':
        return <TeamBookings />;
      case 'my-bookings':
        return <MyBookings />;
      case 'book-room':
        return <BookRoom />;
      case 'rooms':
        return <RoomOverview />;
      default:
        return <ManagerDashboard />;
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Navigation Tabs */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex border-b border-gray-200">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                  activeSection === item.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2 text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {renderSection()}
      </div>
    </div>
  );
};

export default ManagerMeetingRoom;