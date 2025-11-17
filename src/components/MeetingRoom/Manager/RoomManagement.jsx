import React, { useState, useEffect } from 'react';
import { getRooms } from '../../../services/meetingRoomApi';

const RoomManagement = () => {
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

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, rooms]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const response = await getRooms();
      setRooms(response.result || []);
    } catch (error) {
      console.error('Error loading rooms:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Phòng họp</h1>
          <p className="mt-2 text-gray-600">Theo dõi tình trạng các phòng họp</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <span className="mr-2">🔍</span> Lọc
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      <div className="mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Danh sách phòng họp</h2>
            <span className="text-sm text-gray-600">{filteredRooms.length} phòng</span>
          </div>
        </div>

        {showFilters && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Tất cả</option>
                  <option value="available">Có sẵn</option>
                  <option value="unavailable">Không khả dụng</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Sức chứa</label>
                <select
                  value={filters.capacity}
                  onChange={(e) => handleFilterChange('capacity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Tất cả</option>
                  <option value="1-5">1-5 người</option>
                  <option value="6-10">6-10 người</option>
                  <option value="11-20">11-20 người</option>
                  <option value="20+">Trên 20 người</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Vị trí</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Nhập vị trí..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Thiết bị</label>
                <input
                  type="text"
                  value={filters.equipment}
                  onChange={(e) => handleFilterChange('equipment', e.target.value)}
                  placeholder="Nhập thiết bị..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <div key={room.id} className="p-6 transition-all border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md">
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{room.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center">
                    <span className="mr-2">📍</span>
                    {room.location}
                  </p>
                  <p className="flex items-center">
                    <span className="mr-2">👥</span>
                    {room.capacity} người
                  </p>
                  <p className="flex items-center">
                    <span className="mr-2">🛠️</span>
                    {room.equipment}
                  </p>
                </div>
                <div className="mt-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    room.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {room.isAvailable ? 'Có sẵn' : 'Không khả dụng'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;