import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, ToggleLeft, ToggleRight, X, Calendar, Clock, MapPin, Users, FileText, Wrench, CheckCircle } from 'lucide-react';
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
      
      // Sửa logic tính todayBookings
      const todayBookings = bookings.filter(booking => {
        const startDate = parseApiDateTime(booking.startTime);
        return startDate && formatDateForComparison(startDate) === today;
      }).length;
      
      // Sửa logic tính activeBookings
      const now = new Date();
      const activeBookings = bookings.filter(booking => {
        const startTime = parseApiDateTime(booking.startTime);
        const endTime = parseApiDateTime(booking.endTime);
        return startTime && endTime && startTime <= now && endTime >= now;
      }).length;

      // Cập nhật logic tính availableRooms: chỉ tính những phòng đang hoạt động (working) và có sẵn (isAvailable)
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
      showToast('Lỗi khi tải dữ liệu dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Hàm format hiển thị thời gian từ API
  const formatDisplayTime = (dateTimeString) => {
    const date = parseApiDateTime(dateTimeString);
    if (!date) return 'N/A';
    
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hàm format hiển thị chi tiết thời gian
  const formatDetailedTime = (dateTimeString) => {
    const date = parseApiDateTime(dateTimeString);
    if (!date) return 'N/A';
    
    return date.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hàm toggle trạng thái bảo trì (working)
  const toggleRoomMaintenance = async (roomId, currentWorkingStatus) => {
    try {
      const roomToUpdate = allRooms.find(room => room.id === roomId);
      if (!roomToUpdate) {
        showToast('Không tìm thấy phòng', 'error');
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
        
        // Cập nhật lại số phòng khả dụng
        const availableRooms = updatedRooms.filter(room => room.working && room.isAvailable).length;
        
        setStats(prev => ({
          ...prev,
          availableRooms: availableRooms
        }));
        
        showToast(
          `Đã ${!currentWorkingStatus ? 'kích hoạt' : 'chuyển sang bảo trì'} phòng "${roomToUpdate.name}" thành công`, 
          'success'
        );
      } else {
        throw new Error(response?.message || 'Lỗi khi cập nhật phòng');
      }
    } catch (error) {
      console.error('Error updating room maintenance status:', error);
      showToast(error.message || 'Lỗi khi cập nhật trạng thái phòng', 'error');
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
        throw new Error(response?.message || 'Không thể tải chi tiết booking');
      }
    } catch (error) {
      console.error('Error fetching booking detail:', error);
      showToast(error.message || 'Lỗi khi tải chi tiết booking', 'error');
    } finally {
      setBookingDetailLoading(false);
    }
  };

  const handleDeleteBooking = async (id) => {
    const reason = window.prompt('Lý do hủy booking:', '');
    if (reason !== null) {
      try {
        await deleteBooking(id, reason);
        setShowBookingsModal(false);
        setCurrentPage(1);
        loadDashboardData();
        showToast('Booking đã được hủy thành công', 'success');
      } catch (error) {
        showToast(error.message || 'Không thể hủy booking', 'error');
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
        newErrors.name = 'Tên phòng là bắt buộc';
      }
      
      if (!formData.capacity) {
        newErrors.capacity = 'Sức chứa là bắt buộc';
      } else if (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0) {
        newErrors.capacity = 'Sức chứa phải là số lớn hơn 0';
      }
      
      if (!formData.location.trim()) {
        newErrors.location = 'Vị trí là bắt buộc';
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
        showToast('Đã thêm phòng họp mới thành công', 'success');
      } catch (error) {
        showToast(error.message || 'Có lỗi xảy ra khi thêm phòng', 'error');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">Thêm phòng họp mới</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Tên phòng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 transition-all border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên phòng"
              />
              {errors.name && (
                <p className="flex items-center mt-1 text-sm text-red-600">
                  <span className="mr-1">⚠</span> {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Sức chứa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                className={`w-full px-4 py-3 transition-all border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.capacity ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="Nhập sức chứa"
              />
              {errors.capacity && (
                <p className="flex items-center mt-1 text-sm text-red-600">
                  <span className="mr-1">⚠</span> {errors.capacity}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Vị trí <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 transition-all border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.location ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Nhập vị trí phòng"
              />
              {errors.location && (
                <p className="flex items-center mt-1 text-sm text-red-600">
                  <span className="mr-1">⚠</span> {errors.location}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Thiết bị <span className="text-gray-400">(Tùy chọn)</span>
              </label>
              <textarea
                className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="3"
                value={formData.equipment}
                onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                placeholder="Mô tả thiết bị có sẵn trong phòng..."
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
                    Đang thêm...
                  </div>
                ) : (
                  'Thêm phòng'
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
                Hủy
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
            ← Trước
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
            Sau →
          </button>
        </div>
      );
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
  <div className="w-full max-w-6xl bg-white shadow-2xl rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
    {/* Header với gradient */}
    <div className="sticky top-0 z-10 px-8 py-6 bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="flex items-center justify-between">
        <div className="text-white">
          <h2 className="text-3xl font-bold">Quản lý Phòng Họp</h2>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
            <span className="font-medium">
              Tổng cộng: <span className="px-2 py-0.5 bg-white/20 rounded-md">{allRooms.length} phòng</span>
            </span>
            <span className="w-px h-4 bg-white/30"></span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="font-medium">{allRooms.filter(r => r.working && r.isAvailable).length} khả dụng</span>
            </span>
            <span className="w-px h-4 bg-white/30"></span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              <span className="font-medium">{allRooms.filter(r => r.working && !r.isAvailable).length} đã đặt</span>
            </span>
            <span className="w-px h-4 bg-white/30"></span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              <span className="font-medium">{allRooms.filter(r => !r.working).length} bảo trì</span>
            </span>
          </div>
        </div>
        <button 
          onClick={() => {
            setShowRoomsModal(false);
            setCurrentRoomsPage(1);
          }} 
          className="p-2 text-white transition-all duration-300 rounded-full hover:bg-white/20 hover:rotate-90"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    {/* Content area với scroll */}
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="space-y-4">
        {currentRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-xl font-medium">Chưa có phòng nào</p>
            <p className="mt-2 text-sm">Hãy thêm phòng họp đầu tiên</p>
          </div>
        ) : (
          currentRooms.map((room) => (
            <div 
              key={room.id} 
              className="relative overflow-hidden transition-all duration-300 border border-gray-200 group rounded-xl hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1"
            >
              {/* Gradient overlay khi hover */}
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 group-hover:opacity-100"></div>
              
              {/* Status indicator bar bên trái */}
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
                    {/* Title và badges */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-gray-800 transition-colors group-hover:text-indigo-600">
                        {room.name}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2">
                        {/* Badge trạng thái hoạt động */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                          room.working 
                            ? 'bg-green-100 text-green-800 ring-1 ring-green-200' 
                            : 'bg-red-100 text-red-800 ring-1 ring-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${room.working ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {room.working ? 'Đang hoạt động' : 'Đang bảo trì'}
                        </span>
                        
                        {/* Badge trạng thái đặt phòng */}
                        {room.working && (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                            room.isAvailable 
                              ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-200' 
                              : 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${room.isAvailable ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
                            {room.isAvailable ? 'Có thể đặt' : 'Đã được đặt'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Thông tin chi tiết */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 transition-colors bg-gray-50 rounded-lg group-hover:bg-white">
                        <svg className="flex-shrink-0 w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div>
                          <span className="text-xs text-gray-500">Sức chứa</span>
                          <p className="font-semibold">{room.capacity} người</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 transition-colors bg-gray-50 rounded-lg group-hover:bg-white">
                        <svg className="flex-shrink-0 w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <span className="text-xs text-gray-500">Vị trí</span>
                          <p className="font-semibold">{room.location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 transition-colors bg-gray-50 rounded-lg group-hover:bg-white">
                        <svg className="flex-shrink-0 w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <span className="text-xs text-gray-500">Thiết bị</span>
                          <p className="font-semibold">{room.equipment || 'Không có'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => toggleRoomMaintenance(room.id, room.working)}
                      className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all duration-300 rounded-lg shadow-sm hover:shadow-md hover:scale-105 ${
                        room.working
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                      }`}
                    >
                      {room.working ? (
                        <>
                          <Wrench className="w-4 h-4" />
                          <span>Bảo trì</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Kích hoạt</span>
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
      
      {/* Pagination */}
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

    const Pagination = () => {
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
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ← Trước
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
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
              onClick={() => setCurrentPage(page)}
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
                onClick={() => setCurrentPage(totalPages)}
                className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau →
          </button>
        </div>
      );
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
  <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
    {/* Header với gradient */}
    <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 bg-gradient-to-r from-indigo-500 to-purple-600">
      <div className="text-white">
        <h2 className="text-3xl font-bold">Tất cả Booking</h2>
        <p className="mt-2 text-sm opacity-90">
          Tổng cộng: <span className="font-semibold">{allBookings.length}</span> booking
        </p>
      </div>
      <button 
        onClick={() => {
          setShowBookingsModal(false);
          setCurrentPage(1);
        }} 
        className="p-2 text-white transition-all duration-300 rounded-full hover:bg-white/20 hover:rotate-90"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    {/* Content area với scroll */}
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="space-y-4">
        {currentBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xl font-medium">Chưa có booking nào</p>
            <p className="mt-2 text-sm">Hãy tạo booking đầu tiên của bạn</p>
          </div>
        ) : (
          currentBookings.map((booking) => (
            <div 
              key={booking.id} 
              className="relative overflow-hidden transition-all duration-300 border border-gray-200 group rounded-xl hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1"
            >
              {/* Gradient overlay khi hover */}
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
                    className="px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-lg hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                  >
                    {bookingDetailLoading && currentBookingDetail?.id === booking.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        <span>Đang tải...</span>
                      </div>
                    ) : (
                      'Chi tiết'
                    )}
                  </button>
                  
                  <button 
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:scale-105 whitespace-nowrap"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Trước
          </button>
          
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  currentPage === i + 1
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-110'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 transition-all bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau →
          </button>
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
        return `${durationHours} giờ ${durationMinutes} phút`;
      }
      return `${durationMinutes} phút`;
    };

    // Tính toán trạng thái dựa trên thời gian hiện tại
    const getBookingStatus = () => {
      const now = new Date();
      const startTime = parseApiDateTime(currentBookingDetail.startTime);
      const endTime = parseApiDateTime(currentBookingDetail.endTime);
      
      if (!startTime || !endTime) return 'UNKNOWN';
      
      if (now < startTime) {
        return { status: 'UPCOMING', text: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800' };
      } else if (now >= startTime && now <= endTime) {
        return { status: 'ONGOING', text: 'Đang diễn ra', color: 'bg-green-100 text-green-800' };
      } else {
        return { status: 'COMPLETED', text: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800' };
      }
    };

    const statusInfo = getBookingStatus();

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="w-full max-w-2xl p-8 bg-white shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Chi tiết Booking</h2>
              <p className="mt-1 text-sm text-gray-600">Thông tin đầy đủ về booking</p>
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
                <p className="text-gray-600">Đang tải chi tiết...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header với tiêu đề và trạng thái */}
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
                    <p className="text-sm text-gray-600">Mã booking</p>
                    <p className="font-mono font-bold text-gray-800">#{currentBookingDetail.id}</p>
                  </div>
                </div>
              </div>

              {/* Grid thông tin chính */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Thời gian */}
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Thời gian</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Bắt đầu:</span>
                      <span className="font-medium text-right text-gray-800">
                        {formatDetailedTime(currentBookingDetail.startTime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kết thúc:</span>
                      <span className="font-medium text-right text-gray-800">
                        {formatDetailedTime(currentBookingDetail.endTime)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span>Thời lượng:</span>
                      <span className="font-medium text-blue-600">
                        {getTimeDuration(currentBookingDetail.startTime, currentBookingDetail.endTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Phòng họp */}
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Phòng họp</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Tên phòng:</span>
                      <span className="font-medium text-gray-800">{currentBookingDetail.roomName}</span>
                    </div>
                    {/* Tìm thông tin phòng từ allRooms để lấy capacity và location */}
                    {(() => {
                      const roomInfo = allRooms.find(room => room.name === currentBookingDetail.roomName);
                      return (
                        <>
                          <div className="flex justify-between">
                            <span>Sức chứa:</span>
                            <span className="font-medium text-gray-800">
                              {roomInfo ? `${roomInfo.capacity} người` : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vị trí:</span>
                            <span className="font-medium text-gray-800">
                              {roomInfo?.location || 'N/A'}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Người đặt */}
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Người đặt</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Họ tên:</span>
                      <span className="font-medium text-gray-800">{currentBookingDetail.organizerName}</span>
                    </div>
                    {/* Các trường không có trong API sẽ được ẩn */}
                  </div>
                </div>

                {/* Thông tin khác */}
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FileText className="w-5 h-5 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Thông tin khác</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Số người tham dự:</span>
                      <span className="font-medium text-gray-800">
                        {currentBookingDetail.attendeeNames?.length || 0} người
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ngày tạo:</span>
                      <span className="font-medium text-gray-800">
                        {currentBookingDetail.createdAt ? formatDetailedTime(currentBookingDetail.createdAt) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mô tả */}
              {currentBookingDetail.description && currentBookingDetail.description !== 'string' && (
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Mô tả</h4>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {currentBookingDetail.description}
                  </p>
                </div>
              )}

              {/* Danh sách người tham dự */}
              {currentBookingDetail.attendeeNames && 
              currentBookingDetail.attendeeNames.length > 0 && 
              !(currentBookingDetail.attendeeNames.length === 1 && currentBookingDetail.attendeeNames[0] === currentBookingDetail.organizerName) && (
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Users className="w-5 h-5 text-teal-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Người tham dự</h4>
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
                      <p className="text-sm text-gray-500">Chỉ có người đặt tham dự</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowBookingDetailModal(false);
                    setCurrentBookingDetail(null);
                  }}
                  className="flex-1 px-4 py-3 font-medium text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Đóng
                </button>
                {/* Chỉ cho phép hủy booking nếu chưa diễn ra hoặc đang diễn ra */}
                {(statusInfo.status === 'UPCOMING' || statusInfo.status === 'ONGOING') && (
                  <button
                    onClick={() => {
                      setShowBookingDetailModal(false);
                      handleDeleteBooking(currentBookingDetail.id);
                    }}
                    className="flex-1 px-4 py-3 font-medium text-white transition-all bg-red-600 rounded-xl hover:bg-red-700"
                  >
                    Hủy Booking
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
          <p className="mt-2 text-gray-600">Quản lý phòng họp & booking</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center gap-2 px-6 py-3 font-medium text-white transition-all bg-indigo-600 shadow-lg rounded-xl hover:bg-indigo-700 hover:shadow-xl"
        >
          <RefreshCw className="w-5 h-5" />
          Làm mới
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon="🏢" 
          value={stats.totalRooms} 
          label="Tổng số phòng" 
          color="from-blue-400 to-blue-600"
          trend={stats.trend.rooms}
        />
        <StatCard 
          icon="✅" 
          value={stats.availableRooms} 
          label="Phòng khả dụng" 
          color="from-green-400 to-green-600"
        />
        <StatCard 
          icon="📅" 
          value={stats.todayBookings} 
          label="Booking hôm nay" 
          color="from-purple-400 to-purple-600"
          trend={stats.trend.bookings}
        />
        <StatCard 
          icon="🔴" 
          value={stats.activeBookings} 
          label="Đang diễn ra" 
          color="from-orange-400 to-red-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="relative overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-lg rounded-2xl hover:shadow-2xl group">
          {/* Gradient border effect */}
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 group-hover:opacity-100"></div>
          
          <div className="relative">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 rounded-lg bg-white/20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">Booking gần đây</h2>
                </div>
                <button
                  onClick={() => setShowBookingsModal(true)}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 rounded-lg bg-white/20 hover:bg-white/30 hover:scale-105"
                >
                  <span>Xem tất cả</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {recentBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-lg font-medium">Chưa có booking nào</p>
                  <p className="mt-1 text-sm">Các booking sẽ hiển thị tại đây</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="relative overflow-hidden transition-all duration-300 border border-gray-200 group/item rounded-xl hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5"
                    >
                      {/* Status indicator */}
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
                              {new Date(booking.startTime).toLocaleString('vi-VN', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 ml-3 text-xs font-semibold text-green-700 bg-green-100 rounded-full ring-1 ring-green-200 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          Xác nhận
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
          {/* Gradient border effect */}
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 group-hover:opacity-100"></div>
          
          <div className="relative">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-600">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-white/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Thao tác nhanh</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-3">
                {/* Thêm phòng mới */}
                <button 
                  onClick={() => setShowAddRoomModal(true)}
                  className="relative flex items-center w-full p-5 overflow-hidden text-left transition-all duration-300 border-2 border-gray-200 group/action rounded-xl hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-indigo-50 to-purple-50 group-hover/action:opacity-100"></div>
                  
                  <div className="relative flex items-center flex-1">
                    <div className="flex items-center justify-center w-12 h-12 mr-4 transition-all duration-300 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 group-hover/action:scale-110 group-hover/action:rotate-6">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 transition-colors group-hover/action:text-indigo-600">
                        Thêm phòng mới
                      </h3>
                      <p className="mt-0.5 text-sm text-gray-600">Tạo phòng họp trong hệ thống</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 transition-all duration-300 group-hover/action:text-indigo-600 group-hover/action:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                {/* Quản lý phòng */}
                <button 
                  onClick={() => setShowRoomsModal(true)}
                  className="relative flex items-center w-full p-5 overflow-hidden text-left transition-all duration-300 border-2 border-gray-200 group/action rounded-xl hover:border-blue-400 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-blue-50 to-cyan-50 group-hover/action:opacity-100"></div>
                  
                  <div className="relative flex items-center flex-1">
                    <div className="flex items-center justify-center w-12 h-12 mr-4 transition-all duration-300 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 group-hover/action:scale-110 group-hover/action:rotate-6">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 transition-colors group-hover/action:text-blue-600">
                        Quản lý phòng
                      </h3>
                      <p className="mt-0.5 text-sm text-gray-600">Xem & quản lý trạng thái phòng</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 transition-all duration-300 group-hover/action:text-blue-600 group-hover/action:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                
                {/* Quản lý booking */}
                <button 
                  onClick={() => setShowBookingsModal(true)}
                  className="relative flex items-center w-full p-5 overflow-hidden text-left transition-all duration-300 border-2 border-gray-200 group/action rounded-xl hover:border-green-400 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-green-50 to-teal-50 group-hover/action:opacity-100"></div>
                  
                  <div className="relative flex items-center flex-1">
                    <div className="flex items-center justify-center w-12 h-12 mr-4 transition-all duration-300 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 group-hover/action:scale-110 group-hover/action:rotate-6">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 transition-colors group-hover/action:text-green-600">
                        Quản lý booking
                      </h3>
                      <p className="mt-0.5 text-sm text-gray-600">Xem & quản lý tất cả booking</p>
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

export default AdminDashboard;

