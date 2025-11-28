import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, ToggleLeft, ToggleRight, ArrowRight, X, Calendar, Clock, MapPin, Users, FileText, Wrench, CheckCircle, Building, Plus, Calendar1 } from 'lucide-react';
import { 
  getRooms, 
  createRoom, 
  updateRoom,
  getBookings,  
  deleteBooking,
  getBookingById
} from '../../../services/meetingRoomApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    todayBookings: 0,
    activeBookings: 0,
    trend: { rooms: 0, bookings: 12 }
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [showBookingDetailModal, setShowBookingDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentRoomsPage, setCurrentRoomsPage] = useState(1);
  const [currentBookingDetail, setCurrentBookingDetail] = useState(null);
  const [bookingDetailLoading, setBookingDetailLoading] = useState(false);
  const itemsPerPage = 10;
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const parseApiDateTime = (dateTimeString) => {
    if (!dateTimeString) return null;
    
    try {
      const [timePart, datePart] = dateTimeString.split(' ');
      const [hours, minutes, seconds] = timePart.split(':');
      const [day, month, year] = datePart.split('/');
      
      return new Date(year, month - 1, day, hours, minutes, seconds);
    } catch (error) {
      console.error('Error parsing date:', dateTimeString, error);
      return null;
    }
  };

  const formatDateForComparison = (date) => {
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    loadDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.show]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [roomsResponse, bookingsResponse] = await Promise.all([
        getRooms(),
        getBookings()
      ]);
      
      const rooms = roomsResponse.result || [];
      const bookings = bookingsResponse.result || [];

      const today = formatDateForComparison(new Date());
      
      const todayBookings = bookings.filter(booking => {
        const startDate = parseApiDateTime(booking.startTime);
        return startDate && formatDateForComparison(startDate) === today;
      }).length;
      
      const now = new Date();
      const activeBookings = bookings.filter(booking => {
        const startTime = parseApiDateTime(booking.startTime);
        const endTime = parseApiDateTime(booking.endTime);
        return startTime && endTime && startTime <= now && endTime >= now;
      }).length;

      const availableRooms = rooms.filter(room => room.working && room.isAvailable).length;

      setStats({
        totalRooms: rooms.length,
        availableRooms: availableRooms,
        todayBookings,
        activeBookings,
        trend: { rooms: 5, bookings: 12 }
      });

      setAllBookings(bookings);
      setAllRooms(rooms);
      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayTime = (dateTimeString) => {
    const date = parseApiDateTime(dateTimeString);
    if (!date) return 'N/A';
    
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDetailedTime = (dateTimeString) => {
    const date = parseApiDateTime(dateTimeString);
    if (!date) return 'N/A';
    
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleRoomMaintenance = async (roomId, currentWorkingStatus) => {
    try {
      const roomToUpdate = allRooms.find(room => room.id === roomId);
      if (!roomToUpdate) {
        showToast('Room not found', 'error');
        return;
      }

      const updateData = {
        name: roomToUpdate.name,
        capacity: roomToUpdate.capacity,
        location: roomToUpdate.location,
        equipment: roomToUpdate.equipment,
        isAvailable: roomToUpdate.isAvailable,
        working: !currentWorkingStatus
      };

      const response = await updateRoom(roomId, updateData);
      
      if (response && response.code === 200) {
        const updatedRooms = allRooms.map(room => 
          room.id === roomId ? { ...room, working: !currentWorkingStatus } : room
        );
        
        setAllRooms(updatedRooms);
        
        const availableRooms = updatedRooms.filter(room => room.working && room.isAvailable).length;
        
        setStats(prev => ({
          ...prev,
          availableRooms: availableRooms
        }));
        
        showToast(
          `Room "${roomToUpdate.name}" ${!currentWorkingStatus ? 'activated' : 'put into maintenance'} successfully`, 
          'success'
        );
      } else {
        throw new Error(response?.message || 'Error updating room');
      }
    } catch (error) {
      console.error('Error updating room maintenance status:', error);
      showToast(error.message || 'Error updating room status', 'error');
    }
  };

  const handleViewBookingDetail = async (bookingId) => {
    try {
      setBookingDetailLoading(true);
      const response = await getBookingById(bookingId);
      
      if (response && response.code === 200) {
        setCurrentBookingDetail(response.result);
        setShowBookingDetailModal(true);
      } else {
        throw new Error(response?.message || 'Cannot load booking details');
      }
    } catch (error) {
      console.error('Error fetching booking detail:', error);
      showToast(error.message || 'Error loading booking details', 'error');
    } finally {
      setBookingDetailLoading(false);
    }
  };

  const handleDeleteBooking = async (id) => {
    const reason = window.prompt('Reason for cancellation:', '');
    if (reason !== null) {
      try {
        await deleteBooking(id, reason);
        setShowBookingsModal(false);
        setCurrentPage(1);
        loadDashboardData();
        showToast('Booking cancelled successfully', 'success');
      } catch (error) {
        showToast(error.message || 'Cannot cancel booking', 'error');
      }
    }
  };

  const StatCard = ({ icon, value, label, color, trend }) => (
    <div className="relative overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-lg rounded-2xl hover:shadow-xl hover:scale-105">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-md`}>
            <span className="text-3xl">{icon}</span>
          </div>
          {trend && (
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
      <div className={`h-1 bg-gradient-to-r ${color}`}></div>
    </div>
  );

  const AddRoomModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      capacity: '',
      location: '',
      equipment: '',
      isAvailable: true,
      working: true
    });
    
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
      const newErrors = {};
      
      if (!formData.name.trim()) {
        newErrors.name = 'Room name is required';
      }
      
      if (!formData.capacity) {
        newErrors.capacity = 'Capacity is required';
      } else if (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0) {
        newErrors.capacity = 'Capacity must be a number greater than 0';
      }
      
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
      setFormData({...formData, [field]: value});
      
      if (errors[field]) {
        setErrors({
          ...errors,
          [field]: ''
        });
      }
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }
      
      setIsSubmitting(true);
      
      try {
        await createRoom({
          ...formData,
          capacity: parseInt(formData.capacity)
        });
        setShowAddRoomModal(false);
        
        setFormData({
          name: '',
          capacity: '',
          location: '',
          equipment: '',
          isAvailable: true,
          working: true
        });
        setErrors({});
        
        loadDashboardData();
        showToast('Meeting room added successfully', 'success');
      } catch (error) {
        showToast(error.message || 'Error occurred while adding room', 'error');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Add New Meeting Room</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Room Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 transition-all border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter room name"
              />
              {errors.name && (
                <p className="flex items-center mt-1 text-sm text-red-600">
                  <span className="mr-1">⚠</span> {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className={`w-full px-4 py-3 transition-all border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.capacity ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="Enter capacity"
              />
              {errors.capacity && (
                <p className="flex items-center mt-1 text-sm text-red-600">
                  <span className="mr-1">⚠</span> {errors.capacity}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 transition-all border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.location ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter room location"
              />
              {errors.location && (
                <p className="flex items-center mt-1 text-sm text-red-600">
                  <span className="mr-1">⚠</span> {errors.location}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Equipment <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="3"
                value={formData.equipment}
                onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                placeholder="Describe available equipment in the room..."
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 font-medium text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                    Adding...
                  </div>
                ) : (
                  'Add Room'
                )}
              </button>
              <button
                onClick={() => {
                  setShowAddRoomModal(false);
                  setErrors({});
                }}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 font-medium text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RoomsModal = () => {
    const totalPages = Math.ceil(allRooms.length / itemsPerPage);
    const startIndex = (currentRoomsPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRooms = allRooms.slice(startIndex, endIndex);

    const Pagination = ({ currentPage, totalPages, onPageChange }) => {
      const pages = [];
      const maxVisible = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
      
      if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ← Previous
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      );
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-6xl bg-white shadow-2xl rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="sticky top-0 z-10 px-8 py-6 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-xl bg-indigo-100">
                    <Building className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">Meeting Room Management</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-600">
                  <span className="font-medium">
                    Total: <span className="px-2 py-0.5 bg-gray-100 rounded-md">{allRooms.length} rooms</span>
                  </span>
                  <span className="w-px h-4 bg-gray-300"></span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="font-medium">{allRooms.filter(r => r.working && r.isAvailable).length} available</span>
                  </span>
                  <span className="w-px h-4 bg-gray-300"></span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span className="font-medium">{allRooms.filter(r => r.working && !r.isAvailable).length} booked</span>
                  </span>
                  <span className="w-px h-4 bg-gray-300"></span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="font-medium">{allRooms.filter(r => !r.working).length} maintenance</span>
                  </span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowRoomsModal(false);
                  setCurrentRoomsPage(1);
                }} 
                className="p-2 text-gray-500 transition-all duration-300 rounded-full hover:bg-gray-100 hover:rotate-90"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="space-y-4">
              {currentRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-xl font-medium">No rooms yet</p>
                  <p className="mt-2 text-sm">Add your first meeting room</p>
                </div>
              ) : (
                currentRooms.map((room) => (
                  <div 
                    key={room.id} 
                    className="relative overflow-hidden transition-all duration-300 border border-gray-200 group rounded-xl hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 group-hover:opacity-100"></div>
                    
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 ${
                      !room.working 
                        ? 'bg-red-500' 
                        : room.isAvailable 
                          ? 'bg-green-500' 
                          : 'bg-yellow-500'
                    }`}></div>
                    
                    <div className="relative p-6 pl-8">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-indigo-600">
                              {room.name}
                            </h3>
                            
                            <div className="flex flex-wrap gap-2">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                                room.working 
                                  ? 'bg-green-100 text-green-800 ring-1 ring-green-200' 
                                  : 'bg-red-100 text-red-800 ring-1 ring-red-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${room.working ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {room.working ? 'Active' : 'Under Maintenance'}
                              </span>
                              
                              {room.working && (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                                  room.isAvailable 
                                    ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-200' 
                                    : 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${room.isAvailable ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
                                  {room.isAvailable ? 'Available' : 'Booked'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 transition-colors bg-gray-50 rounded-lg group-hover:bg-white">
                              <svg className="flex-shrink-0 w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <div>
                                <span className="text-xs text-gray-500">Capacity</span>
                                <p className="font-semibold">{room.capacity} people</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 transition-colors bg-gray-50 rounded-lg group-hover:bg-white">
                              <svg className="flex-shrink-0 w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div>
                                <span className="text-xs text-gray-500">Location</span>
                                <p className="font-semibold">{room.location}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 transition-colors bg-gray-50 rounded-lg group-hover:bg-white">
                              <svg className="flex-shrink-0 w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div>
                                <span className="text-xs text-gray-500">Equipment</span>
                                <p className="font-semibold">{room.equipment || 'None'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => toggleRoomMaintenance(room.id, room.working)}
                            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-300 rounded-lg border hover:shadow-md hover:scale-105 ${
                              room.working
                                ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                                : 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                            }`}
                          >
                            {room.working ? (
                              <>
                                <Wrench className="w-4 h-4" />
                                <span>Maintenance</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination 
                  currentPage={currentRoomsPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentRoomsPage} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const BookingsModal = () => {
    const totalPages = Math.ceil(allBookings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = allBookings.slice(startIndex, endIndex);

    const Pagination = ({ currentPage, totalPages, onPageChange }) => {
      const pages = [];
      const maxVisible = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
      
      if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ← Previous
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      );
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 bg-blue-600 border-b border-gray-200">
            <div className="text-white">
              <h2 className="text-3xl font-bold text-white">All Bookings</h2>
              <p className="mt-2 text-sm text-white">
                Total: <span className="font-semibold">{allBookings.length}</span> bookings
              </p>
            </div>
            <button 
              onClick={() => {
                setShowBookingsModal(false);
                setCurrentPage(1);
              }} 
              className="p-2 text-white transition-all duration-300 rounded-full hover:bg-gray-100 hover:rotate-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="space-y-4">
              {currentBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xl font-medium">No bookings yet</p>
                  <p className="mt-2 text-sm">Create your first booking</p>
                </div>
              ) : (
                currentBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="relative overflow-hidden transition-all duration-300 border border-gray-200 group rounded-xl hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-indigo-50 to-purple-50 group-hover:opacity-100"></div>
                    
                    <div className="relative flex items-center justify-between p-6">
                      <div className="flex-1 min-w-0 space-y-3">
                        <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-indigo-600">
                          {booking.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-indigo-500">📍</span>
                            <span className="font-medium">{booking.roomName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-purple-500">🕐</span>
                            <span className="font-medium">
                              {formatDisplayTime(booking.startTime)} - {formatDisplayTime(booking.endTime)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 ml-6">
                        <button 
                          onClick={() => handleViewBookingDetail(booking.id)}
                          disabled={bookingDetailLoading && currentBookingDetail?.id === booking.id}
                          className="px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 rounded-lg 
                                    bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:scale-105
                                    disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                        >
                          {bookingDetailLoading && currentBookingDetail?.id === booking.id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                              <span>Loading...</span>
                            </div>
                          ) : (
                            'Details'
                          )}
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteBooking(booking.id)}
                          className="px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 rounded-lg 
                                    bg-red-600 hover:bg-red-700 hover:shadow-lg hover:scale-105 whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentPage} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const BookingDetailModal = () => {
    if (!currentBookingDetail) return null;

    const getTimeDuration = (startTime, endTime) => {
      const start = parseApiDateTime(startTime);
      const end = parseApiDateTime(endTime);
      if (!start || !end) return 'N/A';
      
      const durationMs = end - start;
      const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
      const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (durationHours > 0) {
        return `${durationHours} hours ${durationMinutes} minutes`;
      }
      return `${durationMinutes} minutes`;
    };

    const getBookingStatus = () => {
      const now = new Date();
      const startTime = parseApiDateTime(currentBookingDetail.startTime);
      const endTime = parseApiDateTime(currentBookingDetail.endTime);
      
      if (!startTime || !endTime) return 'UNKNOWN';
      
      if (now < startTime) {
        return { status: 'UPCOMING', text: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
      } else if (now >= startTime && now <= endTime) {
        return { status: 'ONGOING', text: 'Ongoing', color: 'bg-green-100 text-green-800' };
      } else {
        return { status: 'COMPLETED', text: 'Completed', color: 'bg-gray-100 text-gray-800' };
      }
    };

    const statusInfo = getBookingStatus();

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="w-full max-w-2xl p-8 bg-white shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Booking Details</h2>
              <p className="mt-1 text-sm text-gray-600">Complete booking information</p>
            </div>
            <button 
              onClick={() => {
                setShowBookingDetailModal(false);
                setCurrentBookingDetail(null);
              }} 
              className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {bookingDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <p className="text-gray-600">Loading details...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{currentBookingDetail.title}</h3>
                    <div className="flex items-center mt-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="font-mono font-bold text-gray-800">#{currentBookingDetail.id}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Time</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Start:</span>
                      <span className="font-medium text-right text-gray-800">
                        {formatDetailedTime(currentBookingDetail.startTime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>End:</span>
                      <span className="font-medium text-right text-gray-800">
                        {formatDetailedTime(currentBookingDetail.endTime)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span>Duration:</span>
                      <span className="font-medium text-blue-600">
                        {getTimeDuration(currentBookingDetail.startTime, currentBookingDetail.endTime)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Meeting Room</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Room Name:</span>
                      <span className="font-medium text-gray-800">{currentBookingDetail.roomName}</span>
                    </div>
                    {(() => {
                      const roomInfo = allRooms.find(room => room.name === currentBookingDetail.roomName);
                      return (
                        <>
                          <div className="flex justify-between">
                            <span>Capacity:</span>
                            <span className="font-medium text-gray-800">
                              {roomInfo ? `${roomInfo.capacity} people` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Location:</span>
                            <span className="font-medium text-gray-800">
                              {roomInfo?.location || 'N/A'}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Organizer</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Full Name:</span>
                      <span className="font-medium text-gray-800">{currentBookingDetail.organizerName}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Other Information</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Attendees:</span>
                      <span className="font-medium text-gray-800">
                        {currentBookingDetail.attendeeNames?.length || 0} people
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created Date:</span>
                      <span className="font-medium text-gray-800">
                        {currentBookingDetail.createdAt ? formatDetailedTime(currentBookingDetail.createdAt) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {currentBookingDetail.description && currentBookingDetail.description !== 'string' && (
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Description</h4>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {currentBookingDetail.description}
                  </p>
                </div>
              )}

              {currentBookingDetail.attendeeNames && 
              currentBookingDetail.attendeeNames.length > 0 && 
              !(currentBookingDetail.attendeeNames.length === 1 && currentBookingDetail.attendeeNames[0] === currentBookingDetail.organizerName) && (
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Users className="w-5 h-5 text-teal-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Attendees</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentBookingDetail.attendeeNames
                      .filter(attendee => attendee !== currentBookingDetail.organizerName)
                      .map((attendee, index) => (
                        <span key={index} className="px-3 py-1 text-sm text-teal-700 rounded-full bg-teal-50">
                          {attendee}
                        </span>
                      ))
                    }
                    {currentBookingDetail.attendeeNames.filter(attendee => attendee !== currentBookingDetail.organizerName).length === 0 && (
                      <p className="text-sm text-gray-500">Only the organizer is attending</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowBookingDetailModal(false);
                    setCurrentBookingDetail(null);
                  }}
                  className="flex-1 px-4 py-3 font-medium text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Close
                </button>
                {(statusInfo.status === 'UPCOMING' || statusInfo.status === 'ONGOING') && (
                  <button
                    onClick={() => {
                      setShowBookingDetailModal(false);
                      handleDeleteBooking(currentBookingDetail.id);
                    }}
                    className="flex-1 px-4 py-3 font-medium text-white transition-all bg-red-600 rounded-xl hover:bg-red-700"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen from-indigo-50 via-white to-purple-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="mt-2 text-gray-600">Meeting Room & Booking Management</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all bg-indigo-600 shadow-lg rounded-xl hover:bg-indigo-700 hover:shadow-xl"
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
          trend={stats.trend.rooms}
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
          icon="🔴" 
          value={stats.activeBookings} 
          label="Active Now" 
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="relative overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-lg rounded-2xl hover:shadow-2xl group">
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 group-hover:opacity-100"></div>
          
          <div className="relative">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-800">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Recent Bookings</h2>
                </div>
                <button
                  onClick={() => setShowBookingsModal(true)}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-indigo-600 transition-all duration-300 rounded-lg bg-indigo-50 hover:bg-indigo-100 hover:scale-105"
                >
                  <span>View All</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {recentBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-lg font-medium">No bookings yet</p>
                  <p className="mt-1 text-sm">Bookings will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="relative overflow-hidden transition-all duration-300 border border-gray-200 group/item rounded-xl hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 bg-green-500 group-hover/item:w-1.5"></div>
                      
                      <div className="flex items-center justify-between p-4 pl-5">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 transition-colors truncate group-hover/item:text-indigo-600">
                            {booking.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                            <svg className="flex-shrink-0 w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium truncate">{booking.roomName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <svg className="flex-shrink-0 w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">
                              {formatDisplayTime(booking.startTime)}
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 ml-3 text-xs font-semibold text-green-700 bg-green-100 rounded-full ring-1 ring-green-200 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          Confirmed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-lg rounded-2xl hover:shadow-2xl group">
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 group-hover:opacity-100"></div>
          
          <div className="relative">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3 text-gray-800">
                <div className="p-2 rounded-lg bg-purple-100">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                <button 
                  onClick={() => setShowAddRoomModal(true)}
                  className="relative flex items-center w-full p-5 overflow-hidden text-left transition-all duration-300 border-2 border-gray-200 group/action rounded-xl hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-indigo-50 to-purple-50 group-hover/action:opacity-100"></div>
                  
                  <div className="relative flex items-center flex-1">
                    <div className="flex items-center justify-center w-12 h-12 mr-4 transition-all duration-300 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 group-hover/action:scale-110 group-hover/action:rotate-6">
                      <Plus className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 transition-colors group-hover/action:text-indigo-600">
                        Add New Room
                      </h3>
                      <p className="mt-0.5 text-sm text-gray-600">Create meeting room in the system</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 transition-all duration-300 group-hover/action:text-indigo-600 group-hover/action:translate-x-1" />
                  </div>
                </button>

                <button 
                  onClick={() => setShowRoomsModal(true)}
                  className="relative flex items-center w-full p-5 overflow-hidden text-left transition-all duration-300 border-2 border-gray-200 group/action rounded-xl hover:border-blue-400 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-blue-50 to-cyan-50 group-hover/action:opacity-100"></div>
                  
                  <div className="relative flex items-center flex-1">
                    <div className="flex items-center justify-center w-12 h-12 mr-4 transition-all duration-300 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 group-hover/action:scale-110 group-hover/action:rotate-6">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 transition-colors group-hover/action:text-blue-600">
                        Manage Rooms
                      </h3>
                      <p className="mt-0.5 text-sm text-gray-600">View & manage room status</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 transition-all duration-300 group-hover/action:text-blue-600 group-hover/action:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                
                <button 
                  onClick={() => setShowBookingsModal(true)}
                  className="relative flex items-center w-full p-5 overflow-hidden text-left transition-all duration-300 border-2 border-gray-200 group/action rounded-xl hover:border-green-400 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-green-50 to-teal-50 group-hover/action:opacity-100"></div>
                  
                  <div className="relative flex items-center flex-1">
                    <div className="flex items-center justify-center w-12 h-12 mr-4 transition-all duration-300 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 group-hover/action:scale-110 group-hover/action:rotate-6">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 transition-colors group-hover/action:text-green-600">
                        Manage Bookings
                      </h3>
                      <p className="mt-0.5 text-sm text-gray-600">View & manage all bookings</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 transition-all duration-300 group-hover/action:text-green-600 group-hover/action:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddRoomModal && <AddRoomModal />}
      {showRoomsModal && <RoomsModal />}
      {showBookingsModal && <BookingsModal />}
      {showBookingDetailModal && <BookingDetailModal />}
      
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
    </div>
  );
};

export default AdminDashboard;