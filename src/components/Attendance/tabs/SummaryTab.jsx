import React from "react";

const SummaryTab = ({ 
  summaryData, 
  month, 
  year, 
  setMonth, 
  setYear, 
  fetchSummary, 
  loading 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4 p-4 bg-white rounded-lg shadow">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Month</label>
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="px-3 py-2 border border-gray-300 rounded">
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Year</label>
          <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-24 px-3 py-2 border border-gray-300 rounded" />
        </div>
        <button onClick={fetchSummary} className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Apply</button>
      </div>

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Employees Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Employee Code</th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Employee Name</th>
                <th className="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase">Present Days</th>
                <th className="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase">Late Days</th>
                <th className="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase">Absent Days</th>
                <th className="px-6 py-3 text-xs font-medium text-center text-gray-500 uppercase">Avg Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {summaryData.map((employee, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{employee.name}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                      {employee.presentDays}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="px-3 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                      {employee.lateDays}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                      {employee.absentDays}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-center text-gray-900">
                    {typeof employee.avgHours === 'number' ? employee.avgHours.toFixed(2) + 'h' : '0h'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {summaryData.length === 0 && !loading && (
          <div className="py-8 text-center text-gray-500">No summary data available</div>
        )}
      </div>
    </div>
  );
};

export default SummaryTab;