import React, { useState } from 'react';
import EmployeeDashboard from '../components/MeetingRoom/Employee/EmployeeDashboard';
import BookRoom from '../components/MeetingRoom/Employee/BookRoom';
import MyBookings from '../components/MeetingRoom/Employee/MyBookings';

const EmployeeMeetingRoom = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const navigation = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'book-room', icon: '➕', label: 'Book Room' },
    { id: 'my-bookings', icon: '📋', label: 'My Booking' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <EmployeeDashboard />;
      case 'book-room':
        return <BookRoom />;
      case 'my-bookings':
        return <MyBookings />;
      default:
        return <EmployeeDashboard />;
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

export default EmployeeMeetingRoom;