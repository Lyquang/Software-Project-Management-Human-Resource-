import React, { useEffect } from "react";
import { Search, Calendar, UserCheck } from "lucide-react";
import { formatToLocalTime, getStatusFromRecord, getDurationColor } from "../../../utils/helpers";

const EmployeeTab = ({
  searchMode,
  setSearchMode,
  localEmployeeCode,
  setLocalEmployeeCode,
  localStartDate,
  setLocalStartDate,
  localEndDate,
  setLocalEndDate,
  localMonth,
  setLocalMonth,
  localYear,
  setLocalYear,
  searchError,
  setSearchError,
  hasSearched,
  setHasSearched,
  employeeAttendance,
  setEmployeeAttendance,
  fetchEmployeeAttendance,
  loading,
  setError
}) => {
  useEffect(() => {
    if (searchMode === "EMPLOYEE_RANGE" && !localStartDate && !localEndDate) {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setLocalStartDate(firstDay.toISOString().split('T')[0]);
      setLocalEndDate(today.toISOString().split('T')[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchMode, localStartDate, localEndDate]);

  const handleSearch = async () => {
    setSearchError("");
    setError("");
    setHasSearched(true);

    if (searchMode.includes("EMPLOYEE") && !localEmployeeCode.trim()) {
      setSearchError("Employee Code is required");
      return;
    }

    if (searchMode === "EMPLOYEE_RANGE") {
      if (!localStartDate || !localEndDate) {
        setSearchError("Both Start Date and End Date are required for date range search");
        return;
      }
      if (new Date(localStartDate) > new Date(localEndDate)) {
        setSearchError("Start date cannot be after end date");
        return;
      }
    }

    const searchParams = {
      searchType: searchMode,
      employeeCode: localEmployeeCode,
      month: localMonth,
      year: localYear,
      startDate: localStartDate,
      endDate: localEndDate
    };

    console.log("Searching with params:", searchParams);
    await fetchEmployeeAttendance(searchParams);
  };

  const handleReset = () => {
    setLocalEmployeeCode("");
    setLocalStartDate("");
    setLocalEndDate("");
    setLocalMonth(new Date().getMonth() + 1);
    setLocalYear(new Date().getFullYear());
    setEmployeeAttendance([]);
    setSearchError("");
    setError("");
    setHasSearched(false);
  };

  const handleMonthChange = (newMonth) => {
    console.log("Changing month from", localMonth, "to", newMonth);
    setLocalMonth(newMonth);
  };

  const handleYearChange = (newYear) => {
    console.log("Changing year from", localYear, "to", newYear);
    setLocalYear(newYear);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Search Type</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            onClick={() => setSearchMode("MONTH_ALL")}
            className={`p-4 border-2 rounded-lg text-center transition ${
              searchMode === "MONTH_ALL" 
                ? "border-blue-500 bg-blue-50 text-blue-700" 
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <Calendar className="mx-auto mb-2" size={24} />
            <div className="font-medium">All Employees by Month</div>
            <div className="text-sm text-gray-500">View all employees for a specific month</div>
          </button>

          <button
            onClick={() => setSearchMode("EMPLOYEE_ALL")}
            className={`p-4 border-2 rounded-lg text-center transition ${
              searchMode === "EMPLOYEE_ALL" 
                ? "border-green-500 bg-green-50 text-green-700" 
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <UserCheck className="mx-auto mb-2" size={24} />
            <div className="font-medium">Single Employee (All Time)</div>
            <div className="text-sm text-gray-500">View all records for a specific employee</div>
          </button>

          <button
            onClick={() => setSearchMode("EMPLOYEE_RANGE")}
            className={`p-4 border-2 rounded-lg text-center transition ${
              searchMode === "EMPLOYEE_RANGE" 
                ? "border-purple-500 bg-purple-50 text-purple-700" 
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            <Search className="mx-auto mb-2" size={24} />
            <div className="font-medium">Single Employee by Date Range</div>
            <div className="text-sm text-gray-500">View records for specific dates</div>
          </button>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Search Criteria</h3>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {(searchMode === "EMPLOYEE_ALL" || searchMode === "EMPLOYEE_RANGE") && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Employee Code <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={localEmployeeCode} 
                onChange={(e) => setLocalEmployeeCode(e.target.value.toUpperCase())} 
                placeholder="e.g. BT23092588" 
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {searchMode === "MONTH_ALL" && (
            <>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Month</label>
                <select 
                  value={localMonth} 
                  onChange={(e) => {
                    const newMonth = parseInt(e.target.value);
                    console.log("Month select changed to:", newMonth);
                    handleMonthChange(newMonth);
                  }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[
                    { value: 1, label: "January" },
                    { value: 2, label: "February" },
                    { value: 3, label: "March" },
                    { value: 4, label: "April" },
                    { value: 5, label: "May" },
                    { value: 6, label: "June" },
                    { value: 7, label: "July" },
                    { value: 8, label: "August" },
                    { value: 9, label: "September" },
                    { value: 10, label: "October" },
                    { value: 11, label: "November" },
                    { value: 12, label: "December" },
                  ].map((monthOption) => (
                    <option key={monthOption.value} value={monthOption.value}>
                      {monthOption.label}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-xs text-gray-500">Current selection: {localMonth}</div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Year</label>
                <input 
                  type="number" 
                  value={localYear} 
                  onChange={(e) => {
                    const newYear = parseInt(e.target.value);
                    console.log("Year input changed to:", newYear);
                    handleYearChange(newYear);
                  }} 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  min="2000" 
                  max="2100"
                />
                <div className="mt-1 text-xs text-gray-500">Current selection: {localYear}</div>
              </div>
            </>
          )}

          {searchMode === "EMPLOYEE_RANGE" && (
            <>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Start Date</label>
                <input 
                  type="date" 
                  value={localStartDate} 
                  onChange={(e) => setLocalStartDate(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">End Date</label>
                <input 
                  type="date" 
                  value={localEndDate} 
                  onChange={(e) => setLocalEndDate(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            onClick={handleSearch} 
            className="flex items-center gap-2 px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Search size={16} />
            Search Records
          </button>
          <button 
            onClick={handleReset} 
            className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset
          </button>
        </div>

        {searchError && (
          <div className="p-3 mt-4 text-red-700 bg-red-100 border border-red-400 rounded">{searchError}</div>
        )}
      </div>

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Attendance Records 
              {employeeAttendance.length > 0 && ` (${employeeAttendance.length} records found)`}
            </h3>
            {employeeAttendance.length > 0 && (
              <div className="text-sm text-gray-500">
                {searchMode === "MONTH_ALL" && `Showing data for ${localMonth}/${localYear}`}
                {searchMode === "EMPLOYEE_ALL" && `Showing all records for ${localEmployeeCode}`}
                {searchMode === "EMPLOYEE_RANGE" && `Showing records for ${localEmployeeCode} from ${localStartDate} to ${localEndDate}`}
              </div>
            )}
          </div>
        </div>

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
              {employeeAttendance.map((record, idx) => {
                const status = getStatusFromRecord(record);
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{record.record_id || `REC-${idx + 1}`}</td>
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

        {!loading && hasSearched && employeeAttendance.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <Search className="mx-auto mb-4 text-gray-300" size={48} />
            <div className="text-lg font-medium">No records found</div>
            <div className="text-sm">Try adjusting your search criteria</div>
          </div>
        )}

        {!hasSearched && (
          <div className="py-12 text-center text-gray-500">
            <div className="text-lg font-medium">Enter search criteria to find records</div>
            <div className="text-sm">Select a search type and fill in the required fields</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeTab;