import React, { useState, useEffect } from 'react';
import { getMyBookings, deleteBooking } from '../../../services/meetingRoomApi';
import { Calendar, Clock, MapPin, Users, X, AlertCircle, ChevronDown, ChevronUp, Eye } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllPast, setShowAllPast] = useState(false);

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

  // Hàm chuyển đổi định dạng ngày từ API
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

  // Kiểm tra xem booking có đang diễn ra không
  const isBookingInProgress = (booking) => {
    const now = new Date();
    const startTime = parseApiDateTime(booking.startTime);
    const endTime = parseApiDateTime(booking.endTime);
    
    return startTime && endTime && startTime <= now && now <= endTime;
  };

  // Kiểm tra xem booking có thể hủy được không
  const canCancelBooking = (booking) => {
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return false;
    }
    
    return true;
  };

  const loadMyBookings = async () => {
    try {
      setLoading(true);
      const response = await getMyBookings();
      setBookings(response.result || []);
    } catch (error) {
      console.error('Error loading my bookings:', error);
      showToast('Lỗi khi tải danh sách booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (booking) => {
    if (!canCancelBooking(booking)) {
      showToast('Booking này không thể hủy', 'error');
      return;
    }
    
    setSelectedBooking(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!cancelReason.trim()) {
      showToast('Vui lòng nhập lý do hủy', 'error');
      return;
    }

    try {
      await deleteBooking(selectedBooking.id, cancelReason);
      setShowCancelModal(false);
      setSelectedBooking(null);
      setCancelReason('');
      showToast('Hủy booking thành công', 'success');
      loadMyBookings();
    } catch (error) {
      console.error('Error canceling booking:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi hủy booking';
      showToast(errorMessage, 'error');
    }
  };

  // Hàm lấy màu sắc cho trạng thái
  const getStatusColor = (status) => {
    const statusMap = {
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang chờ' },
      'CONFIRMED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã xác nhận' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
      'COMPLETED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã hoàn thành' }
    };
    return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Đã xác nhận' };
  };

  // Hàm kiểm tra trạng thái thời gian thực
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

  // Sắp xếp và phân loại booking
  const upcomingBookings = bookings
    .filter(booking => {
      const status = getRealTimeStatus(booking);
      return status === 'UPCOMING' || status === 'IN_PROGRESS';
    })
    .sort((a, b) => new Date(parseApiDateTime(a.startTime)) - new Date(parseApiDateTime(b.startTime)));

  const pastBookings = bookings
    .filter(booking => {
      const status = getRealTimeStatus(booking);
      return status === 'COMPLETED' || booking.status === 'CANCELLED';
    })
    .sort((a, b) => new Date(parseApiDateTime(b.startTime)) - new Date(parseApiDateTime(a.startTime)));

  // Chỉ lấy 5 booking đầu tiên cho mỗi phần
  const displayedUpcomingBookings = showAllUpcoming ? upcomingBookings : upcomingBookings.slice(0, 5);
  const displayedPastBookings = showAllPast ? pastBookings : pastBookings.slice(0, 5);

  const BookingCard = ({ booking, showActions = false }) => {
    const formatDateTime = (dateString) => {
      const date = parseApiDateTime(dateString);
      if (!date) return { time: 'N/A', fullDate: 'N/A' };

      return {
        time: date.toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        fullDate: date.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    };

    const { time, fullDate } = formatDateTime(booking.startTime);
    const endTime = parseApiDateTime(booking.endTime)?.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }) || 'N/A';

    const realTimeStatus = getRealTimeStatus(booking);
    const statusInfo = getStatusColor(booking.status);
    const canCancel = canCancelBooking(booking);

    const displayStatus = realTimeStatus === 'IN_PROGRESS' 
      ? { bg: 'bg-green-100', text: 'text-green-800', label: 'Đang diễn ra' }
      : realTimeStatus === 'UPCOMING' 
      ? { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sắp diễn ra' }
      : statusInfo;

    return (
      <div className="p-6 transition-all border border-gray-200 rounded-xl hover:shadow-md hover:border-indigo-300 group bg-white">
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
                  <span>{booking.attendeeNames.length} người tham dự</span>
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
                  Hủy booking
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
          <h1 className="text-4xl font-bold text-gray-800">Quản Lý Booking Của Tôi</h1>
          <p className="mt-2 text-gray-600">Xem và quản lý tất cả booking của bạn</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Upcoming Bookings */}
          <div className="overflow-hidden transition-all bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Booking sắp tới & đang diễn ra</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {upcomingBookings.length} booking • Hiển thị {displayedUpcomingBookings.length} / {upcomingBookings.length}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  upcomingBookings.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {upcomingBookings.length} booking
                </span>
              </div>
            </div>
            <div className="p-6">
              {upcomingBookings.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">Không có booking sắp tới</p>
                  <p className="mt-1 text-sm text-gray-400">Tất cả booking của bạn sẽ hiển thị ở đây</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {displayedUpcomingBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} showActions={true} />
                    ))}
                  </div>
                  
                  {/* Nút Xem tất cả / Thu gọn */}
                  {upcomingBookings.length > 5 && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                        className="inline-flex items-center gap-2 px-6 py-3 font-medium text-indigo-600 transition-all bg-indigo-50 rounded-xl hover:bg-indigo-100 hover:shadow-sm"
                      >
                        {showAllUpcoming ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Thu gọn
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Xem tất cả ({upcomingBookings.length} booking)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Past Bookings */}
          <div className="overflow-hidden transition-all bg-white border border-gray-200 shadow-sm rounded-2xl hover:shadow-md">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">Booking đã kết thúc & đã hủy</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {pastBookings.length} booking • Hiển thị {displayedPastBookings.length} / {pastBookings.length}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  pastBookings.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {pastBookings.length} booking
                </span>
              </div>
            </div>
            <div className="p-6">
              {pastBookings.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">Không có booking đã kết thúc</p>
                  <p className="mt-1 text-sm text-gray-400">Các booking cũ sẽ hiển thị ở đây</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {displayedPastBookings.map((booking) => (
                      <BookingCard key={booking.id} booking={booking} showActions={false} />
                    ))}
                  </div>
                  
                  {/* Nút Xem tất cả / Thu gọn */}
                  {pastBookings.length > 5 && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setShowAllPast(!showAllPast)}
                        className="inline-flex items-center gap-2 px-6 py-3 font-medium text-indigo-600 transition-all bg-indigo-50 rounded-xl hover:bg-indigo-100 hover:shadow-sm"
                      >
                        {showAllPast ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Thu gọn
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Xem tất cả ({pastBookings.length} booking)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
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
              <h2 className="text-xl font-semibold text-gray-800">Hủy Booking</h2>
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
              {/* Cảnh báo đặc biệt khi booking đang diễn ra */}
              {isBookingInProgress(selectedBooking) && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 mr-3 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Cảnh báo: Cuộc họp đang diễn ra!</p>
                      <p className="mt-1 text-sm text-red-700">
                        Bạn đang hủy một cuộc họp đang diễn ra. Hành động này có thể ảnh hưởng đến người tham dự.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin booking */}
              <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 mr-3 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Bạn sắp hủy booking:</p>
                    <p className="mt-1 text-sm text-yellow-700">{selectedBooking.title}</p>
                    <p className="text-sm text-yellow-600">{selectedBooking.roomName}</p>
                    <p className="text-sm text-yellow-500">
                      {parseApiDateTime(selectedBooking.startTime)?.toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Lý do hủy booking <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy booking..."
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
                  Quay lại
                </button>
                <button
                  onClick={confirmCancelBooking}
                  className="px-6 py-3 font-medium text-white transition-all bg-red-600 rounded-xl hover:bg-red-700"
                >
                  Xác nhận hủy
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

export default MyBookings;