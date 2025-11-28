import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Search, Loader, X, Plus, Minus, User } from 'lucide-react';
import { getRooms, createBooking, getBookings, getMyInfo, getDepartmentEmployees } from '../../../services/meetingRoomApi';

const BookingModal = ({ 
  selectedRoom, 
  onClose, 
  onSubmit, 
  loading, 
  selectedDate, 
  startTime, 
  endTime,
  employees,
  currentUser 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    attendeeCodes: []
  });
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a meeting title');
      return;
    }

    // Convert selectedEmployees to attendeeCodes before submitting
    const attendeeCodes = selectedEmployees.map(emp => emp.code);
    const submitData = {
      ...formData,
      attendeeCodes: attendeeCodes
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmployeeSelect = (employee) => {
    const isAlreadySelected = selectedEmployees.some(emp => emp.code === employee.code);
    
    if (isAlreadySelected) {
      // If already selected, remove from list
      setSelectedEmployees(prev => prev.filter(emp => emp.code !== employee.code));
    } else {
      // If not selected, add to list
      setSelectedEmployees(prev => [...prev, employee]);
    }
  };

  const removeSelectedEmployee = (employeeCode) => {
    setSelectedEmployees(prev => prev.filter(emp => emp.code !== employeeCode));
  };

  // Filter employees by search keyword
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.position && employee.position.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-8 bg-white shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Confirm Room Booking</h2>
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
              {selectedRoom.capacity} people
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(selectedDate).toLocaleDateString('en-US')}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {startTime} - {endTime}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Meeting title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter meeting title..."
              className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of the meeting..."
              rows="3"
              className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Attendees</label>
              <span className="text-sm text-gray-500">
                Selected: {selectedEmployees.length} people
              </span>
            </div>

            {/* Selected employees list */}
            {selectedEmployees.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected employees:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployees.map(employee => (
                    <div
                      key={employee.code}
                      className="flex items-center gap-2 px-3 py-1 bg-white border border-blue-200 rounded-full"
                    >
                      <User className="w-3 h-3 text-blue-500" />
                      <span className="text-sm">{employee.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedEmployee(employee.code)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Employee search */}
            <div className="mb-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, employee code or position..."
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Employee list for selection */}
            <div className="border border-gray-300 rounded-xl overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                {filteredEmployees.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    {employees.length === 0 ? 'No employees in this department' : 'No matching employees found'}
                  </div>
                ) : (
                  filteredEmployees.map(employee => (
                    <div
                      key={employee.code}
                      onClick={() => handleEmployeeSelect(employee)}
                      className={`flex items-center gap-3 p-3 border-b border-gray-200 cursor-pointer transition-colors ${
                        selectedEmployees.some(emp => emp.code === employee.code)
                          ? 'bg-indigo-50 border-indigo-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-4 h-4 border-2 rounded ${
                        selectedEmployees.some(emp => emp.code === employee.code)
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedEmployees.some(emp => emp.code === employee.code) && (
                          <div className="w-2 h-2 bg-white rounded-sm m-auto mt-0.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800 truncate">
                            {employee.name}
                          </span>
                          {employee.code === currentUser?.code && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>Code: {employee.code}</span>
                          <span>Position: {employee.position} || 'Not set'</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Click an employee name to select/unselect them as attendees
            </p>
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
              disabled={loading}
              className="flex-1 px-6 py-3 font-medium text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </div>
              ) : (
                'Confirm booking'
              )}
            </button>
          </div>
        </form>
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
  const [employees, setEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loadingUser, setLoadingUser] = useState(true);

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
  }, [toast.show]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setLoadingUser(true);
      
      // Get user info first to retrieve departmentId
      const myInfoResponse = await getMyInfo();
      if (myInfoResponse && myInfoResponse.code === 200) {
        setCurrentUser(myInfoResponse.result);
        const departmentId = myInfoResponse.result.departmentId;

        // Get employees in the same department
        const employeesResponse = await getDepartmentEmployees(departmentId);
        if (employeesResponse && employeesResponse.code === 200) {
          // Combine employees and manager into one array
          const allEmployees = [
            ...(employeesResponse.result.employees || []),
            employeesResponse.result.manager
          ].filter(Boolean); // Remove null/undefined
          setEmployees(allEmployees);
        }

        // Get rooms and bookings
        const [roomsResponse, bookingsResponse] = await Promise.all([
          getRooms(),
          getBookings()
        ]);
        
        const roomsData = roomsResponse.result || [];
        const bookingsData = bookingsResponse.result || [];
        
        setRooms(roomsData);
        setAllBookings(bookingsData);
        checkAvailability(roomsData, bookingsData);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
      setLoadingUser(false);
    }
  };

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

  const checkAvailability = (roomsData, bookingsData) => {
    try {
      setSearchLoading(true);
      
      if (!selectedDate || !startTime || !endTime) {
        showToast('Please select date, start time and end time', 'error');
        return;
      }

      const startDateTime = new Date(`${selectedDate}T${startTime}`);
      const endDateTime = new Date(`${selectedDate}T${endTime}`);
      
      if (startDateTime >= endDateTime) {
        showToast('End time must be after start time', 'error');
        return;
      }

      const available = roomsData.filter(room => {
        if (!room.working || !room.isAvailable) return false;

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
        showToast('No rooms available in this time range', 'warning');
      } else {
        showToast(`Found ${available.length} available room(s)`, 'success');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      showToast('Error while checking room availability', 'error');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBookRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleSubmitBooking = async (formData) => {
    if (!formData.title.trim()) {
      showToast('Please enter a meeting title', 'error');
      return;
    }

    try {
      setLoading(true);

      if (!currentUser || !currentUser.code) {
        showToast('User info not found. Please sign in again.', 'error');
        return;
      }

      // Automatically add organizer to attendee list if not already there
      const attendeeCodes = [...new Set([
        currentUser.code, 
        ...formData.attendeeCodes
      ])];

      const buildDateTime = (dateStr, timeStr) => {
        const [year, month, day] = dateStr.split('-'); 
        return `${year}-${month}-${day}T${timeStr}:00+07:00`;
      };

      const bookingData = {
        roomId: parseInt(selectedRoom.id, 10),
        title: formData.title,
        description: formData.description || '',
        startTime: buildDateTime(selectedDate, startTime),
        endTime: buildDateTime(selectedDate, endTime),
        attendeeCodes: attendeeCodes
      };

      console.log('Booking data:', bookingData);

      const response = await createBooking(bookingData);
      
      if (response && response.code === 200) {
        showToast('Room booked successfully!', 'success');
        setSelectedRoom(null);
        loadInitialData();
      } else {
        throw new Error(response?.message || 'Error while booking room');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error while booking room. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const RoomCard = ({ room }) => (
    <div className="p-6 transition-all bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-lg hover:border-indigo-300 hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
        <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
          ✅ Available
        </span>
      </div>
      
      <div className="mb-4 space-y-3">
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-3 text-gray-400" />
          <span className="text-sm">{room.location}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Users className="w-4 h-4 mr-3 text-gray-400" />
          <span className="text-sm">Capacity: {room.capacity} people</span>
        </div>
        {room.equipment && room.equipment !== 'string' && (
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
        Book this room
      </button>
    </div>
  );

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Book Meeting Room</h1>
          <p className="mt-2 text-gray-600">Find and book a meeting room that suits your needs</p>
        </div>

        <div className="p-8 mb-8 transition-all bg-white border border-gray-100 shadow-lg rounded-3xl hover:shadow-xl">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">🕐 Choose time</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700">Start time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-3 text-sm font-medium text-gray-700">End time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 transition-all border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => checkAvailability(rooms, allBookings)}
                disabled={searchLoading}
                className="flex items-center justify-center w-full px-6 py-3 font-medium text-white transition-all bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50"
              >
                {searchLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search rooms
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="transition-all bg-white border border-gray-100 shadow-lg rounded-3xl hover:shadow-xl">
          <div className="p-8 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                🏢 Available rooms 
                <span className="ml-3 text-green-600">({availableRooms.length})</span>
              </h2>
              <div className="text-sm text-gray-600">
                {selectedDate && (
                  <span>Date: {new Date(selectedDate).toLocaleDateString('en-US')}</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            {loading && availableRooms.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader className="w-12 h-12 mx-auto mb-4 text-indigo-600 animate-spin" />
                  <p className="text-gray-600">Loading rooms list...</p>
                </div>
              </div>
            ) : availableRooms.length === 0 ? (
              <div className="py-16 text-center">
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full">
                  <span className="text-4xl">😔</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">No available rooms</h3>
                <p className="mb-6 text-gray-600">Try another time range or date</p>
                <button
                  onClick={() => {
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                    setStartTime('09:00');
                    setEndTime('10:00');
                  }}
                  className="px-6 py-3 font-medium text-indigo-600 transition-all bg-indigo-50 rounded-xl hover:bg-indigo-100"
                >
                  Reset time
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
            employees={employees}
            currentUser={currentUser}
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

export default BookRoom;