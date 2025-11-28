import React, { useState } from 'react';
import AdminDashboard from '../components/MeetingRoom/Admin/AdminDashboard';
import RoomsManagement from '../components/MeetingRoom/Admin/RoomsManagement';
import CalendarView from '../components/MeetingRoom/Admin/CalendarView';
import BookingsManagement from '../components/MeetingRoom/Admin/BookingsManagement';

const MeetingRoomAdmin = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const navigation = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'rooms', icon: '🚪', label: 'Meeting Room Management' },
    { id: 'calendar', icon: '📅', label: 'Calendar View' },
    { id: 'bookings', icon: '📋', label: 'Booking Management' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'rooms':
        return <RoomsManagement />;
      case 'calendar':
        return <CalendarView />;
      case 'bookings':
        return <BookingsManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Phòng Họp</h1>
          <p className="mt-2 text-gray-600">Quản lý toàn bộ hệ thống phòng họp và booking</p>
        </div> */}

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

export default MeetingRoomAdmin;