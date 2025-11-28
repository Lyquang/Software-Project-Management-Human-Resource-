import React, { useState } from 'react';
import { updateBooking, deleteBooking } from '../../../services/meetingRoomApi';

const BookingDetailModal = ({ booking, onClose, onUpdateBooking }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: booking?.title || '',
    description: booking?.description || '',
    startTime: booking?.startTime ? new Date(booking.startTime).toISOString().slice(0, 16) : '',
    endTime: booking?.endTime ? new Date(booking.endTime).toISOString().slice(0, 16) : '',
    attendeeCodes: booking?.attendeeCodes || []
  });
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!booking) return null;

  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  const createdAt = new Date(booking.createdAt);

  const handleUpdate = async () => {
    try {
      const updatedBooking = await updateBooking(booking.id, {
        ...editForm,
        roomId: booking.roomId,
        organizerCode: booking.organizerCode
      });
      setIsEditing(false);
      onUpdateBooking(updatedBooking);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking');
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert('Please enter reason for cancellation');
      return;
    }

    try {
      await deleteBooking(booking.id, cancelReason);
      setShowCancelModal(false);
      onClose();
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Error when canceling booking');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Edit Booking' : 'Booking Details'}
            </h2>
            <button
              onClick={onClose}
              className="text-2xl text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Tiêu đề</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({...prev, title: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({...prev, description: e.target.value}))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Start time</label>
                  <input
                    type="datetime-local"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm(prev => ({...prev, startTime: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">End time</label>
                  <input
                    type="datetime-local"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm(prev => ({...prev, endTime: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-800">General information</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">Title</label>
                    <p className="text-gray-800">{booking.title}</p>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">Description</label>
                    <p className="text-gray-800">{booking.description}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-800">Room information</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">Room</label>
                    <p className="text-gray-800">{booking.roomName}</p>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">Time</label>
                    <p className="text-gray-800">
                      {startTime.toLocaleDateString('vi-VN')} {startTime.toLocaleTimeString('vi-VN')} - {endTime.toLocaleTimeString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-800">Booker information</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">Booked by</label>
                    <p className="text-gray-800">{booking.organizerName}</p>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-600">Booking time</label>
                    <p className="text-gray-800">
                      {createdAt.toLocaleDateString('vi-VN')} {createdAt.toLocaleTimeString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-800">Attendees</h3>
                <div className="p-4 rounded-lg bg-gray-50">
                  <div className="flex flex-wrap gap-2">
                    {booking.attendeeNames.map((attendee, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-full"
                      >
                        👤 {attendee}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-end space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-6 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Save changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-6 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Cancel Booking
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white shadow-2xl rounded-xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Confirm cancellation of Booking</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Reason for cancellation
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end pt-4 space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Confirm cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailModal;