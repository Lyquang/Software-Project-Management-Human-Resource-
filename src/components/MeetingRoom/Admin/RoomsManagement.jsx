import React, { useState, useEffect } from 'react';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../../../services/meetingRoomApi';

const RoomsManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    capacity: '',
    location: '',
    equipment: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    name: '',
    location: '',
    capacity: 1,
    equipment: ''
  });
  const [toast, setToast] = useState({ 
    show: false, 
    message: '', 
    type: 'success' // 'success' | 'error'
  });

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [filters, rooms]);

  // Auto hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await getRooms();
      setRooms(response.result || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
      showToast('Error loading room list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let result = rooms;

    if (filters.status) {
      result = result.filter(room => 
        filters.status === 'available' ? room.isAvailable : !room.isAvailable
      );
    }

    if (filters.capacity) {
      const [min, max] = filters.capacity.split('-').map(Number);
      if (max) {
        result = result.filter(room => room.capacity >= min && room.capacity <= max);
      } else {
        result = result.filter(room => room.capacity >= min);
      }
    }

    if (filters.location) {
      result = result.filter(room => 
        room.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.equipment) {
      result = result.filter(room => 
        room.equipment.toLowerCase().includes(filters.equipment.toLowerCase())
      );
    }

    setFilteredRooms(result);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      capacity: '',
      location: '',
      equipment: ''
    });
  };

  const handleAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({
      name: '',
      location: '',
      capacity: 1,
      equipment: ''
    });
    setShowRoomModal(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name,
      location: room.location,
      capacity: room.capacity,
      equipment: room.equipment
    });
    setShowRoomModal(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoom(roomId);
        await loadRooms();
        showToast('Room deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting room:', error);
        showToast('Error deleting room', 'error');
      }
    }
  };

  const handleSubmitRoom = async () => {
    // Validate form
    if (!roomForm.name.trim()) {
      showToast('Please enter room name', 'error');
      return;
    }
    if (!roomForm.location.trim()) {
      showToast('Please enter room location', 'error');
      return;
    }
    if (roomForm.capacity < 1) {
      showToast('Capacity must be greater than 0', 'error');
      return;
    }

    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, roomForm);
        showToast('Room updated successfully', 'success');
      } else {
        await createRoom(roomForm);
        showToast('New room added successfully', 'success');
      }
      setShowRoomModal(false);
      await loadRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      showToast(
        editingRoom ? 'Error updating room' : 'Error adding new room', 
        'error'
      );
    }
  };

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

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Meeting Room Management</h1>
          <p className="mt-2 text-gray-600">Manage and track all meeting rooms in the system</p>
        </div>
        <button 
          onClick={handleAddRoom}
          className="flex items-center px-6 py-3 font-medium text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700 hover:shadow-lg"
        >
          <span className="mr-2">+</span> Add New Room
        </button>
      </div>

      <div className="mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Meeting Room List</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 text-gray-700 transition-all border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-sm"
              >
                <span className="mr-2">🔍</span> Filter
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Capacity</label>
                <select
                  value={filters.capacity}
                  onChange={(e) => handleFilterChange('capacity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All</option>
                  <option value="1-5">1-5 people</option>
                  <option value="6-10">6-10 people</option>
                  <option value="11-20">11-20 people</option>
                  <option value="20-1000">Over 20 people</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Enter location..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Equipment</label>
                <input
                  type="text"
                  value={filters.equipment}
                  onChange={(e) => handleFilterChange('equipment', e.target.value)}
                  placeholder="Enter equipment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 text-sm font-medium text-left text-gray-600">Room Name</th>
                  <th className="py-3 text-sm font-medium text-left text-gray-600">Capacity</th>
                  <th className="py-3 text-sm font-medium text-left text-gray-600">Location</th>
                  <th className="py-3 text-sm font-medium text-left text-gray-600">Equipment</th>
                  <th className="py-3 text-sm font-medium text-left text-gray-600">Status</th>
                  <th className="py-3 text-sm font-medium text-left text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No matching rooms found
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => (
                    <tr key={room.id} className="transition-colors border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 font-medium text-gray-800">{room.name}</td>
                      <td className="py-4 text-sm text-gray-600">{room.capacity} people</td>
                      <td className="py-4 text-sm text-gray-600">{room.location}</td>
                      <td className="py-4 text-sm text-gray-600">{room.equipment || 'None'}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {room.isAvailable ? '🟢 Available' : '🔴 Unavailable'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditRoom(room)}
                            className="p-2 text-indigo-600 transition-all rounded-lg hover:bg-indigo-50 hover:text-indigo-800"
                            title="Edit"
                          >
                            <span className="text-lg">✏️</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteRoom(room.id)}
                            className="p-2 text-red-600 transition-all rounded-lg hover:bg-red-50 hover:text-red-800"
                            title="Delete"
                          >
                            <span className="text-lg">🗑️</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showRoomModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white shadow-2xl rounded-xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Room Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm(prev => ({...prev, name: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter room name"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roomForm.location}
                  onChange={(e) => setRoomForm(prev => ({...prev, location: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm(prev => ({...prev, capacity: parseInt(e.target.value) || 1}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Equipment</label>
                <input
                  type="text"
                  value={roomForm.equipment}
                  onChange={(e) => setRoomForm(prev => ({...prev, equipment: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter equipment (separate with commas)"
                />
              </div>
              <div className="flex justify-end pt-4 space-x-3">
                <button
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 text-gray-700 transition-all border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRoom}
                  className="px-4 py-2 text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  {editingRoom ? 'Update' : 'Add New'}
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

export default RoomsManagement;