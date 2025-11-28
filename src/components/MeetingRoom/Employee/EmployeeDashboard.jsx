import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, Users, List, TrendingUp, RefreshCw, X, AlertCircle, Plus } from 'lucide-react';
import { getRooms, getMyBookings, createBooking, deleteBooking } from '../../../services/meetingRoomApi';

// ===== CANCEL BOOKING MODAL =====
const CancelBookingModal = ({ 
  show, 
  onClose, 
  booking, 
  onConfirm 
}) => {
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (show) {
      setCancelReason('');
    }
  }, [show]);

  const parseApiDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    const [timePart, datePart] = dateTimeStr.split(' ');
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    const [day, month, year] = datePart.split('/').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  const isBookingInProgress = () => {
    const now = new Date();
    const startTime = parseApiDateTime(booking.startTime);
    const endTime = parseApiDateTime(booking.endTime);
    return startTime && endTime && startTime <= now && now <= endTime;
  };

  const handleConfirm = () => {
    if (!cancelReason.trim()) {
      alert('Please enter cancellation reason');
      return;
    }
    onConfirm(booking.id, cancelReason);
  };

  if (!show || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Cancel Booking</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {isBookingInProgress() && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 mr-3 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Warning: Meeting in progress!</p>
                  <p className="mt-1 text-sm text-red-700">
                    You are canceling a meeting that is currently in progress. This action may affect attendees.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 mr-3 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">You are about to cancel:</p>
                <p className="mt-1 text-sm text-yellow-700">{booking.title}</p>
                <p className="text-sm text-yellow-600">{booking.roomName}</p>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Cancellation reason <span className="text-red-500">*</span>
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
              onClick={onClose}
              className="px-6 py-3 font-medium text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-3 font-medium text-white transition-all bg-red-600 rounded-xl hover:bg-red-700"
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== BOOK ROOM MODAL =====
const BookRoomModal = ({ 
  show, 
  onClose, 
  rooms, 
  bookingForm, 
  setBookingForm,
  onSubmit 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-8 bg-white shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Book New Meeting Room</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Meeting Room *</label>
            <select
              required
              value={bookingForm.roomId}
              onChange={(e) => setBookingForm({...bookingForm, roomId: e.target.value})}
              className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select room...</option>
              {rooms.filter(room => room.working && room.isAvailable).map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} - {room.location} ({room.capacity} people)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Meeting Title *</label>
            <input
              type="text"
              required
              value={bookingForm.title}
              onChange={(e) => setBookingForm({...bookingForm, title: e.target.value})}
              className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter meeting title..."
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={bookingForm.description}
              onChange={(e) => setBookingForm({...bookingForm, description: e.target.value})}
              className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="3"
              placeholder="Detailed description of the meeting..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Start Time *</label>
              <input
                type="datetime-local"
                required
                value={bookingForm.startTime}
                onChange={(e) => setBookingForm({...bookingForm, startTime: e.target.value})}
                className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">End Time *</label>
              <input
                type="datetime-local"
                required
                value={bookingForm.endTime}
                onChange={(e) => setBookingForm({...bookingForm, endTime: e.target.value})}
                className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 font-medium text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 font-medium text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700"
            >
              Book Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== MY BOOKINGS MODAL =====
const MyBookingsModal = ({ 
  show, 
  onClose, 
  setShowCancelModal,
  setSelectedBooking 
}) => {
  const [myAllBookings, setMyAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMyBookings = async () => {
      try {
        setLoading(true);
        const response = await getMyBookings();
        setMyAllBookings(response.result || []);
      } catch (error) {
        console.error('Error loading my bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      loadMyBookings();
    }
  }, [show]);

  const parseApiDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    const [timePart, datePart] = dateTimeStr.split(' ');
       const [hours, minutes, seconds] = timePart.split(':').map(Number);
    const [day, month, year] = datePart.split('/').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  const canCancelBooking = (booking) => {
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return false;
    }
    const now = new Date();
    const endTime = parseApiDateTime(booking.endTime);
    if (endTime && now > endTime) {
      return false;
    }
    return true;
  };

  const handleCancelClick = (booking) => {
    if (!canCancelBooking(booking)) {
      alert('This booking cannot be cancelled');
      return;
    }
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const BookingCard = ({ booking }) => {
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

    const getStatusInfo = () => {
      const now = new Date();
      const startTime = parseApiDateTime(booking.startTime);
      const endTimeDate = parseApiDateTime(booking.endTime);
      
      if (!startTime || !endTimeDate) {
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unknown' };
      }
      
      if (booking.status === 'CANCELLED') {
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' };
      }
      
      if (now < startTime) {
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Upcoming' };
      } else if (now >= startTime && now <= endTimeDate) {
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'In Progress' };
      } else {
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' };
      }
    };

    const statusInfo = getStatusInfo();
    const canCancel = canCancelBooking(booking);

    return (
      <div className="p-4 transition-all border border-gray-200 rounded-xl hover:shadow-md hover:border-indigo-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-gray-800">{booking.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                {statusInfo.label}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="truncate">{booking.roomName}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{fullDate}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>{time} - {endTime}</span>
              </div>
              {booking.attendeeNames && booking.attendeeNames.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{booking.attendeeNames.length} attendees</span>
                </div>
              )}
            </div>

            {booking.description && booking.description !== 'string' && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {booking.description}
              </p>
            )}

            {canCancel && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleCancelClick(booking)}
                  className="px-3 py-1 text-xs font-medium text-red-600 transition-all rounded-lg bg-red-50 hover:bg-red-100"
                >
                  Cancel booking
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-4xl p-8 bg-white shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Bookings Management</h2>
            <p className="mt-1 text-sm text-gray-600">
              {loading ? 'Loading...' : `Total: ${myAllBookings.length} bookings`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : myAllBookings.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <List className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-500">No bookings yet</p>
            </div>
          ) : (
            myAllBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====
const EmployeeDashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    myBookings: 0,
    todayBookings: 0
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [showBookRoomModal, setShowBookRoomModal] = useState(false);
  const [showMyBookingsModal, setShowMyBookingsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [bookingForm, setBookingForm] = useState({
    roomId: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    attendeeCodes: []
  });

  useEffect(() => {
    loadDashboardData();
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

  const parseApiDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    const [timePart, datePart] = dateTimeStr.split(' ');
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    const [day, month, year] = datePart.split('/').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  };

  const formatDateForComparison = (date) => {
    return date.toISOString().split('T')[0];
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [roomsResponse, myBookingsResponse] = await Promise.all([
        getRooms(),
        getMyBookings()
      ]);
      
      const roomsData = roomsResponse.result || [];
      const myBookings = myBookingsResponse.result || [];

      setRooms(roomsData);

      const today = formatDateForComparison(new Date());
      
      const todayBookings = myBookings.filter(booking => {
        const startDate = parseApiDateTime(booking.startTime);
        return startDate && formatDateForComparison(startDate) === today;
      }).length;

      const upcoming = myBookings
        .filter(booking => {
          const startTime = parseApiDateTime(booking.startTime);
          const now = new Date();
          return startTime && startTime >= now;
        })
        .sort((a, b) => {
          const aTime = parseApiDateTime(a.startTime);
          const bTime = parseApiDateTime(b.startTime);
          return aTime - bTime;
        })
        .slice(0, 5);

      const recent = myBookings
        .sort((a, b) => {
          const aTime = parseApiDateTime(a.startTime);
          const bTime = parseApiDateTime(b.startTime);
          return bTime - aTime;
        })
        .slice(0, 3);

      const availableRooms = roomsData.filter(room => room.working && room.isAvailable).length;

      setStats({
        totalRooms: roomsData.length,
        availableRooms: availableRooms,
        myBookings: myBookings.length,
        todayBookings: todayBookings
      });

      setUpcomingBookings(upcoming);
      setRecentBookings(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = useCallback(async (e) => {
    e.preventDefault();
    try {
      const formatToISO = (dateTimeStr) => {
        if (!dateTimeStr) return '';
        const date = new Date(dateTimeStr);
        const timezoneOffset = -date.getTimezoneOffset();
        const diff = timezoneOffset >= 0 ? '+' : '-';
        const pad = num => String(Math.floor(Math.abs(num))).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${diff}${pad(timezoneOffset/60)}:${pad(timezoneOffset%60)}`;
      };

      const bookingData = {
        roomId: parseInt(bookingForm.roomId),
        title: bookingForm.title,
        description: bookingForm.description,
        startTime: formatToISO(bookingForm.startTime),
        endTime: formatToISO(bookingForm.endTime),
        attendeeCodes: bookingForm.attendeeCodes.filter(code => code.trim() !== '')
      };

      const response = await createBooking(bookingData);
      
      if (response && response.code === 200) {
        showToast('Room booked successfully!', 'success');
        setShowBookRoomModal(false);
        setBookingForm({
          roomId: '',
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          attendeeCodes: []
        });
        loadDashboardData();
      } else {
        throw new Error(response?.message || 'Error booking room');
      }
    } catch (error) {
      console.error('Error booking room:', error);
      showToast(error.message || 'Error booking room', 'error');
    }
  }, [bookingForm]);

  const handleCancelBooking = async (bookingId, reason) => {
    try {
      await deleteBooking(bookingId, reason);
      showToast('Booking cancelled successfully', 'success');
      loadDashboardData();
      setShowCancelModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error canceling booking:', error);
      const errorMessage = error.response?.data?.message || 'Unable to cancel booking';
      showToast(errorMessage, 'error');
    }
  };

  const canCancelBooking = (booking) => {
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return false;
    }
    return true;
  };

  const handleCancelClick = (booking) => {
    if (!canCancelBooking(booking)) {
      showToast('This booking cannot be cancelled', 'error');
      return;
    }
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const StatCard = ({ icon, value, label, color }) => (
    <div className="relative overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-lg rounded-2xl hover:shadow-xl hover:scale-105">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl ${color} shadow-md`}>
            <span className="text-3xl text-white">{icon}</span>
          </div>
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

  const BookingCard = ({ booking, type = 'upcoming' }) => {
    const formatDateTime = (dateString) => {
      const date = parseApiDateTime(dateString);
      if (!date) return { date: 'N/A', time: 'N/A', fullDate: 'N/A' };

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
        })
      };
    };

    const { date, time, fullDate } = formatDateTime(booking.startTime);
    const endTime = parseApiDateTime(booking.endTime)?.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) || 'N/A';

    const getStatusInfo = () => {
      const now = new Date();
      const startTime = parseApiDateTime(booking.startTime);
      const endTimeDate = parseApiDateTime(booking.endTime);
      
      if (!startTime || !endTimeDate) {
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unknown' };
      }
      
      if (booking.status === 'CANCELLED') {
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' };
      }
      
      if (now < startTime) {
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Upcoming' };
      } else if (now >= startTime && now <= endTimeDate) {
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'In Progress' };
      } else {
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' };
      }
    };

    const statusInfo = getStatusInfo();
    const canCancel = canCancelBooking(booking);

    return (
      <div className="p-4 transition-all border border-gray-200 rounded-xl hover:shadow-md hover:border-indigo-300 group">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-gray-800 transition-colors group-hover:text-indigo-700">
                {booking.title}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                {statusInfo.label}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="truncate">{booking.roomName}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{fullDate}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>{time} - {endTime}</span>
              </div>
            </div>

            {canCancel && type === 'upcoming' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleCancelClick(booking)}
                  className="px-3 py-1 text-xs font-medium text-red-600 transition-all rounded-lg bg-red-50 hover:bg-red-100"
                >
                  Cancel booking
                </button>
              </div>
            )}
          </div>

          {type === 'upcoming' && date !== 'N/A' && (
            <div className="flex flex-col items-center ml-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{date.split(' ')[1]}</div>
                <div className="text-xs font-medium text-gray-500 uppercase">{date.split(' ')[0]}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const QuickActionCard = ({ icon: Icon, title, description, onClick, color }) => (
    <button 
      onClick={onClick}
      className={`flex items-center w-full p-4 transition-all border-2 border-transparent rounded-xl ${color} hover:shadow-lg hover:scale-105 group`}
    >
      <div className="flex items-center justify-center w-12 h-12 mr-4 bg-black/10 rounded-xl">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-left">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-white text-opacity-90">{description}</p>
      </div>
    </button>
  );

  const Toast = () => {
    if (!toast.show) return null;

    return (
      <div className="fixed z-50 transform -translate-x-1/2 top-8 left-1/2">
        <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm border transition-all animate-toast-in ${
          toast.type === 'success' 
            ? 'bg-white/95 border-green-200 text-gray-800' 
            : 'bg-white/95 border-red-200 text-gray-800'
        }`}>
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
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toast />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Personal Dashboard</h1>
          <p className="mt-2 text-gray-600">Overview of your bookings and schedule</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all bg-indigo-600 shadow-lg rounded-xl hover:bg-indigo-700 hover:shadow-xl"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

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
          value={stats.myBookings} 
          label="My Bookings" 
          color="bg-purple-500"
        />
        <StatCard 
          icon="🔴" 
          value={stats.todayBookings} 
          label="Today's Bookings" 
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="overflow-hidden transition-all bg-white border border-gray-100 shadow-lg rounded-3xl hover:shadow-xl">
          <div className="p-6 border-b border-gray-100 bg-green-50">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">📅 Upcoming Bookings</h2>
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
                <p className="mt-1 text-sm text-gray-400">Book a room for your next meeting</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} type="upcoming" />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden transition-all bg-white border border-gray-100 shadow-lg rounded-3xl hover:shadow-xl">
            <div className="p-6 border-b border-gray-100 bg-purple-50">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">📋 Recent Bookings</h2>
                <button
                  onClick={() => setShowMyBookingsModal(true)}
                  className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700"
                >
                  View all →
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentBookings.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <List className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">No bookings yet</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Your recent bookings will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} type="recent" />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden transition-all bg-white border border-gray-100 shadow-lg rounded-3xl hover:shadow-xl">
            <div className="p-6 border-b border-gray-100 bg-orange-50">
              <h2 className="text-2xl font-bold text-gray-800">⚡ Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <QuickActionCard
                  icon={Plus}
                  title="Book New Room"
                  description="Find and book a new meeting room"
                  onClick={() => setShowBookRoomModal(true)}
                  color="bg-indigo-500 hover:bg-indigo-600"
                />
                
                <QuickActionCard
                  icon={List}
                  title="Manage Bookings"
                  description="View and manage all your bookings"
                  onClick={() => setShowMyBookingsModal(true)}
                  color="bg-green-500 hover:bg-green-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookRoomModal 
        show={showBookRoomModal}
        onClose={() => setShowBookRoomModal(false)}
        rooms={rooms}
        bookingForm={bookingForm}
        setBookingForm={setBookingForm}
        onSubmit={handleBookRoom}
      />
      
      <MyBookingsModal 
        show={showMyBookingsModal}
        onClose={() => setShowMyBookingsModal(false)}
        setShowCancelModal={setShowCancelModal}
        setSelectedBooking={setSelectedBooking}
      />

      <CancelBookingModal
        show={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onConfirm={handleCancelBooking}
      />

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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;