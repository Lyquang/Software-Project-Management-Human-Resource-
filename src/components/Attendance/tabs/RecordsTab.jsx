import React from "react";
import { formatToLocalTime } from "../../../utils/helpers";

const RecordsTab = ({ 
  startDate, 
  endDate, 
  setStartDate, 
  setEndDate, 
  fetchRecords, 
  recordsData, 
  loading 
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="grid items-end gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded" 
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded" 
            />
          </div>
          <button 
            onClick={fetchRecords} 
            disabled={!startDate || !endDate}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Fetch Records
          </button>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Record ID</th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Employee Code</th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Check In</th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Check Out</th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recordsData.map((record, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{record.record_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.employee_code}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatToLocalTime(record.checkIn) || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{formatToLocalTime(record.checkOut) || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{record.duration || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recordsData.length === 0 && !loading && (
          <div className="py-8 text-center text-gray-500">
            No records found. Please select a date range.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordsTab;