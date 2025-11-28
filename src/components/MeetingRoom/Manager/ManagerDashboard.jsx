import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, ArrowRight } from 'lucide-react';
import { getRooms, getBookingsForManager } from '../../../services/meetingRoomApi';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    todayBookings: 0,
    teamBookings: 0,
    trend: { bookings: 8 }
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const parseApiDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    try {
      if (dateTimeStr.includes('T')) {
        return new Date(dateTimeStr);
      } else {
        const [timePart, datePart] = dateTimeStr.split(' ');
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        const [day, month, year] = datePart.split('/').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
      }
    } catch (error) {
      console.error('Error parsing date:', dateTimeStr, error);
      return null;
    }
  };

  const formatDateForComparison = (date) => {
    return date.toISOString().split('T')[0];
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [roomsResponse, bookingsResponse] = await Promise.all([
        getRooms(),
        getBookingsForManager()
      ]);
      
      const rooms = roomsResponse.result || [];
      const bookings = bookingsResponse.result || [];

      const today = formatDateForComparison(new Date());
      const todayBookings = bookings.filter(booking => {
        const startDate = parseApiDateTime(booking.startTime);
        return startDate && formatDateForComparison(startDate) === today;
      }).length;

      const recent = bookings
        .sort((a, b) => {
          const aTime = parseApiDateTime(a.startTime);
          const bTime = parseApiDateTime(b.startTime);
          return bTime - aTime;
        })
        .slice(0, 5);

      setStats({
        totalRooms: rooms.length,
        availableRooms: rooms.filter(room => room.isAvailable && room.working).length,
        todayBookings,
        teamBookings: bookings.length,
        trend: { bookings: 8 }
      });

      setRecentBookings(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = parseApiDateTime(dateString);
    if (!date) return 'N/A';

    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (booking) => {
    const startTime = parseApiDateTime(booking.startTime);
    return startTime && startTime > new Date();
  };

  const StatCard = ({ icon, value, label, color, trend }) => (
    <div className="relative overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-lg rounded-2xl hover:shadow-xl hover:scale-105">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl ${color} shadow-md`}>
            <span className="text-3xl text-white">{icon}</span>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-500 uppercase">{label}</p>
          <p className="mt-2 text-4xl font-bold text-gray-800">
            {loading ? <span className="animate-pulse">...</span> : value}
          </p>
        </div>
      </div>
      <div className={`h-1 ${color}`}></div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">Overview of meeting rooms and team bookings</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all shadow-lg bg-indigo-600 rounded-xl hover:shadow-xl hover:scale-105 hover:bg-indigo-700"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon="🏢" 
          value={stats.totalRooms} 
          label="Total Rooms" 
          color="bg-blue-500"
        />
        <StatCard 
          icon="✅" 
          value={stats.availableRooms} 
          label="Available Rooms" 
          color="bg-green-500"
        />
        <StatCard 
          icon="📅" 
          value={stats.todayBookings} 
          label="Today's Bookings" 
          color="bg-purple-500"
          trend={stats.trend.bookings}
        />
        <StatCard 
          icon="👥" 
          value={stats.teamBookings} 
          label="Total Team Bookings" 
          color="bg-orange-500"
        />
      </div>

      {/* Recent Bookings - Full Width */}
      <div className="relative overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-lg rounded-2xl hover:shadow-xl">
        {/* Header */}
        <div className="p-6 bg-indigo-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="p-3 rounded-xl bg-white/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Recent Bookings</h2>
                <p className="mt-1 text-sm text-indigo-100">5 latest team bookings</p>
              </div>
            </div>
            <span className="px-4 py-2 text-lg font-bold rounded-xl bg-white/20">
              {recentBookings.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-indigo-100">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-900">No bookings yet</p>
              <p className="mt-2 text-gray-600">Team bookings will appear here</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="relative overflow-hidden transition-all duration-300 border-2 border-gray-100 group/item rounded-xl hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1"
                  >
                    {/* Status bar */}
                    <div className={`h-1.5 ${
                      isUpcoming(booking) 
                        ? 'bg-emerald-500' 
                        : 'bg-gray-400'
                    }`}></div>
                    
                    <div className="flex items-center p-5">
                      {/* Date Badge */}
                      <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center mr-5 ${
                        isUpcoming(booking) 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-gray-500 text-white shadow-md'
                      }`}>
                        <div className="text-2xl font-bold leading-none">
                          {parseApiDateTime(booking.startTime)?.getDate() || '-'}
                        </div>
                        <div className="text-xs font-medium uppercase opacity-90">
                          {parseApiDateTime(booking.startTime)?.toLocaleDateString('en-US', { month: 'short' }) || '-'}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-lg font-bold text-gray-900 transition-colors truncate group-hover/item:text-indigo-600">
                            {booking.title}
                          </h3>
                          <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${
                            isUpcoming(booking) 
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' 
                              : 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isUpcoming(booking) ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'
                            }`}></span>
                            {isUpcoming(booking) ? 'Upcoming' : 'Completed'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <svg className="flex-shrink-0 w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium truncate">{booking.roomName}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <svg className="flex-shrink-0 w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="truncate">{booking.organizerName}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <svg className="flex-shrink-0 w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{formatDateTime(booking.startTime)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;