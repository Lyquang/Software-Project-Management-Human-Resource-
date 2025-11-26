import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Search,
  Filter,
} from "lucide-react";

const MainEmployeeDashBoard = () => {
  const scope = sessionStorage.getItem("scope");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // State cho bộ lọc tìm kiếm
// Javascript's getMonth() returns 0-11, so we add 1 to get 1-12
  const [searchMonth, setSearchMonth] = useState(new Date().getMonth() + 1);
  const [searchYear, setSearchYear] = useState(new Date().getFullYear());

  // Màu sắc cho biểu đồ (giữ nguyên hoặc chỉnh sáng hơn 1 chút nếu cần)
  const COLORS = ["#8B5CF6", "#34D399", "#F87171", "#FBBF24"];

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const personelCode = sessionStorage.getItem("personelCode");
      console.log("personelCode  at dashboard",personelCode );
      // Sử dụng template literals để đưa searchMonth và searchYear vào URL https://ems-toq5.onrender.com/ems/salary/my-salaries?month=11&year=2025&page=0&size=10
      const response = await axios.get(
        `https://ems-toq5.onrender.com/ems/salary/personnel/${personelCode}?month=${searchMonth}&year=${searchYear}&page=0&size=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (
        response.data &&
        response.data.result &&
        response.data.result.content.length > 0
      ) {
        setData(response.data.result.content[0]);
      } else {
        setData(null); // Xử lý trường hợp không tìm thấy dữ liệu
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lần đầu tiên khi component mount
  useEffect(() => {
    console.log("scope at dashboard", scope);

    fetchData();
  }, []);

  // Xử lý khi bấm nút Search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Generate list năm (ví dụ từ 2020 đến 2030)
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
  // Generate list tháng
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Helper render view khi không có data nhưng vẫn giữ khung giao diện
  const renderNoData = () => (
    <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-sm border border-gray-200">
      <AlertCircle size={48} className="text-gray-300 mb-4" />
      <p className="text-gray-500 font-medium">
        No data found for {searchMonth}/{searchYear}
      </p>
    </div>
  );

  // --- LOGIC HIỂN THỊ DỮ LIỆU ---
  const detail = data ? data.salaryDetailResponse : {};

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  const salaryPieData = data
    ? [
        { name: "Net Salary", value: detail.netSalary },
        {
          name: "Deductions",
          value: Math.abs(detail.totalDeductions) + Math.abs(detail.penalty),
        },
      ]
    : [];

  const attendanceLineData = data
    ? [
        { name: "Full Days", count: detail.fullDayWork },
        { name: "Late Days", count: detail.lateDays },
        { name: "Low Hour", count: detail.notEnoughHourDays },
        { name: "Absence", count: detail.absenceDays },
      ]
    : [];

  // Component Thẻ Donut nhỏ (Light Mode)
  const StatCard = ({ title, value, total, color, icon: Icon }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 36 36"
          >
            {/* Background circle - Gray lighter */}
            <path
              className="text-gray-100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            {/* Value circle */}
            <path
              style={{ color: color }}
              strokeDasharray={`${percentage}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-xs font-bold text-gray-700">
            {value}
          </div>
        </div>
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="text-gray-900 font-bold text-lg">
            {value}{" "}
            <span className="text-xs text-gray-400 font-normal">
              / {total || 30}
            </span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 font-sans">
      {/* --- Header & Search Bar --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          {scope == "EMPLOYEE" ? (
            <h1 className="text-2xl font-bold text-blue-700">
              Employee Dashboard
            </h1>
          ) : (
            <h1 className="text-2xl font-bold text-blue-700">
              Manager Dashboard
            </h1>
          )}

          {data && (
            <p className="text-gray-500 text-sm mt-1">
              Welcome back,{" "}
              <span className="font-semibold text-gray-700">
                {data.personnelName}
              </span>
            </p>
          )}
        </div>

        {/* Search Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-semibold uppercase">
              Filter Time
            </span>
          </div>

          <select
            value={searchMonth}
            onChange={(e) => setSearchMonth(Number(e.target.value))}
            className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer hover:bg-gray-50 rounded px-1"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>

          <span className="text-gray-300">|</span>

          <select
            value={searchYear}
            onChange={(e) => setSearchYear(Number(e.target.value))}
            className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer hover:bg-gray-50 rounded px-1"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
            title="Search Records"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {!data ? (
        renderNoData()
      ) : (
        <>
          {/* --- Top Summary Cards --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card Total Hours */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Work Hours
                  </p>
                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {detail.totalWorkHours}{" "}
                    <span className="text-sm font-normal text-gray-400">
                      hrs
                    </span>
                  </h2>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <Clock size={24} />
                </div>
              </div>
            </div>

            {/* Card Gross Salary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Gross Salary
                  </p>
                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {formatCurrency(detail.grossSalary)}
                  </h2>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                  <Briefcase size={24} />
                </div>
              </div>
            </div>

            {/* Card Net Salary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    Net Salary (Received)
                  </p>
                  <h2 className="text-3xl font-bold text-green-600 mt-2">
                    {formatCurrency(detail.netSalary)}
                  </h2>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* --- Middle Section: Attendance Breakdown --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Full Days"
              value={detail.fullDayWork}
              total={30}
              color="#34D399"
              icon={CheckCircle}
            />
            <StatCard
              title="Late Days"
              value={detail.lateDays}
              total={30}
              color="#FBBF24"
              icon={AlertCircle}
            />
            <StatCard
              title="Low Hours"
              value={detail.notEnoughHourDays}
              total={30}
              color="#F87171"
              icon={AlertCircle}
            />
            <StatCard
              title="Absence"
              value={detail.absenceDays}
              total={30}
              color="#9CA3AF"
              icon={AlertCircle}
            />
          </div>

          {/* --- Bottom Section: Charts --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-800">
                  Attendance Trends
                </h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceLineData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#E5E7EB"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#9CA3AF"
                      tick={{ fill: "#6B7280", fontSize: 12 }} // Gray-500 text
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E5E7EB",
                        color: "#111827",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                      itemStyle={{ color: "#374151" }}
                      cursor={{ stroke: "#D1D5DB" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#FFFFFF",
                        stroke: "#8B5CF6",
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 6, fill: "#8B5CF6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
              <h3 className="font-bold text-lg mb-4 w-full text-left text-gray-800">
                Salary Breakdown
              </h3>
              <div className="h-64 w-full relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    Net %
                  </span>
                  <span className="text-2xl font-bold text-gray-800">
                    {detail.grossSalary > 0
                      ? ((detail.netSalary / detail.grossSalary) * 100).toFixed(
                          1
                        )
                      : 0}
                    %
                  </span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salaryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {salaryPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        borderColor: "#E5E7EB",
                        color: "#111827",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ color: "#374151" }} // Darker text for legend
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Gross</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(detail.grossSalary)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Deductions</span>
                  <span className="font-medium text-red-500">
                    -{" "}
                    {formatCurrency(
                      detail.totalDeductions + Math.abs(detail.penalty)
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-px"></div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="font-bold text-gray-700">Net Salary</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(detail.netSalary)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainEmployeeDashBoard;
