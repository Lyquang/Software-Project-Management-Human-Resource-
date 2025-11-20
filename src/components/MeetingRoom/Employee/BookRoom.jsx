import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Search, Loader, X } from 'lucide-react';
import { getRooms, createBooking, getBookings } from '../../../services/meetingRoomApi';

const BookingModal = ({ selectedRoom, onClose, onSubmit, loading, selectedDate, startTime, endTime }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    participants: selectedRoom?.capacity > 1 ? 2 : 1
  });

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Xác nhận đặt phòng</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 transition-colors rounded-full hover:bg-gray-100 hover:text-gray-700"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 mb-6 bg-gray-50 rounded-xl">
          <h3 className="font-semibold text-gray-800">{selectedRoom.name}</h3>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {selectedRoom.location}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              {selectedRoom.capacity} người
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(selectedDate).toLocaleDateString('vi-VN')}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {startTime} - {endTime}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Tiêu đề cuộc họp <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Nhập tiêu đề cuộc họp..."
              className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Mô tả chi tiết về cuộc họp..."
              rows="3"
              className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 font-medium text-gray-700 transition-all bg-gray-100 rounded-xl hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 font-medium text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Đang xử lý...
                </div>
              ) : (
                'Xác nhận đặt'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [allBookings, setAllBookings] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, toast.show]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [roomsResponse, bookingsResponse] = await Promise.all([
        getRooms(),
        getBookings()
      ]);
      
      setRooms(roomsResponse.result || []);
      setAllBookings(bookingsResponse.result || []);
      checkAvailability(roomsResponse.result || [], bookingsResponse.result || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      showToast('Lỗi khi tải dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };

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

  const checkAvailability = async (roomsData = rooms, bookingsData = allBookings) => {
    try {
      setSearchLoading(true);
      
      if (!selectedDate || !startTime || !endTime) {
        showToast('Vui lòng chọn đầy đủ thời gian', 'error');
        return;
      }

      const startDateTime = new Date(`${selectedDate}T${startTime}`);
      const endDateTime = new Date(`${selectedDate}T${endTime}`);
      
      if (startDateTime >= endDateTime) {
        showToast('Thời gian kết thúc phải sau thời gian bắt đầu', 'error');
        return;
      }

      const available = roomsData.filter(room => {
        if (!room.isAvailable) return false;

        const hasConflict = bookingsData.some(booking => {
          if (booking.roomName !== room.name) return false;
          
          const bookingStart = parseApiDateTime(booking.startTime);
          const bookingEnd = parseApiDateTime(booking.endTime);
          
          if (!bookingStart || !bookingEnd) return false;

          return (startDateTime < bookingEnd && endDateTime > bookingStart);
        });

        return !hasConflict;
      });

      setAvailableRooms(available);
      
      if (available.length === 0) {
        showToast('Không có phòng trống trong khoảng thời gian này', 'warning');
      } 
    } catch (error) {
      console.error('Error checking availability:', error);
      showToast('Lỗi khi kiểm tra phòng trống', 'error');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleSubmitBooking = async (formData) => {
    if (!formData.title.trim()) {
      showToast('Vui lòng nhập tiêu đề cuộc họp', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');

      if (!token) return;

      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const userInfo = JSON.parse(payloadJson);

      const organizerCode = userInfo.code;
      
      const bookingData = {
        roomId: selectedRoom.id,
        title: formData.title,
        description: formData.description,
        startTime: `${selectedDate}T${startTime}:00+07:00`,
        endTime: `${selectedDate}T${endTime}:00+07:00`,
        attendeeCodes: [organizerCode] 
      };

      console.log('Booking data:', bookingData); // Debug

      const response = await createBooking(bookingData);
      
      if (response && response.code === 200) {
        showToast('Đặt phòng thành công!', 'success');
        setSelectedRoom(null);
        loadInitialData();
      } else {
        throw new Error(response?.message || 'Lỗi khi đặt phòng');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      showToast(error.message || 'Lỗi khi đặt phòng. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const RoomCard = ({ room }) => (
    <div className="p-6 transition-all bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-lg hover:border-indigo-300 hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
        <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
          ✅ Có sẵn
        </span>
      </div>
      
      <div className="mb-4 space-y-3">
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-3 text-gray-400" />
          <span className="text-sm">{room.location}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Users className="w-4 h-4 mr-3 text-gray-400" />
          <span className="text-sm">Sức chứa: {room.capacity} người</span>
        </div>
        {room.equipment && (
          <div className="flex items-start text-gray-600">
            <span className="mr-3 text-sm">🛠️</span>
            <span className="text-sm">{room.equipment}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => handleBookRoom(room)}
        className="w-full py-3 font-medium text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700 hover:shadow-md"
      >
        Đặt phòng này
      </button>
    </div>
  );

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br via-white to-purple-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Đặt Phòng Họp</h1>
          <p className="mt-2 text-gray-600">Tìm và đặt phòng họp phù hợp với nhu cầu của bạn</p>
        </div>

        <div className="p-8 mb-8 transition-all bg-white border border-gray-100 shadow-lg rounded-3xl hover:shadow-xl">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">🕐 Chọn thời gian</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700">Ngày</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700">Giờ bắt đầu</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700">Giờ kết thúc</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => checkAvailability()}
                disabled={searchLoading}
                className="flex items-center justify-center w-full px-6 py-3 font-medium text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50"
              >
                {searchLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Tìm phòng
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="transition-all bg-white border border-gray-100 shadow-lg rounded-3xl hover:shadow-xl">
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                🏢 Phòng có sẵn 
                <span className="ml-3 text-green-600">({availableRooms.length})</span>
              </h2>
              <div className="text-sm text-gray-600">
                {selectedDate && (
                  <span>Ngày: {new Date(selectedDate).toLocaleDateString('vi-VN')}</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="w-12 h-12 mx-auto mb-4 text-indigo-600 animate-spin" />
                  <p className="text-gray-600">Đang tải danh sách phòng...</p>
                </div>
              </div>
            ) : availableRooms.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full">
                  <span className="text-4xl">😔</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">Không có phòng trống</h3>
                <p className="mb-6 text-gray-600">Hãy thử chọn khoảng thời gian khác hoặc ngày khác</p>
                <button
                  onClick={() => {
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                    setStartTime('09:00');
                    setEndTime('10:00');
                  }}
                  className="px-6 py-3 font-medium text-indigo-600 transition-all bg-indigo-50 rounded-xl hover:bg-indigo-100"
                >
                  Đặt lại thời gian
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {availableRooms.map(room => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedRoom && (
          <BookingModal
            selectedRoom={selectedRoom}
            onClose={() => setSelectedRoom(null)}
            onSubmit={handleSubmitBooking}
            loading={loading}
            selectedDate={selectedDate}
            startTime={startTime}
            endTime={endTime}
          />
        )}

        {toast.show && (
          <div className="fixed z-50 transform -translate-x-1/2 top-8 left-1/2">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm border transition-all ${
              toast.type === 'success' 
                ? 'bg-white/95 border-green-200 text-gray-800' 
                : toast.type === 'warning'
                ? 'bg-white/95 border-yellow-200 text-gray-800'
                : 'bg-white/95 border-red-200 text-gray-800'
            } animate-toast-in`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                toast.type === 'success' ? 'bg-green-100' : 
                toast.type === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={`text-lg ${
                  toast.type === 'success' ? 'text-green-600' : 
                  toast.type === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {toast.type === 'success' ? '✓' : toast.type === 'warning' ? '⚠' : '✕'}
                </span>
              </div>
              <p className="font-medium">{toast.message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookRoom;