import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, CheckCircle, Calendar, TrendingUp, Clock, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';

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
    const token = sessionStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const employeesRes = await fetch(`${API_BASE_URL}/employees/all`, {
        headers: getAuthHeaders()
      });
      const employeesData = await employeesRes.json();
      const employees = employeesData.result || [];

      const departmentsRes = await fetch(`${API_BASE_URL}/departments/all`, {
        headers: getAuthHeaders()
      });
      const departmentsData = await departmentsRes.json();
      const departments = departmentsData.result || [];

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
    const pattern = /^(\d{2}):(\d{2}):(\d{2}) (\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateTimeString.match(pattern);

    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = parseInt(match[3], 10);
      const day = parseInt(match[4], 10);
      const month = parseInt(match[5], 10);
      const year = parseInt(match[6], 10);

      const date = new Date(year, month - 1, day, hours, minutes, seconds);

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

  const calculateStats = () => {
    const { employees, allProjects, allTasks, meetings, attendanceSummary } = dashboardData;

    const plannedProjects = allProjects.filter(p => p.status === 'PLANNED').length;
    const inProgressProjects = allProjects.filter(p => p.status === 'IN_PROGRESS').length;
    const developedProjects = allProjects.filter(p => p.status === 'DEVELOPED').length;
    const closedProjects = allProjects.filter(p => p.status === 'CLOSED').length;
    const onHoldProjects = allProjects.filter(p => p.status === 'ON_HOLD').length;

    const totalProjects = allProjects.length;
    
    const pendingTasks = allTasks.filter(t => t.status === 'PENDING').length;
    const inProgressTasks = allTasks.filter(t => t.status === 'IN PROGRESS').length;
    const completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length;
    const closeTasks = allTasks.filter(t => t.status === 'CLOSE').length;
    const overdueTasks = allTasks.filter(t => t.status === 'OVERDUE').length;
    const canceledTasks = allTasks.filter(t => t.status === 'CANCELED').length;

    const totalTasks = allTasks.length;
    const taskCompletionRate = totalTasks > 0 ? 
      (((completedTasks + closeTasks) / totalTasks) * 100).toFixed(1) : 0;

    const today = formatDateForComparison(new Date());
    const todayMeetings = meetings.filter(m => {
      const startDate = parseApiDateTime(m.startTime);
      return startDate && formatDateForComparison(startDate) === today;
    }).length;

    const totalPresent = attendanceSummary.reduce((sum, emp) => sum + (emp.presentDays || 0), 0);
    const totalLate = attendanceSummary.reduce((sum, emp) => sum + (emp.lateDays || 0), 0);
    const totalAbsent = attendanceSummary.reduce((sum, emp) => sum + (emp.absentDays || 0), 0);
    const avgAttendanceRate = attendanceSummary.length > 0
      ? ((totalPresent / (attendanceSummary.length * 22)) * 100).toFixed(1)
      : 0;

    return {
      totalEmployees: employees.length,
      plannedProjects,
      inProgressProjects,
      developedProjects,
      closedProjects,
      onHoldProjects,
      totalProjects,
      taskCompletionRate,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      closeTasks,
      overdueTasks,
      canceledTasks,
      totalTasks,
      todayMeetings,
      attendanceRate: avgAttendanceRate,
      presentCount: totalPresent,
      lateCount: totalLate,
      absentCount: totalAbsent
    };
  };

  const getDepartmentProjectData = () => {
    const { departments, allProjects } = dashboardData;
    
    return departments.map(dept => {
      const deptId = dept.id || dept.deptID || dept.departmentId;
      const deptProjects = allProjects.filter(p => 
        p.departmentId === deptId || p.deptID === deptId
      );
      
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

  const getTaskStatusData = () => {
    const { allTasks } = dashboardData;
    
    const statusMap = {
      'PENDING': { name: 'Pending', color: '#f59e0b' },
      'IN_PROGRESS': { name: 'In progress', color: '#3b82f6' },
      'COMPLETED': { name: 'Completed', color: '#10b981' },
      'CLOSE': { name: 'Close', color: '#059669' },
      'OVERDUE': { name: 'Overdue', color: '#ef4444' },
      'CANCELED': { name: 'Canceled', color: '#6b7280' }
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

  const getTodayMeetings = () => {
    const { meetings } = dashboardData;
  
    if (!meetings || meetings.length === 0) {
      return [];
    }

    const today = formatDateForComparison(new Date());
    
    const todayMeetings = meetings.filter(meeting => {
      if (!meeting.startTime) return false;
      
      const startDate = parseApiDateTime(meeting.startTime);
      if (!startDate) return false;
      
      const meetingDate = formatDateForComparison(startDate);
      
      return meetingDate === today;
    });
    
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
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const monthNames = [
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Company operations overview</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
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
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Users className="w-8 h-8" />}
          title="Total number of employees"
          value={stats.totalEmployees}
          subtitle={`${stats.presentCount} working days this month`}
          color="blue"
        />
        <StatCard
          icon={<Briefcase className="w-8 h-8" />}
          title="Project is in progress"
          value={stats.inProgressProjects}
          subtitle={`${stats.totalProjects} task • ${stats.closedProjects} closed`}
          color="purple"
        />
        <StatCard
          icon={<CheckCircle className="w-8 h-8" />}
          title="Completed tasks"
          value={`${stats.taskCompletionRate}%`}
          subtitle={`${stats.completedTasks + stats.closeTasks}/${stats.totalTasks} task`}
          color="green"
        />
        <StatCard
          icon={<Calendar className="w-8 h-8" />}
          title="Meetings today"
          value={stats.todayMeetings}
          subtitle={`Total of ${dashboardData.meetings.length} meetings`}
          color="orange"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatusBadge count={stats.plannedProjects} label="Planned" color="yellow" />
          <StatusBadge count={stats.inProgressProjects} label="In Progress" color="blue" />
          <StatusBadge count={stats.developedProjects} label="Developed" color="green" />
          <StatusBadge count={stats.closedProjects} label="Closes" color="gray" />
          <StatusBadge count={stats.onHoldProjects} label="On Hold" color="red" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Task Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <StatusBadge count={stats.pendingTasks} label="Pending" color="yellow" />
          <StatusBadge count={stats.inProgressTasks} label="In Progress" color="blue" />
          <StatusBadge count={stats.completedTasks} label="Completed" color="green" />
          <StatusBadge count={stats.closeTasks} label="Closed" color="gray" />
          <StatusBadge count={stats.overdueTasks} label="Overdue" color="red" />
          <StatusBadge count={stats.canceledTasks} label="Canceled" color="gray" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Projects by Department</h2>
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
              <Bar dataKey="planned" fill="#f59e0b" name="Planned" />
              <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" />
              <Bar dataKey="developed" fill="#10b981" name="Developed" />
              <Bar dataKey="closed" fill="#6b7280" name="Closed" />
              <Bar dataKey="onHold" fill="#ef4444" name="On Hold" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Work Distribution</h2>
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
              Not have data yet
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Top Employees
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
                  <p className="text-xs text-gray-500">working days</p>
                </div>
              </div>
            ))}
            {getTopPerformers().length === 0 && (
              <p className="text-gray-500 text-center py-8">No data yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            Meetings today
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
              <p className="text-gray-500 text-center py-8">There are no meetings today.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              {monthNames[selectedMonth - 1]} attendance
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total working day:</span>
                <span className="font-bold text-green-600">{stats.presentCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Go late:</span>
                <span className="font-bold text-yellow-600">{stats.lateCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Absent:</span>
                <span className="font-bold text-red-600">{stats.absentCount}</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average rate:</span>
                  <span className="font-bold text-blue-600">{stats.attendanceRate}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Salary for {monthNames[selectedMonth - 1]}
            </h2>
            {dashboardData.salaryStats ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total Salary:</span>
                  <span className="font-bold text-gray-900">
                    {(dashboardData.salaryStats.totalNetSalary / 1000000000).toFixed(2)}B
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Avg/person:</span>
                  <span className="font-bold text-blue-600">
                    {(dashboardData.salaryStats.averageNetSalary / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Total number of employees</span>
                  <span className="font-bold text-gray-900">
                    {dashboardData.salaryStats.totalEmployees}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No salary data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Department Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Planned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">In Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Developed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Closed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">On Hold</th>
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