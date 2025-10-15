import React from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, UserCheck, UserX, AlertCircle, Users, TrendingUp, Calendar } from "lucide-react";
import { formatToLocalTime } from "../../../utils/helpers";
import KPICard from "../components/KPICard";

const DashboardTab = ({ 
  dashboardData, 
  summaryData, 
  month, 
  year, 
  setMonth, 
  setYear, 
  fetchDashboard, 
  fetchSummary,
  overviewData 
}) => {
  if (!dashboardData) return <div className="py-8 text-center text-gray-500">No data available</div>;

  const employeeHoursData = summaryData
    ?.filter(emp => emp.avgHours > 0)
    .slice(0, 8) 
    .map(emp => ({
      name: emp.name.length > 8 ? emp.name.substring(0, 8) + '...' : emp.name,
      hours: Math.max(0, emp.avgHours),
      code: emp.code,
      fullName: emp.name
    })) || [];

  const statusData = [
    { name: "Present", value: dashboardData.presentDays },
    { name: "Late", value: dashboardData.lateDays },
    { name: "Absent", value: dashboardData.absentDays },
  ];

  const totalStatus = dashboardData.presentDays + dashboardData.lateDays + dashboardData.absentDays;
  const percentageData = [
    { 
      name: "Present", 
      value: dashboardData.presentDays,
      percentage: totalStatus > 0 ? ((dashboardData.presentDays / totalStatus) * 100).toFixed(1) + '%' : '0%',
      color: '#3b82f6'
    },
    { 
      name: "Late", 
      value: dashboardData.lateDays,
      percentage: totalStatus > 0 ? ((dashboardData.lateDays / totalStatus) * 100).toFixed(1) + '%' : '0%',
      color: '#f97316'
    },
    { 
      name: "Absent", 
      value: dashboardData.absentDays,
      percentage: totalStatus > 0 ? ((dashboardData.absentDays / totalStatus) * 100).toFixed(1) + '%' : '0%',
      color: '#ef4444'
    },
  ];

  const attendanceRate = totalStatus > 0 ? ((dashboardData.presentDays / totalStatus) * 100).toFixed(1) : 0;

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
        <button onClick={() => { fetchDashboard(); fetchSummary(); }} className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Apply</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard icon={UserCheck} label="Present Days" value={dashboardData.presentDays} color="#3b82f6" />
        <KPICard icon={Clock} label="Late Days" value={dashboardData.lateDays} color="#f97316" />
        <KPICard icon={UserX} label="Absent Days" value={dashboardData.absentDays} color="#ef4444" />
        <KPICard icon={AlertCircle} label="Avg Hours" value={dashboardData.averageHours.toFixed(2)} color="#8b5cf6" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Employee Average Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employeeHoursData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} hours`, 'Average Hours']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return `Employee: ${payload[0].payload.fullName}`;
                  }
                  return label;
                }}
              />
              <Bar 
                dataKey="hours" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="Average Hours"
              />
            </BarChart>
          </ResponsiveContainer>
          {employeeHoursData.length === 0 && (
            <div className="py-4 text-center text-gray-500">No employee data available</div>
          )}
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Attendance Distribution</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie 
                  data={statusData} 
                  cx="50%" 
                  cy="50%" 
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80} 
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={percentageData[index].color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="flex-1 pl-6">
              <div className="space-y-4">
                {percentageData.map((item, index) => (
                  <div key={item.name} className="flex items-center">
                    <div 
                      className="w-4 h-4 mr-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.value} days ({item.percentage})
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-900">
                    Total: {totalStatus} days
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    Attendance Rate: {attendanceRate}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <Users className="w-8 h-8 mr-4 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{dashboardData.employeeCount}</div>
              <div className="text-sm text-gray-500">Total Employees</div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 mr-4 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{attendanceRate}%</div>
              <div className="text-sm text-gray-500">Overall Attendance Rate</div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 mr-4 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{dashboardData.totalDays}</div>
              <div className="text-sm text-gray-500">Working Days</div>
            </div>
          </div>
        </div>
      </div>

      {overviewData && overviewData.records && overviewData.records.length > 0 && (
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Day</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Check In</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Check Out</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Hours</th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {overviewData.records.map((record, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{record.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.day}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatToLocalTime(record.checkIn) || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatToLocalTime(record.checkOut) || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.workHours || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        record.status === "PRESENT" ? "bg-blue-100 text-blue-800" :
                        record.status === "LATE" ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {record.status}
                        {record.notEnoughHour && " (Not Enough)"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTab;