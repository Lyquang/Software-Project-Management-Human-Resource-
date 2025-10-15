import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  MdEdit, 
  MdAttachMoney, 
  MdTrendingUp, 
  MdCardGiftcard, 
  MdWarning,
  MdFilterList,
  MdRefresh,
  MdSearch,
  MdPeople,
  MdDownload,
  MdVisibility
} from "react-icons/md";
import AdminSalaryModal from "./AdminSalaryModal";
import SalaryDetailModal from "./SalaryDetailModal";
import Loading from "../Loading/Loading";

const AdminSalary = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [searchCode, setSearchCode] = useState("");
  const [viewMode, setViewMode] = useState("search"); 

  const [salaryList, setSalaryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10
  });

  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    totalGrossSalary: 0,
    totalNetSalary: 0,
    totalDeductions: 0,
    averageNetSalary: 0
  });

  const API_URL = "https://ems-efub.onrender.com/ems";

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  // Fetch statistics
  const fetchStatistics = async (month, year) => {
    try {
      const res = await axios.get(
        `${API_URL}/salary/statistics?month=${month}&year=${year}`,
        { headers: getHeaders() }
      );
      setStatistics(res.data);
    } catch (err) {
      console.error("Statistics API Error:", err);
      setError("Error fetching statistics");
    }
  };

  const fetchAllSalaries = async (month, year, page = 0, size = 10) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${API_URL}/salary/all?month=${month}&year=${year}&page=${page}&size=${size}`,
        { headers: getHeaders() }
      );
      
      if (res.data && res.data.result) {
        setSalaryList(res.data.result.content || []);
        setPagination({
          currentPage: res.data.result.pageNumber || 0,
          totalPages: res.data.result.totalPages || 0,
          totalElements: res.data.result.totalElements || 0,
          pageSize: res.data.result.pageSize || 10
        });
        
        if (res.data.result.content.length === 0) {
          setError(`No salary records found for ${month}/${year}`);
        }
      } else {
        setSalaryList([]);
        setError("No data found");
      }
    } catch (err) {
      console.error("All salaries API Error:", err);
      setError(err.response?.data?.message || "Error fetching salary data");
      setSalaryList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSalaryByPersonnelCode = async (personnelCode, page = 0, size = 10) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${API_URL}/salary/personnel/${personnelCode}?month=${filterMonth}&year=${filterYear}&page=${page}&size=${size}`,
        { headers: getHeaders() }
      );
      
      if (res.data && res.data.result) {
        setSalaryList(res.data.result.content || []);
        setPagination({
          currentPage: res.data.result.pageNumber || 0,
          totalPages: res.data.result.totalPages || 0,
          totalElements: res.data.result.totalElements || 0,
          pageSize: res.data.result.pageSize || 10
        });
        
        if (res.data.result.content.length === 0) {
          setError(`No salary record found for employee ${personnelCode} in ${filterMonth}/${filterYear}`);
        }
      } else {
        setSalaryList([]);
        setError("No data found for this employee");
      }
    } catch (err) {
      console.error("Salary by personnel API Error:", err);
      setError(err.response?.data?.message || "Error fetching employee salary data");
      setSalaryList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateSalary = async (id, updateData) => {
    try {
      const res = await axios.put(
        `${API_URL}/salary/${id}`,
        updateData,
        { headers: getHeaders() }
      );
      return res.data;
    } catch (error) {
      console.error("Update salary error:", error);
      throw error;
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/salary/all?month=${filterMonth}&year=${filterYear}&page=0&size=1000`,
        { headers: getHeaders() }
      );
      
      if (response.data && response.data.result) {
        const data = response.data.result.content;
        
        const headers = ["Employee Code", "Employee Name", "Position", "Month", "Year", "Gross Salary", "Net Salary", "Total Deductions"];
        const csvContent = [
          headers.join(","),
          ...data.map(item => [
            item.personnelCode,
            `"${item.personnelName}"`,
            `"${item.salaryDetailResponse?.position || "N/A"}"`,
            item.month,
            item.year,
            item.grossSalary,
            item.netSalary,
            item.totalDeductions
          ].join(","))
        ].join("\n");
        
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `salary-report-${filterMonth}-${filterYear}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Export error:", err);
      setError("Error exporting data");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      setError("Please enter employee code");
      return;
    }
    setViewMode("search");
    fetchSalaryByPersonnelCode(searchCode);
  };

  const handleViewAll = () => {
    setViewMode("all");
    setSearchCode("");
    setError("");
    fetchAllSalaries(filterMonth, filterYear);
  };

  const handleClearSearch = () => {
    setSearchCode("");
    setSalaryList([]);
    setError("");
    setViewMode("search");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (viewMode === "all") {
      await fetchAllSalaries(filterMonth, filterYear, pagination.currentPage);
    } else if (viewMode === "search" && searchCode) {
      await fetchSalaryByPersonnelCode(searchCode, pagination.currentPage);
    } else {
      setSalaryList([]);
      await fetchStatistics(filterMonth, filterYear);
    }
    setRefreshing(false);
  };

  const handlePageChange = (newPage) => {
    if (viewMode === "all") {
      fetchAllSalaries(filterMonth, filterYear, newPage, pagination.pageSize);
    } else if (viewMode === "search" && searchCode) {
      fetchSalaryByPersonnelCode(searchCode, newPage, pagination.pageSize);
    }
  };

  const handleEditModalOpen = (record) => {
    setSelectedRecord(record.salaryDetailResponse || record);
    setShowEditModal(true);
  };

  const handleDetailModalOpen = (record) => {
    setSelectedRecord(record.salaryDetailResponse || record);
    setShowDetailModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedRecord(null);
  };

  const handleSave = async (updatedRecord) => {
    try {
      const result = await updateSalary(updatedRecord.id, updatedRecord);
      
      if (viewMode === "all") {
        await fetchAllSalaries(filterMonth, filterYear, pagination.currentPage);
      } else if (viewMode === "search" && searchCode) {
        await fetchSalaryByPersonnelCode(searchCode, pagination.currentPage);
      }
      
      await fetchStatistics(filterMonth, filterYear);
      
      return result;
    } catch (error) {
      console.error("Save error:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchStatistics(filterMonth, filterYear);
    if (viewMode === "all") {
      fetchAllSalaries(filterMonth, filterYear);
    } else if (viewMode === "search" && searchCode) {
      fetchSalaryByPersonnelCode(searchCode);
    } else {
      setSalaryList([]);
    }
  }, [filterMonth, filterYear]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="p-6 mb-6 bg-white shadow-sm rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              Salary Management
            </h1>
            <p className="mt-1 text-gray-600">
              Manage and review employee salaries
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 mb-6 bg-white shadow-sm rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <MdFilterList className="text-xl text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 mb-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Month
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[...Array(12).keys()].map((m) => (
                <option key={m + 1} value={m + 1}>
                  {new Date(2000, m).toLocaleString('en', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[2023, 2024, 2025].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleViewAll}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
            >
              <MdPeople />
              View All Employees
            </button>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdRefresh className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              <MdDownload />
              Export
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Search Employee
            </label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter personnel code..."
                className="flex-1 px-3 py-2 transition-colors border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <MdSearch className="text-lg" />
              </button>
              {searchCode && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Clear
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <span className="text-sm font-medium text-blue-800">
            Current View: 
          </span>
          <span className="px-2 py-1 text-xs font-bold text-blue-800 bg-blue-100 rounded-md">
            {viewMode === "all" ? "All Employees" : `Search: ${searchCode || "No employee selected"}`}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
          <MdWarning className="flex-shrink-0 text-xl text-red-500" />
          <span className="font-medium text-red-700">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 text-white transition-transform duration-200 transform shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Total Employees</p>
              <p className="mt-1 text-2xl font-bold">
                {statistics.totalEmployees}
              </p>
              <p className="mt-2 text-xs text-blue-200">All employees this month</p>
            </div>
            <div className="p-3 bg-blue-400 rounded-full bg-opacity-20">
              <MdPeople className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="p-6 text-white transition-transform duration-200 transform shadow-lg bg-gradient-to-br from-green-500 to-green-600 rounded-xl hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Total Gross Salary</p>
              <p className="mt-1 text-2xl font-bold">
                ${statistics.totalGrossSalary?.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-green-200">Before deductions</p>
            </div>
            <div className="p-3 bg-green-400 rounded-full bg-opacity-20">
              <MdAttachMoney className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="p-6 text-white transition-transform duration-200 transform shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Total Net Salary</p>
              <p className="mt-1 text-2xl font-bold">
                ${statistics.totalNetSalary?.toLocaleString()}
              </p>
              <p className="mt-2 text-xs text-purple-200">After deductions</p>
            </div>
            <div className="p-3 bg-purple-400 rounded-full bg-opacity-20">
              <MdTrendingUp className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="p-6 text-white transition-transform duration-200 transform shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-100">Average Net Salary</p>
              <p className="mt-1 text-2xl font-bold">
                ${statistics.averageNetSalary?.toFixed(2)}
              </p>
              <p className="mt-2 text-xs text-amber-200">Per employee</p>
            </div>
            <div className="p-3 rounded-full bg-amber-400 bg-opacity-20">
              <MdCardGiftcard className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-white shadow-sm rounded-xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Salary Details
              {viewMode === "search" && searchCode && (
                <span className="ml-2 text-sm font-normal text-green-600">
                  (Employee: {searchCode})
                </span>
              )}
              {viewMode === "all" && (
                <span className="ml-2 text-sm font-normal text-blue-600">
                  (All Employees)
                </span>
              )}
            </h3>
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-800 bg-gray-100 rounded-full">
                {pagination.totalElements} {pagination.totalElements === 1 ? 'record' : 'records'} found
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Employee Code
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Employee Name
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Position
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Period
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Gross Salary
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Deductions
                </th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salaryList.length > 0 ? (
                salaryList.map((record, index) => (
                  <tr 
                    key={record.id || index} 
                    className="transition-colors duration-150 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        {record.personnelCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">
                        {record.personnelName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">
                        {record.salaryDetailResponse?.position || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {record.month}/{record.year}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-green-600">
                        ${record.grossSalary?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-blue-600">
                        ${record.netSalary?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-red-600">
                        ${record.totalDeductions?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDetailModalOpen(record)}
                          className="inline-flex items-center justify-center w-8 h-8 text-white transition-colors duration-200 bg-green-600 rounded-lg hover:bg-green-700"
                          title="View salary details"
                        >
                          <MdVisibility className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleEditModalOpen(record)}
                          className="inline-flex items-center justify-center w-8 h-8 text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
                          title="Edit salary details"
                        >
                          <MdEdit className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <MdAttachMoney className="mb-3 text-4xl opacity-50" />
                      <p className="text-lg font-medium">No salary records found</p>
                      <p className="mt-1 text-sm">
                        {viewMode === "search" 
                          ? `Search for an employee or click "View All Employees" to see records`
                          : `No salary records found for ${filterMonth}/${filterYear}`
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages - 1}
                className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{pagination.currentPage * pagination.pageSize + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalElements)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.totalElements}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 0}
                    className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                        pagination.currentPage === index
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      } border`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdminSalaryModal
        show={showEditModal}
        handleClose={handleModalClose}
        record={selectedRecord}
        handleSave={handleSave}
      />

      <SalaryDetailModal
        show={showDetailModal}
        handleClose={handleModalClose}
        record={selectedRecord}
      />
    </div>
  );
};

export default AdminSalary;