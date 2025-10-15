import React, { useState, useEffect } from "react";
import DashboardTab from "./tabs/DashboardTab";
import TodayTab from "./tabs/TodayTab";
import EmployeeTab from "./tabs/EmployeeTab";
import RecordsTab from "./tabs/RecordsTab";
import SummaryTab from "./tabs/SummaryTab";

const AttendanceAdmin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dashboardData, setDashboardData] = useState(null);
  const [todayData, setTodayData] = useState([]);
  const [employeeAttendance, setEmployeeAttendance] = useState([]);
  const [summaryData, setSummaryData] = useState([]);
  const [recordsData, setRecordsData] = useState([]);
  const [overviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [searchMode, setSearchMode] = useState("MONTH_ALL");
  const [localEmployeeCode, setLocalEmployeeCode] = useState("");
  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");
  const [localMonth, setLocalMonth] = useState(() => new Date().getMonth() + 1);
  const [localYear, setLocalYear] = useState(() => new Date().getFullYear());
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const API_URL = "https://ems-efub.onrender.com/ems";

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/attendance/summary?month=${month}&year=${year}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if ((data.code === 200 || data.code === 0) && data.result) {
        const summary = data.result;
        let totalPresentDays = 0;
        let totalLateDays = 0;
        let totalAbsentDays = 0;
        let totalAvgHours = 0;
        let employeeCount = 0;

        summary.forEach(emp => {
          totalPresentDays += emp.presentDays || 0;
          totalLateDays += emp.lateDays || 0;
          totalAbsentDays += emp.absentDays || 0;
          totalAvgHours += emp.avgHours || 0;
          employeeCount++;
        });

        const avgHours = employeeCount > 0 ? totalAvgHours / employeeCount : 0;
        const daysInMonth = new Date(year, month, 0).getDate();
        
        const dashboardData = {
          totalDays: daysInMonth,
          presentDays: totalPresentDays,
          lateDays: totalLateDays,
          absentDays: totalAbsentDays,
          averageHours: avgHours,
          employeeCount: employeeCount
        };

        setDashboardData(dashboardData);
      } else {
        setError(data.message || "Failed to fetch dashboard data");
      }
    } catch (err) {
      setError("Failed to fetch dashboard data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    // Code nguyên bản
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/attendance/today`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if ((data.code === 200 || data.code === 0) && data.result) {
        setTodayData(data.result);
      } else {
        setError(data.message || "Failed to fetch today's attendance");
      }
    } catch (err) {
      setError("Failed to fetch today's attendance. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeAttendance = async (searchParams) => {
    // Code nguyên bản
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      let url;
      const { searchType, employeeCode, month, year, startDate, endDate } = searchParams;

      console.log("Building URL with:", { searchType, employeeCode, month, year, startDate, endDate });

      if (searchType === "EMPLOYEE_RANGE" && employeeCode && startDate && endDate) {
        url = `${API_URL}/attendance/employee/${employeeCode}/range?start=${startDate}&end=${endDate}`;
      } else if (searchType === "EMPLOYEE_ALL" && employeeCode) {
        url = `${API_URL}/attendance/employee/${employeeCode}`;
      } else if (searchType === "MONTH_ALL") {
        url = `${API_URL}/attendance/month?month=${month}&year=${year}`;
      } else {
        setError("Invalid search parameters");
        setLoading(false);
        return;
      }

      console.log("Final URL:", url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          return;
        }
        if (response.status === 404) {
          setError("No records found for the specified criteria");
          setEmployeeAttendance([]);
          setLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.code === 200 || data.code === 0) {
        if (Array.isArray(data)) {
          setEmployeeAttendance(data);
        } else if (data.result && Array.isArray(data.result)) {
          setEmployeeAttendance(data.result);
        } else if (data.result) {
          setEmployeeAttendance([data.result]);
        } else {
          setEmployeeAttendance([]);
        }
      } else {
        setError(data.message || "No records found");
        setEmployeeAttendance([]);
      }
    } catch (err) {
      setError("Failed to fetch employee attendance: " + err.message);
      setEmployeeAttendance([]);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    // Code nguyên bản
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/attendance/records?start=${startDate}&end=${endDate}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if ((data.code === 200 || data.code === 0) && Array.isArray(data)) {
        setRecordsData(data);
      } else if ((data.code === 200 || data.code === 0) && data.result) {
        setRecordsData(data.result);
      } else {
        setError(data.message || "Failed to fetch records");
      }
    } catch (err) {
      setError("Failed to fetch records. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    // Code nguyên bản
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/attendance/summary?month=${month}&year=${year}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if ((data.code === 200 || data.code === 0) && data.result) {
        setSummaryData(data.result);
      } else {
        setError(data.message || "Failed to fetch summary data");
      }
    } catch (err) {
      setError("Failed to fetch summary data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboard();
      fetchSummary(); 
    } else if (activeTab === "today") {
      fetchTodayAttendance();
    } else if (activeTab === "summary") {
      fetchSummary();
    } else if (activeTab === "records") {
      if (startDate && endDate) {
        fetchRecords();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, month, year]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardTab
            dashboardData={dashboardData}
            summaryData={summaryData}
            month={month}
            year={year}
            setMonth={setMonth}
            setYear={setYear}
            fetchDashboard={fetchDashboard}
            fetchSummary={fetchSummary}
            overviewData={overviewData}
          />
        );
      case "today":
        return (
          <TodayTab
            todayData={todayData}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        );
      case "employee":
        return (
          <EmployeeTab
            searchMode={searchMode}
            setSearchMode={setSearchMode}
            localEmployeeCode={localEmployeeCode}
            setLocalEmployeeCode={setLocalEmployeeCode}
            localStartDate={localStartDate}
            setLocalStartDate={setLocalStartDate}
            localEndDate={localEndDate}
            setLocalEndDate={setLocalEndDate}
            localMonth={localMonth}
            setLocalMonth={setLocalMonth}
            localYear={localYear}
            setLocalYear={setLocalYear}
            searchError={searchError}
            setSearchError={setSearchError}
            hasSearched={hasSearched}
            setHasSearched={setHasSearched}
            employeeAttendance={employeeAttendance}
            setEmployeeAttendance={setEmployeeAttendance}
            fetchEmployeeAttendance={fetchEmployeeAttendance}
            loading={loading}
            setError={setError}
          />
        );
      case "records":
        return (
          <RecordsTab
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            fetchRecords={fetchRecords}
            recordsData={recordsData}
            loading={loading}
          />
        );
      case "summary":
        return (
          <SummaryTab
            summaryData={summaryData}
            month={month}
            year={year}
            setMonth={setMonth}
            setYear={setYear}
            fetchSummary={fetchSummary}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Attendance Management</h1>
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">{error}</div>
        )}
        {successMessage && (
          <div className="p-4 mb-4 text-green-700 bg-green-100 border border-green-400 rounded">{successMessage}</div>
        )}
        <div className="flex gap-4 p-1 mb-6 bg-white rounded-lg shadow w-fit">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "today", label: "Today's Attendance" },
            { id: "employee", label: "Employee Records" },
            { id: "records", label: "Records by Date" },
            { id: "summary", label: "All Employees Summary" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded font-medium transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {loading && <div className="py-8 text-center text-gray-500">Loading...</div>}
        {!loading && renderTabContent()}
      </div>
    </div>
  );
};

export default AttendanceAdmin;