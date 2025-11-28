import React, { useState, useEffect } from 'react';
import { getMyBookings, deleteBooking } from '../../../services/meetingRoomApi';
import { Calendar, Clock, MapPin, Users, X, AlertCircle } from 'lucide-react';

const MyBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadMyBookings();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Convert date format from API
  const parseApiDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    
    try {
      const [timePart, datePart] = dateTimeStr.split(' ');
      const [hours, minutes, seconds] = timePart.split(':').map(Number);
      const [day, month, year] = datePart.split('/').map(Number);
      
      return new Date(year, month - 1, day, hours, minutes, seconds);
    } catch (error) {
      console.error('Error parsing date:', dateTimeStr, error);
      return null;
    }
  };

  // Check if booking is currently in progress
  const isBookingInProgress = (booking) => {
    const now = new Date();
    const startTime = parseApiDateTime(booking.startTime);
    const endTime = parseApiDateTime(booking.endTime);
    
    return startTime && endTime && startTime <= now && now <= endTime;
  };

  // Check if booking can be cancelled
  const canCancelBooking = (booking) => {
    // Cannot cancel completed or cancelled bookings
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return false;
    }
    
    // Allow cancellation even if in progress (according to dashboard logic)
    return true;
  };

  const loadMyBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings();
      setBookings(response.result || []);
    } catch (error) {
      console.error('Error loading my bookings:', error);
      showToast('Error loading bookings list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (booking) => {
    if (!canCancelBooking(booking)) {
      showToast('This booking cannot be cancelled', 'error');
      return;
    }
    
    setSelectedBooking(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!cancelReason.trim()) {
      showToast('Please enter cancellation reason', 'error');
      return;
    }

    try {
      await deleteBooking(selectedBooking.id, cancelReason);
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
      showToast('Booking cancelled successfully', 'success');
      loadMyBookings();
    } catch (error) {
      console.error('Error canceling booking:', error);
      const errorMessage = error.response?.data?.message || 'Error cancelling booking';
      showToast(errorMessage, 'error');
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusMap = {
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'CONFIRMED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      'COMPLETED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' }
    };
    return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Confirmed' };
  };

  // Get real-time status
  const getRealTimeStatus = (booking) => {
    const now = new Date();
    const startTime = parseApiDateTime(booking.startTime);
    const endTime = parseApiDateTime(booking.endTime);
    
    if (!startTime || !endTime) {
      return booking.status;
    }
    
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      return booking.status;
    }
    
    if (now < startTime) {
      return 'UPCOMING';
    } else if (now >= startTime && now <= endTime) {
      return 'IN_PROGRESS';
    } else {
      return 'COMPLETED';
    }
  };

  const upcomingBookings = bookings.filter(booking => {
    const status = getRealTimeStatus(booking);
    return status === 'UPCOMING' || status === 'IN_PROGRESS';
  });

  const pastBookings = bookings.filter(booking => {
    const status = getRealTimeStatus(booking);
    return status === 'COMPLETED' || booking.status === 'CANCELLED';
  });

  const BookingCard = ({ booking, showActions = false }) => {
    const formatDateTime = (dateString) => {
      const date = parseApiDateTime(dateString);
      if (!date) return { time: 'N/A', fullDate: 'N/A' };

      return {
        time: date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        fullDate: date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    };

    const { time, fullDate } = formatDateTime(booking.startTime);
    const endTime = parseApiDateTime(booking.endTime)?.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) || 'N/A';

    const realTimeStatus = getRealTimeStatus(booking);
    const statusInfo = getStatusColor(booking.status);
    const canCancel = canCancelBooking(booking);

    // Display real-time status if different from API status
    const displayStatus = realTimeStatus === 'IN_PROGRESS' 
      ? { bg: 'bg-green-100', text: 'text-green-800', label: 'In Progress' }
      : realTimeStatus === 'UPCOMING' 
      ? { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Upcoming' }
      : statusInfo;

    return (
      <div className="p-6 transition-all border border-gray-200 rounded-xl hover:shadow-md hover:border-indigo-300 group">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-lg font-semibold text-gray-800 transition-colors group-hover:text-indigo-700">
                {booking.title}
              </h3>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${displayStatus.bg} ${displayStatus.text}`}>
                {displayStatus.label}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-3" />
                <span>{booking.roomName}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-3" />
                <span>{fullDate}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-3" />
                <span>{time} - {endTime}</span>
              </div>
              {booking.attendeeNames && booking.attendeeNames.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-3" />
                  <span>{booking.attendeeNames.length} attendees</span>
                </div>
              )}
            </div>

            {booking.description && (
              <p className="mt-3 text-sm text-gray-500">
                {booking.description}
              </p>
            )}

            {showActions && canCancel && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleCancelBooking(booking)}
                  className="px-4 py-2 text-sm font-medium text-red-600 transition-all rounded-lg bg-red-50 hover:bg-red-100"
                >
                  Cancel Booking
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
          <p className="mt-2 text-gray-600">View and manage all your bookings</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Upcoming Bookings */}
          <div className="overflow-hidden transition-all bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md">
            <div className="p-6 border-b border-gray-200 bg-green-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">📅 Upcoming & In Progress</h2>
                <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
                  {upcomingBookings.length} bookings
                </span>
              </div>
            </div>
            <div className="p-6">
              {upcomingBookings.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">No upcoming bookings</p>
                  <p className="mt-1 text-sm text-gray-400">All your bookings will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} showActions={true} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Past Bookings */}
          <div className="overflow-hidden transition-all bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md">
            <div className="p-6 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">📋 Completed & Cancelled</h2>
                <span className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                  {pastBookings.length} bookings
                </span>
              </div>
            </div>
            <div className="p-6">
              {pastBookings.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">No completed bookings</p>
                  <p className="mt-1 text-sm text-gray-400">Past bookings will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} showActions={false} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white shadow-xl rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Cancel Booking</h2>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                  setCancelReason('');
                }}
                className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Special warning when booking is in progress */}
              {isBookingInProgress(selectedBooking) && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 mr-3 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Warning: Meeting in progress!</p>
                      <p className="mt-1 text-sm text-red-700">
                        You are cancelling an ongoing meeting. This action may affect attendees.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking information */}
              <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 mr-3 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">You are about to cancel booking:</p>
                    <p className="mt-1 text-sm text-yellow-700">{selectedBooking.title}</p>
                    <p className="text-sm text-yellow-600">{selectedBooking.roomName}</p>
                    <p className="text-sm text-yellow-500">
                      {parseApiDateTime(selectedBooking.startTime)?.toLocaleString('en-US')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter cancellation reason..."
                  rows="4"
                  className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedBooking(null);
                    setCancelReason('');
                  }}
                  className="px-6 py-3 font-medium text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Go Back
                </button>
                <button
                  onClick={confirmCancelBooking}
                  className="px-6 py-3 font-medium text-white transition-all bg-red-600 rounded-xl hover:bg-red-700"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed z-50 transform -translate-x-1/2 top-8 left-1/2">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm border transition-all ${
            toast.type === 'success' 
              ? 'bg-white/95 border-green-200 text-gray-800' 
              : 'bg-white/95 border-red-200 text-gray-800'
          } animate-toast-in`}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <span className={`text-lg ${toast.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {toast.type === 'success' ? '✓' : '✕'}
              </span>
            </div>
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes toast-in {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-toast-in {
          animation: toast-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default MyBooking;