import React, { useState, useEffect } from 'react';
import { getBookingsForManager } from '../../../services/meetingRoomApi';
import { Calendar, Clock, MapPin, Users, Search } from 'lucide-react';

const TeamBookings = () => {
  const [teamBookings, setTeamBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadTeamBookings();
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

  const loadTeamBookings = async () => {
    try {
      setLoading(true);
      const response = await getBookingsForManager();
      setTeamBookings(response.result || []);
    } catch (error) {
      console.error('Error loading team bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = teamBookings.filter(booking => {
    const now = new Date();
    const startTime = parseApiDateTime(booking.startTime);
    
    let statusMatch = true;
    if (filter === 'upcoming') {
      statusMatch = startTime && startTime >= now;
    } else if (filter === 'past') {
      statusMatch = startTime && startTime < now;
    }

    const searchMatch = searchTerm === '' || 
      booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.organizerName.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const BookingCard = ({ booking }) => {
    const formatDateTime = (dateString) => {
      const date = parseApiDateTime(dateString);
      if (!date) return { date: 'N/A', time: 'N/A', fullDate: 'N/A', day: 'N/A', month: 'N/A' };

      return {
        date: date.toLocaleDateString('en-US', { 
          weekday: 'short',
          day: '2-digit', 
          month: '2-digit' 
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        fullDate: date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' })
      };
    };

    const { time, fullDate, day, month } = formatDateTime(booking.startTime);
    const endTime = parseApiDateTime(booking.endTime)?.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) || 'N/A';

    const isUpcoming = () => {
      const startTime = parseApiDateTime(booking.startTime);
      return startTime && startTime >= new Date();
    };

    return (
      <div className="relative overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-xl hover:border-indigo-200 group">
        <div className={`h-1.5 ${isUpcoming() ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
        
        <div className="p-6">
          <div className="flex gap-6">
            <div className={`flex-shrink-0 w-20 h-20 rounded-xl flex flex-col items-center justify-center ${
              isUpcoming() 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-500 text-white'
            } shadow-lg`}>
              <div className="text-2xl font-bold leading-none">{day}</div>
              <div className="text-xs font-medium uppercase opacity-90">{month}</div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-indigo-600">
                    {booking.title}
                  </h3>
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                    isUpcoming() 
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' 
                      : 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20'
                  }`}>
                    {isUpcoming() ? '🟢 Upcoming' : '⚫ Completed'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Meeting Room</div>
                    <div className="font-semibold">{booking.roomName}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Organizer</div>
                    <div className="font-semibold">{booking.organizerName}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date</div>
                    <div className="font-semibold">{fullDate}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Time</div>
                    <div className="font-semibold">{time} - {endTime}</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {booking.description && (
                <div className="p-3 mb-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600">{booking.description}</p>
                </div>
              )}

              {/* Attendees */}
              {booking.attendeeNames && booking.attendeeNames.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">
                    Attendees ({booking.attendeeNames.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {booking.attendeeNames.map((name, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-700 transition-colors bg-white border border-gray-200 rounded-full hover:border-indigo-300 hover:bg-indigo-50"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Team Bookings</h1>
          <p className="text-lg text-gray-600">Monitor and manage all bookings in your department</p>
        </div>

        {/* Filters */}
        <div className="p-6 mb-8 bg-white shadow-lg rounded-2xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Filter tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  filter === 'upcoming'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  filter === 'past'
                    ? 'bg-gray-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1 left-4 top-1/2" />
              <input
                type="text"
                placeholder="Search by title, room or organizer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-3 pl-12 pr-4 text-sm transition-all border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Count */}
            <div className="flex items-center px-4 py-2 bg-indigo-50 rounded-xl">
              <span className="text-sm font-semibold text-indigo-900">
                {filteredBookings.length} <span className="text-indigo-600">/ {teamBookings.length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="py-20 text-center bg-white shadow-lg rounded-2xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-indigo-100 rounded-full">
              <Calendar className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">No bookings found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try searching with different keywords or adjust the filter' : 'All bookings will appear here'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {currentBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 mt-8 bg-white shadow-lg rounded-2xl">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> - <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredBookings.length)}</span> of <span className="font-semibold text-gray-900">{filteredBookings.length}</span> bookings
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600'
                    }`}
                  >
                    ← Previous
                  </button>
                  
                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${
                              currentPage === pageNumber
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <span key={pageNumber} className="flex items-center px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600'
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeamBookings;