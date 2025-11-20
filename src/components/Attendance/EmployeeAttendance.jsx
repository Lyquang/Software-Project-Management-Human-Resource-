// src/components/EmployeeAttendance/EmployeeAttendance.jsx
import React, { useState, useEffect, useMemo } from "react";
import AttendanceCard from "./AttendanceCard";
import AttendanceTable from "./AttendanceTable";
import TimeDisplay from "./TimeDisplay";

// Import icons
import { FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle, FaHourglassHalf } from "react-icons/fa";
import axios from "../../api/axiosInstance";
import { API_ROUTES } from "../../api/apiRoutes";
import { toast } from "react-toastify";

const EmployeeAttendance = () => {
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [filteredData, setFilteredData] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    avgHours: "0.0",
  });
  const [todayStatus, setTodayStatus] = useState({
    status: "...",
    clockIn: "--:--",
    checkOut: "--:--",
    workingHours: "In Progress",
    canCheckIn: true,
    canCheckOut: false,
  });
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const statusColors = {
    Present: "bg-green-500",
    "Work from office": "bg-green-600",
    "Work from home": "bg-green-600",
    Late: "bg-yellow-500",
    Absent: "bg-red-500",
    "In Progress": "bg-blue-500",
  };

  const mapStatus = (status) => {
    switch ((status || "").toUpperCase()) {
      case "WORK_FROM_OFFICE": return "Work from office";
      case "WORK_FROM_HOME": return "Work from home";
      case "PRESENT": return "Present";
      case "ABSENT": return "Absent";
      case "LATE": return "Late";
      default: return "Present";
    }
  };

  const parseApiDate = (s) => {
    const d = new Date(s);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const isSameYMD = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const mapTodayStatus = (s) => {
    switch ((s || "").toUpperCase()) {
      case "LATE_ARRIVAL": return "Late";
      case "PRESENT": return "Present";
      case "ABSENT": return "Absent";
      default: return "Present";
    }
  };

  const computeWorkingHours = (inStr, outStr) => {
    if (!inStr || !outStr) return "0m";
    const [ih, im] = inStr.split(":").map(Number);
    const [oh, om] = outStr.split(":").map(Number);
    const inDate = new Date(); inDate.setHours(ih || 0, im || 0, 0, 0);
    const outDate = new Date(); outDate.setHours(oh || 0, om || 0, 0, 0);
    let diff = Math.max(0, outDate - inDate);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h ? `${h}h ${m}m` : `${m}m`;
  };

  const fetchTodayStatus = async () => {
    try {
      const { data } = await axios.get(API_ROUTES.ATTENDANCE.TODAY_STATUS);
      if (data?.code !== 200 || !data?.result) throw new Error("Invalid response");
      const { status, checkIn, checkOut } = data.result;
      setTodayStatus({
        status: mapTodayStatus(status),
        clockIn: checkIn ?? "--:--",
        checkOut: checkOut ?? "--:--",
        workingHours: checkOut ? computeWorkingHours(checkIn, checkOut) : "In Progress",
        canCheckIn: !checkIn,
        canCheckOut: !!checkIn && !checkOut,
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load today status");
    }
  };

  const fetchOverview = async (month, year) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(API_ROUTES.ATTENDANCE.OVERVIEW, { params: { month, year } });
      if (data?.code !== 200 || !data?.result) throw new Error("Invalid response");
      const { totalDays, presentDays, lateDays, absentDays, averageHours, records } = data.result;

      const tableData = (records || []).map((r) => ({
        date: r.date,
        day: r.day,
        checkIn: r.checkIn ?? "--:--",
        checkOut: r.checkOut ?? "--:--",
        workHours: r.workHours,
        status: mapStatus(r.status),
        notes: r.notEnoughHour ? "Not enough hour" : "",
      }));
      setFilteredData(tableData);

      setAttendanceStats({
        totalDays: totalDays ?? tableData.length,
        present: presentDays ?? 0,
        late: lateDays ?? 0,
        absent: absentDays ?? 0,
        avgHours: typeof averageHours === "number" ? averageHours.toFixed(1) : "0.0",
      });
    } catch (e) {
      setError("Failed to load attendance overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const handleCheckIn = async () => {
    if (!todayStatus.canCheckIn || checkInLoading) return;
    setCheckInLoading(true);
    try {
      await axios.post(API_ROUTES.ATTENDANCE.CHECK_IN, {});
      toast.success("Checked in successfully");
      await Promise.all([
        fetchOverview(selectedMonth, selectedYear),
        fetchTodayStatus(),
      ]);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Check in failed");
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayStatus.canCheckOut || checkOutLoading) return;
    setCheckOutLoading(true);
    try {
      await axios.post(API_ROUTES.ATTENDANCE.CHECK_OUT, {});
      toast.success("Checked out successfully");
      await Promise.all([
        fetchOverview(selectedMonth, selectedYear),
        fetchTodayStatus(),
      ]);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Check out failed");
    } finally {
      setCheckOutLoading(false);
    }
  };

  const summaryCards = useMemo(() => [
    { id: 1, title: "Total Days", value: attendanceStats.totalDays, icon: <FaCalendarAlt />, variant: "total" },
    { id: 2, title: "Present", value: attendanceStats.present, icon: <FaCheckCircle />, variant: "present" },
    { id: 3, title: "Late", value: attendanceStats.late, icon: <FaClock />, variant: "late" },
    { id: 4, title: "Absent", value: attendanceStats.absent, icon: <FaTimesCircle />, variant: "absent" },
    { id: 5, title: "Average hour", value: `${attendanceStats.avgHours}h`, icon: <FaHourglassHalf />, variant: "average" },
  ], [attendanceStats]);


  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* Hiển thị lỗi/đang tải đơn giản */}
      {loading && <div className="mb-4 text-gray-500">Loading attendance...</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <h1 className="text-3xl font-bold mb-2">My Attendance</h1>
      <p className="text-base text-gray-500 mb-8">Manage your attendance</p>

      {/* Phần trên: Đồng hồ và Trạng thái hôm nay */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold">Timekeeping</h3>
          <TimeDisplay />
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCheckIn}
              disabled={!todayStatus.canCheckIn || checkInLoading}
              className={`w-full py-3 font-semibold rounded-lg transition-colors ${
                !todayStatus.canCheckIn || checkInLoading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {checkInLoading ? "Checking..." : "Check In"}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={!todayStatus.canCheckOut || checkOutLoading}
              className={`w-full py-3 font-semibold rounded-lg transition-colors ${
                !todayStatus.canCheckOut || checkOutLoading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {checkOutLoading ? "Checking..." : "Check Out"}
            </button>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold">Total's Status</h3>
          <p className="text-gray-500">Your attendance for today</p>
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status:</span>
              <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${statusColors[todayStatus.status] || 'bg-gray-400'}`}>{todayStatus.status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Clock In:</span>
              <span className="font-semibold">{todayStatus.clockIn}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Clock Out:</span>
              <span className="font-semibold">{todayStatus.checkOut}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Working Hours:</span>
              <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${statusColors[todayStatus.workingHours === 'In Progress' ? 'In Progress' : ''] || 'bg-gray-700'}`}>{todayStatus.workingHours}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phần tổng quan */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 mb-6">
            <label htmlFor="month-select" className="font-medium text-gray-600">Tháng:</label>
            <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
                {[...Array(12).keys()].map(i => <option key={i+1} value={i+1}>{i+1}</option>)}
            </select>

            <label htmlFor="year-select" className="font-medium text-gray-600">Năm:</label>
            <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
                {[...Array(5).keys()].map(i => <option key={currentYear - i} value={currentYear - i}>{currentYear - i}</option>)}
            </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {summaryCards.map(card => (
                <AttendanceCard
                    key={card.id}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    variant={card.variant}
                />
            ))}
        </div>
      </div>

      {/* <-- Bảng danh sách được thêm vào đây --> */}
      <AttendanceTable data={filteredData} />
    </div>
  );
};

export default EmployeeAttendance;