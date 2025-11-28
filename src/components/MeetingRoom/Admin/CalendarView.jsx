import React, { useState, useEffect } from 'react';
import { getRooms, getBookings } from '../../../services/meetingRoomApi';

const CalendarView = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [selectedDate, selectedRoom, rooms, bookings]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [roomsResponse, bookingsResponse] = await Promise.all([
        getRooms(),
        getBookings()
      ]);
      
      setRooms(roomsResponse.result || []);
      setBookings(bookingsResponse.result || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = rooms;

    // Filter by selected room
    if (selectedRoom) {
      filtered = filtered.filter(room => room.id == selectedRoom);
    }

    // Filter available rooms
    filtered = filtered.filter(room => room.isAvailable);

    setFilteredRooms(filtered);
  };

  // Function to convert date format from API to Date object
  const parseApiDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    
    try {
      // Format: "15:00:00 22/11/2025"
      const [timePart, datePart] = dateTimeStr.split(' ');
      const [hours, minutes, seconds] = timePart.split(':').map(Number);
      const [day, month, year] = datePart.split('/').map(Number);
      
      return new Date(year, month - 1, day, hours, minutes, seconds);
    } catch (error) {
      console.error('Error parsing date:', dateTimeStr, error);
      return null;
    }
  };

  // Function to convert selectedDate to dd/MM/yyyy format for comparison
  const formatDateToCompare = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getRoomBookings = (roomName) => {
    return bookings.filter(booking => {
      if (booking.roomName !== roomName) return false;
      
      const bookingDate = booking.startTime.split(' ')[1]; // Get date part "22/11/2025"
      const selectedDateFormatted = formatDateToCompare(selectedDate);
      
      return bookingDate === selectedDateFormatted;
    });
  };

  const timeSlots = [];
  for (let hour = 8; hour <= 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  const isTimeSlotBooked = (roomName, timeSlot) => {
    const roomBookings = getRoomBookings(roomName);
    
    return roomBookings.some(booking => {
      const bookingStart = parseApiDateTime(booking.startTime);
      const bookingEnd = parseApiDateTime(booking.endTime);
      
      if (!bookingStart || !bookingEnd) return false;

      const [hours, minutes] = timeSlot.split(':').map(Number);
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hours, minutes, 0, 0);
      
      return slotTime >= bookingStart && slotTime < bookingEnd;
    });
  };

  const getBookingForTimeSlot = (roomName, timeSlot) => {
    const roomBookings = getRoomBookings(roomName);
    
    return roomBookings.find(booking => {
      const bookingStart = parseApiDateTime(booking.startTime);
      const bookingEnd = parseApiDateTime(booking.endTime);
      
      if (!bookingStart || !bookingEnd) return false;

      const [hours, minutes] = timeSlot.split(':').map(Number);
      const slotTime = new Date(selectedDate);
      slotTime.setHours(hours, minutes, 0, 0);
      
      return slotTime >= bookingStart && slotTime < bookingEnd;
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Meeting Room Calendar</h1>
        <p className="mt-2 text-gray-600">Track meeting room schedules and status</p>
      </div>

      <div className="mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">View Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Room</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All rooms</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={filterRooms}
                className="flex items-center justify-center w-full px-4 py-2 font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                <span className="mr-2">🔍</span> Check Schedule
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              {selectedRoom ? 'No matching rooms found.' : 'No available rooms for this day.'}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRooms.map(room => (
                <div key={room.id} className="overflow-hidden border border-gray-200 rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{room.name}</h3>
                        <p className="text-sm text-gray-600">{room.location} • {room.capacity} people</p>
                        {room.equipment && (
                          <p className="text-sm text-gray-500 mt-1">🛠️ {room.equipment}</p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        room.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {room.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-800 mb-2">Schedule for {new Date(selectedDate).toLocaleDateString('en-US')}:</h4>
                      <div className="text-sm text-gray-600">
                        {getRoomBookings(room.name).length > 0 
                          ? `${getRoomBookings(room.name).length} bookings today`
                          : 'No bookings'
                        }
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                      {timeSlots.map(time => {
                        const isBooked = isTimeSlotBooked(room.name, time);
                        const booking = isBooked ? getBookingForTimeSlot(room.name, time) : null;
                        
                        return (
                          <div
                            key={time}
                            className={`p-3 rounded-lg border text-center transition-all ${
                              isBooked
                                ? 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100'
                                : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                            }`}
                            title={booking ? `Booked: ${booking.title}` : 'Available'}
                          >
                            <div className="text-sm font-medium">{time}</div>
                            <div className="mt-1 text-xs">
                              {isBooked ? (
                                <div>
                                  <div className="font-medium">Booked</div>
                                  {booking && (
                                    <div className="truncate" title={booking.title}>
                                      {booking.title}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                'Available'
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Display detailed booking information */}
                    {getRoomBookings(room.name).length > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-2">📋 Today's Bookings:</h5>
                        <div className="space-y-2">
                          {getRoomBookings(room.name).map(booking => (
                            <div key={booking.id} className="text-sm text-blue-700">
                              <div className="flex justify-between">
                                <span className="font-medium">{booking.title}</span>
                                <span>{booking.startTime.split(' ')[0]} - {booking.endTime.split(' ')[0]}</span>
                              </div>
                              {booking.organizerName && (
                                <div className="text-xs text-blue-600">
                                  Organizer: {booking.organizerName}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;