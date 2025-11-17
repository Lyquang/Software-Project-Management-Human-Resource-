import React, { useState, useEffect } from 'react';
import { getBookings, deleteBooking } from '../../../services/meetingRoomApi';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const itemsPerPage = 5;

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  useEffect(() => {
    filterBookings();
  }, [searchTerm, bookings]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await getBookings();
      setBookings(response.result || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      showToast('Lỗi khi tải danh sách booking', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (!searchTerm) {
      setFilteredBookings(bookings);
      return;
    }

    const filtered = bookings.filter(booking =>
      booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.organizerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBookings(filtered);
  };

  const handleCancelBooking = (booking) => {
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
      await loadBookings();
    } catch (error) {
      console.error('Error canceling booking:', error);
      showToast(error.message || 'Lỗi khi hủy booking', 'error');
    }
  };

  // Hàm parse thời gian từ API
  const parseApiDateTime = (dateTimeString) => {
    if (!dateTimeString) return null;
    
    try {
      // Định dạng: "09:30:00 12/11/2025"
      const [timePart, datePart] = dateTimeString.split(' ');
      const [hours, minutes, seconds] = timePart.split(':');
      const [day, month, year] = datePart.split('/');
      
      return new Date(year, month - 1, day, hours, minutes, seconds);
    } catch (error) {
      console.error('Error parsing date:', dateTimeString, error);
      return null;
    }
  };

  // Hàm format hiển thị thời gian
  const formatDisplayTime = (dateTimeString) => {
    const date = parseApiDateTime(dateTimeString);
    if (!date) return 'N/A';
    
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  // Component Toast
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
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Toast Component */}
      <Toast />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Booking</h1>
        <p className="mt-2 text-gray-600">Quản lý tất cả booking trong hệ thống</p>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col items-start justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tiêu đề, phòng hoặc người đặt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                Tổng: {filteredBookings.length} booking
              </span>
              <button 
                onClick={loadBookings}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 transition-all border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <span className="mr-2">🔄</span> Làm mới
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredBookings.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p className="text-lg">Không tìm thấy booking nào</p>
              {searchTerm && (
                <p className="mt-2 text-sm">
                  Thử tìm kiếm với từ khóa khác hoặc <button 
                    onClick={() => setSearchTerm('')} 
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    xóa bộ lọc
                  </button>
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 text-sm font-medium text-left text-gray-600">Tiêu đề</th>
                      <th className="py-3 text-sm font-medium text-left text-gray-600">Phòng</th>
                      <th className="py-3 text-sm font-medium text-left text-gray-600">Người đặt</th>
                      <th className="py-3 text-sm font-medium text-left text-gray-600">Thời gian bắt đầu</th>
                      <th className="py-3 text-sm font-medium text-left text-gray-600">Thời gian kết thúc</th>
                      <th className="py-3 text-sm font-medium text-left text-gray-600">Người tham dự</th>
                      <th className="py-3 text-sm font-medium text-left text-gray-600">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBookings.map((booking) => (
                      <tr key={booking.id} className="transition-colors border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 font-medium text-gray-800">{booking.title}</td>
                        <td className="py-4 text-sm text-gray-600">{booking.roomName}</td>
                        <td className="py-4 text-sm text-gray-600">{booking.organizerName}</td>
                        <td className="py-4 text-sm text-gray-600">
                          {formatDisplayTime(booking.startTime)}
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {formatDisplayTime(booking.endTime)}
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {booking.attendeeNames?.length || 0} người
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleCancelBooking(booking)}
                              className="flex items-center text-sm font-medium text-red-600 transition-all hover:text-red-800"
                            >
                              <span className="mr-1">❌</span> Hủy
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-6 space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ←
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal hủy booking */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white shadow-2xl rounded-xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Hủy Booking</h2>
              <p className="mt-1 text-sm text-gray-600">
                Bạn đang hủy booking: <strong>"{selectedBooking.title}"</strong>
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Lý do hủy booking <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy booking..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end pt-4 space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedBooking(null);
                    setCancelReason('');
                  }}
                  className="px-4 py-2 text-gray-700 transition-all border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmCancelBooking}
                  className="px-4 py-2 text-white transition-all bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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

export default BookingsManagement;