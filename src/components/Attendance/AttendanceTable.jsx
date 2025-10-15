// src/components/EmployeeAttendance/AttendanceTable.jsx
import React from 'react';
import PropTypes from 'prop-types';

// Ánh xạ trạng thái với các class Tailwind để tạo badge
const statusStyles = {
  'Work from office': 'bg-blue-100 text-blue-700',
  'Absent': 'bg-red-100 text-red-700',
  'Late arrival': 'bg-yellow-100 text-yellow-700',
  'Work from home': 'bg-gray-100 text-gray-700',
  'Present': 'bg-green-100 text-green-700',
};

const AttendanceTable = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
      <h2 className="text-xl font-bold mb-4">Attendance Overview</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Date', 'Day', 'Check-in', 'Check-out', 'Work hours', 'Status', 'Not enough hour'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.day}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${row.status === 'Late arrival' ? 'text-yellow-600' : 'text-blue-600'}`}>
                  {row.checkIn}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">{row.checkOut || '-----'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{row.workHours}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[row.status] || 'bg-gray-100 text-gray-800'}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.notes === 'Not enough hour' && (
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
                      Create Request
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

AttendanceTable.propTypes = {
  data: PropTypes.array.isRequired,
};

export default AttendanceTable;