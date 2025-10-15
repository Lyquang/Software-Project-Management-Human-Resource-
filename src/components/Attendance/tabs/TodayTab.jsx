import React from "react";
import { formatToLocalTime, getStatusFromRecord, getDurationColor } from "../../../utils/helpers";

const TodayTab = ({ todayData, statusFilter, setStatusFilter }) => {
  const filteredData = statusFilter === "ALL"
    ? todayData
    : todayData.filter(r => {
        const status = getStatusFromRecord(r);
        return status === statusFilter;
      });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
        <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 pr-6 py-2 border border-gray-300 rounded w-40"
        >
          <option value="ALL">All</option>
          <option value="PRESENT">Present</option>
          <option value="COMPLETED">Completed</option>
          <option value="ABSENT">Absent</option>
        </select>
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
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((record, idx) => {
                const status = getStatusFromRecord(record);
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{record.record_id || "-"}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.employee_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatToLocalTime(record.checkIn) || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatToLocalTime(record.checkOut) || "-"}</td>
                    <td className={`px-6 py-4 text-sm font-medium ${getDurationColor(record.duration)}`}>
                      {record.duration || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        status === "COMPLETED" ? "bg-green-100 text-green-800" :
                        status === "PRESENT" ? "bg-blue-100 text-blue-800" : 
                        "bg-red-100 text-red-800"
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && <div className="py-8 text-center text-gray-500">No records found</div>}
      </div>
    </div>
  );
};

export default TodayTab;