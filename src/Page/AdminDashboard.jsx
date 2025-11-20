import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, CheckCircle, Calendar, TrendingUp, Clock, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';

// API Base URL
const API_BASE_URL = 'https://ems-toq5.onrender.com/ems';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [dashboardData, setDashboardData] = useState({
    employees: [],
    departments: [],
    allProjects: [],
    allTasks: [],
    meetings: [],
    attendanceSummary: [],
    salaryStats: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Fetch employees
      const employeesRes = await fetch(`${API_BASE_URL}/employees/all`, {
        headers: getAuthHeaders()
      });
      const employeesData = await employeesRes.json();
      const employees = employeesData.result || [];

      // 2. Fetch departments
      const departmentsRes = await fetch(`${API_BASE_URL}/departments/all`, {
        headers: getAuthHeaders()
      });
      const departmentsData = await departmentsRes.json();
      const departments = departmentsData.result || [];

      // 3. Fetch projects for each department
      let allProjects = [];
      for (const dept of departments) {
        try {
          const deptId = dept.id || dept.deptID || dept.departmentId;
          if (!deptId) {
            console.warn('Department missing ID:', dept);
            continue;
          }
          
          const projectsRes = await fetch(
            `${API_BASE_URL}/projects/department?deptID=${deptId}`,
            { headers: getAuthHeaders() }
          );
          const projectsData = await projectsRes.json();
          if (projectsData.result) {
            allProjects = [...allProjects, ...projectsData.result];
          }
        } catch (err) {
          console.error(`Error fetching projects for dept ${dept.id}:`, err);
        }
      }

      // 4. Fetch tasks for each project
      let allTasks = [];
      for (const project of allProjects) {
        try {
          const projectId = project.id || project.projectId;
          if (!projectId) continue;
          
          const tasksRes = await fetch(
            `${API_BASE_URL}/tasks/project?projectId=${projectId}`,
            { headers: getAuthHeaders() }
          );
          const tasksData = await tasksRes.json();
          if (tasksData.result) {
            allTasks = [...allTasks, ...tasksData.result];
          }
        } catch (err) {
          console.error(`Error fetching tasks for project ${project.id}:`, err);
        }
      }

      // 5. Fetch meetings
      let meetings = [];
      try {
        const meetingsRes = await fetch(`${API_BASE_URL}/api/bookings`, {
          headers: getAuthHeaders()
        });
        if (meetingsRes.ok) {
          const meetingsData = await meetingsRes.json();
          meetings = meetingsData.result || [];
          
          console.log('Meetings data:', meetings); // Debug log
        } else {
          console.warn('Failed to fetch meetings:', meetingsRes.status);
        }
      } catch (err) {
        console.error('Error fetching meetings:', err);
      }

      // 6. Fetch attendance summary
      let attendanceSummary = [];
      try {
        const attendanceRes = await fetch(
          `${API_BASE_URL}/attendance/summary?month=${selectedMonth}&year=${selectedYear}`,
          { headers: getAuthHeaders() }
        );
        const attendanceData = await attendanceRes.json();
        attendanceSummary = attendanceData.result || [];
      } catch (err) {
        console.error('Error fetching attendance:', err);
      }

      // 7. Fetch salary statistics
      let salaryStats = null;
      try {
        const salaryRes = await fetch(
          `${API_BASE_URL}/salary/statistics?month=${selectedMonth}&year=${selectedYear}`,
          { headers: getAuthHeaders() }
        );
        const salaryData = await salaryRes.json();
        salaryStats = salaryData;
      } catch (err) {
        console.error('Error fetching salary stats:', err);
      }

      setDashboardData({
        employees,
        departments,
        allProjects,
        allTasks,
        meetings,
        attendanceSummary,
        salaryStats
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối và thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const parseApiDateTime = (dateTimeString) => {
  if (!dateTimeString) return null;

  try {
    // Kiểm tra xem chuỗi có khớp với định dạng "HH:mm:ss DD/MM/YYYY" không?
    // Ví dụ: "09:30:00 05/01/2026"
    const pattern = /^(\d{2}):(\d{2}):(\d{2}) (\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateTimeString.match(pattern);

    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = parseInt(match[3], 10);
      const day = parseInt(match[4], 10);
      const month = parseInt(match[5], 10);
      const year = parseInt(match[6], 10);

      // Tạo đối tượng Date. Lưu ý: tháng trong JavaScript bắt đầu từ 0 (0 là tháng 1)
      const date = new Date(year, month - 1, day, hours, minutes, seconds);

      // Kiểm tra xem date có hợp lệ không
      if (isNaN(date.getTime())) {
        console.error('Invalid date from parsed components:', dateTimeString);
        return null;
      }

      return date;
    } else {
      console.warn('Date string does not match expected format:', dateTimeString);
      return null;
    }
  } catch (error) {
    console.error('Error parsing date:', dateTimeString, error);
    return null;
  }
};

  const formatDateForComparison = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Tính toán statistics - TÁCH RIÊNG PROJECT VÀ TASK STATUS
  const calculateStats = () => {
    const { employees, allProjects, allTasks, meetings, attendanceSummary } = dashboardData;

    // PROJECT STATUS - TÁCH RIÊNG
    const plannedProjects = allProjects.filter(p => p.status === 'PLANNED').length;
    const inProgressProjects = allProjects.filter(p => p.status === 'IN_PROGRESS').length;
    const developedProjects = allProjects.filter(p => p.status === 'DEVELOPED').length;
    const closedProjects = allProjects.filter(p => p.status === 'CLOSED').length;
    const onHoldProjects = allProjects.filter(p => p.status === 'ON_HOLD').length;

    const totalProjects = allProjects.length;
    
    // TASK STATUS - TÁCH RIÊNG
    const pendingTasks = allTasks.filter(t => t.status === 'PENDING').length;
    const inProgressTasks = allTasks.filter(t => t.status === 'IN PROGRESS').length;
    const completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length;
    const closeTasks = allTasks.filter(t => t.status === 'CLOSE').length;
    const overdueTasks = allTasks.filter(t => t.status === 'OVERDUE').length;
    const canceledTasks = allTasks.filter(t => t.status === 'CANCELED').length;

    const totalTasks = allTasks.length;
    const taskCompletionRate = totalTasks > 0 ? 
      (((completedTasks + closeTasks) / totalTasks) * 100).toFixed(1) : 0;

    // Filter today's meetings
    const today = formatDateForComparison(new Date());
    const todayMeetings = meetings.filter(m => {
      const startDate = parseApiDateTime(m.startTime);
      return startDate && formatDateForComparison(startDate) === today;
    }).length;

    // Calculate attendance for today/this month
    const totalPresent = attendanceSummary.reduce((sum, emp) => sum + (emp.presentDays || 0), 0);
    const totalLate = attendanceSummary.reduce((sum, emp) => sum + (emp.lateDays || 0), 0);
    const totalAbsent = attendanceSummary.reduce((sum, emp) => sum + (emp.absentDays || 0), 0);
    const avgAttendanceRate = attendanceSummary.length > 0
      ? ((totalPresent / (attendanceSummary.length * 22)) * 100).toFixed(1)
      : 0;

    return {
      totalEmployees: employees.length,
      // Project stats - TÁCH RIÊNG
      plannedProjects,
      inProgressProjects,
      developedProjects,
      closedProjects,
      onHoldProjects,
      totalProjects,
      // Task stats - TÁCH RIÊNG
      taskCompletionRate,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      closeTasks,
      overdueTasks,
      canceledTasks,
      totalTasks,
      // Other stats
      todayMeetings,
      attendanceRate: avgAttendanceRate,
      presentCount: totalPresent,
      lateCount: totalLate,
      absentCount: totalAbsent
    };
  };

  // Dữ liệu cho department chart - CHỈ DÙNG PROJECT STATUS
  const getDepartmentProjectData = () => {
    const { departments, allProjects } = dashboardData;
    
    return departments.map(dept => {
      const deptId = dept.id || dept.deptID || dept.departmentId;
      const deptProjects = allProjects.filter(p => 
        p.departmentId === deptId || p.deptID === deptId
      );
      
      // PROJECT STATUS ONLY - TÁCH RIÊNG
      const planned = deptProjects.filter(p => p.status === 'PLANNED').length;
      const inProgress = deptProjects.filter(p => p.status === 'IN_PROGRESS').length;
      const developed = deptProjects.filter(p => p.status === 'DEVELOPED').length;
      const closed = deptProjects.filter(p => p.status === 'CLOSED').length;
      const onHold = deptProjects.filter(p => p.status === 'ON_HOLD').length;
      
      const total = deptProjects.length;

      return {
        name: dept.name || dept.departmentName || 'Unknown Department',
        planned,
        inProgress,
        developed,
        closed,
        onHold,
        total
      };
    });
  };

  // Dữ liệu cho task status pie chart - CHỈ DÙNG TASK STATUS
  const getTaskStatusData = () => {
    const { allTasks } = dashboardData;
    
    // TASK STATUS MAPPING ONLY - TÁCH RIÊNG
    const statusMap = {
      'PENDING': { name: 'Chờ xử lý', color: '#f59e0b' },
      'IN_PROGRESS': { name: 'Đang làm', color: '#3b82f6' },
      'COMPLETED': { name: 'Hoàn thành', color: '#10b981' },
      'CLOSE': { name: 'Đã đóng', color: '#059669' },
      'OVERDUE': { name: 'Quá hạn', color: '#ef4444' },
      'CANCELED': { name: 'Đã hủy', color: '#6b7280' }
    };

    const statusCount = allTasks.reduce((acc, task) => {
      const status = task.status || 'PENDING';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCount).map(([status, count]) => ({
      name: statusMap[status]?.name || status,
      value: count,
      color: statusMap[status]?.color || '#6b7280'
    }));
  };

  // Top performers based on attendance
  const getTopPerformers = () => {
    const { attendanceSummary } = dashboardData;
    return attendanceSummary
      .sort((a, b) => {
        const scoreA = (a.presentDays || 0) * 10 - (a.lateDays || 0) * 2 + (a.avgHours || 0);
        const scoreB = (b.presentDays || 0) * 10 - (b.lateDays || 0) * 2 + (b.avgHours || 0);
        return scoreB - scoreA;
      })
      .slice(0, 5);
  };

  // Get today's meetings
  const getTodayMeetings = () => {
    const { meetings } = dashboardData;
  
    if (!meetings || meetings.length === 0) {
      return [];
    }

    const today = formatDateForComparison(new Date());
    console.log('Today:', today); // Debug log
    
    const todayMeetings = meetings.filter(meeting => {
      if (!meeting.startTime) return false;
      
      const startDate = parseApiDateTime(meeting.startTime);
      if (!startDate) return false;
      
      const meetingDate = formatDateForComparison(startDate);
      console.log('Meeting date:', meetingDate, 'Title:', meeting.title); // Debug log
      
      return meetingDate === today;
    });

    console.log('Today meetings count:', todayMeetings.length); // Debug log
    
    return todayMeetings.sort((a, b) => {
      const dateA = parseApiDateTime(a.startTime);
      const dateB = parseApiDateTime(b.startTime);
      return dateA - dateB;
    });
  };

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Tổng quan hoạt động công ty</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Month/Year Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  Tháng {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Tổng Nhân Viên"
          value={stats.totalEmployees}
          subtitle={`${stats.presentCount} ngày công tháng này`}
          color="blue"
        />
        <StatCard
          icon={<Briefcase className="w-8 h-8" />}
          title="Dự Án Đang Chạy"
          value={stats.inProgressProjects}
          subtitle={`${stats.totalProjects} dự án • ${stats.closedProjects} đã đóng`}
          color="purple"
        />
        <StatCard
          icon={<CheckCircle className="w-8 h-8" />}
          title="Hoàn Thành Task"
          value={`${stats.taskCompletionRate}%`}
          subtitle={`${stats.completedTasks + stats.closeTasks}/${stats.totalTasks} task`}
          color="green"
        />
        <StatCard
          icon={<Calendar className="w-8 h-8" />}
          title="Cuộc Họp Hôm Nay"
          value={stats.todayMeetings}
          subtitle={`Tổng ${dashboardData.meetings.length} cuộc họp`}
          color="orange"
        />
      </div>

      {/* Project Status Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Tổng Quan Dự Án</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatusBadge count={stats.plannedProjects} label="Kế Hoạch" color="yellow" />
          <StatusBadge count={stats.inProgressProjects} label="Đang Chạy" color="blue" />
          <StatusBadge count={stats.developedProjects} label="Đã Phát Triển" color="green" />
          <StatusBadge count={stats.closedProjects} label="Đã Đóng" color="gray" />
          <StatusBadge count={stats.onHoldProjects} label="Tạm Dừng" color="red" />
        </div>
      </div>

      {/* Task Status Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Tổng Quan Công Việc</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <StatusBadge count={stats.pendingTasks} label="Chờ Xử Lý" color="yellow" />
          <StatusBadge count={stats.inProgressTasks} label="Đang Làm" color="blue" />
          <StatusBadge count={stats.completedTasks} label="Hoàn Thành" color="green" />
          <StatusBadge count={stats.closeTasks} label="Đã Đóng" color="gray" />
          <StatusBadge count={stats.overdueTasks} label="Quá Hạn" color="red" />
          <StatusBadge count={stats.canceledTasks} label="Đã Hủy" color="gray" />
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Projects Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Dự Án Theo Phòng Ban</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={getDepartmentProjectData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end"
                height={80}
                interval={0}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="planned" fill="#f59e0b" name="Kế hoạch" />
              <Bar dataKey="inProgress" fill="#3b82f6" name="Đang chạy" />
              <Bar dataKey="developed" fill="#10b981" name="Đã phát triển" />
              <Bar dataKey="closed" fill="#6b7280" name="Đã đóng" />
              <Bar dataKey="onHold" fill="#ef4444" name="Tạm dừng" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Phân Bố Công Việc</h2>
          {getTaskStatusData().length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getTaskStatusData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getTaskStatusData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} tasks`, 'Số lượng']} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend bên ngoài chart */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {getTaskStatusData().map((entry, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 mr-2 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Chưa có dữ liệu công việc
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Top Nhân Viên
          </h2>
          <div className="space-y-3">
            {getTopPerformers().map((emp, idx) => (
              <div key={emp.code || emp.id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center flex-1">
                  <span className="font-bold text-lg text-gray-500 w-8">{idx + 1}</span>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">{emp.name}</p>
                    <p className="text-sm text-gray-500">{emp.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{emp.presentDays || 0}</p>
                  <p className="text-xs text-gray-500">ngày công</p>
                </div>
              </div>
            ))}
            {getTopPerformers().length === 0 && (
              <p className="text-gray-500 text-center py-8">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Meetings Today */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            Lịch Họp Hôm Nay
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {getTodayMeetings().map(meeting => (
              <div key={meeting.id || meeting.bookingId} className="p-3 border border-gray-200 rounded">
                <p className="font-medium text-gray-900">{meeting.title}</p>
                <p className="text-sm text-gray-600 mt-1">{meeting.roomName}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{meeting.organizerName}</span>
                  <span className="text-xs text-blue-600">
                    {(() => {
                      const date = parseApiDateTime(meeting.startTime);
                      return date ? date.toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : '--:--';
                    })()}
                  </span>
                </div>
              </div>
            ))}
            {getTodayMeetings().length === 0 && (
              <p className="text-gray-500 text-center py-8">Không có cuộc họp nào hôm nay</p>
            )}
          </div>
        </div>

        {/* Attendance & Salary */}
        <div className="space-y-6">
          {/* Attendance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Chấm Công Tháng {selectedMonth}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tổng ngày công:</span>
                <span className="font-bold text-green-600">{stats.presentCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Đi muộn:</span>
                <span className="font-bold text-yellow-600">{stats.lateCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Vắng mặt:</span>
                <span className="font-bold text-red-600">{stats.absentCount}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tỷ lệ TB:</span>
                  <span className="font-bold text-blue-600">{stats.attendanceRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Lương Tháng {selectedMonth}
            </h2>
            {dashboardData.salaryStats ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Tổng lương:</span>
                  <span className="font-bold text-gray-900">
                    {(dashboardData.salaryStats.totalNetSalary / 1000000000).toFixed(2)}B
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">TB/người:</span>
                  <span className="font-bold text-blue-600">
                    {(dashboardData.salaryStats.averageNetSalary / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Tổng NV:</span>
                  <span className="font-bold text-gray-900">
                    {dashboardData.salaryStats.totalEmployees}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Chưa có dữ liệu lương</p>
            )}
          </div>
        </div>
      </div>

      {/* Department Details Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Chi Tiết Phòng Ban</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng Ban</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kế Hoạch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đang Chạy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đã Phát Triển</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đã Đóng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tạm Dừng</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getDepartmentProjectData().map((dept, index) => (
                <tr key={dept.name || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{dept.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{dept.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {dept.planned}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {dept.inProgress}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {dept.developed}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {dept.closed}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      {dept.onHold}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} text-white p-3 rounded-lg`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ count, label, color }) => {
  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className={`text-2xl font-bold ${colorClasses[color].split(' ')[1]}`}>
        {count}
      </div>
      <div className={`text-sm mt-1 px-2 py-1 rounded-full ${colorClasses[color]}`}>
        {label}
      </div>
    </div>
  );
};

export default AdminDashboard;