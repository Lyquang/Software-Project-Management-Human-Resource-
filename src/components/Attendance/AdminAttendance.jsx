import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, X, Clock } from "phosphor-react";
import "./AdminAttendance.scss";
import { ImCross } from "react-icons/im";
import { TiTick } from "react-icons/ti";
import Loading from "../Loading/Loading";

const AdminAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()+1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendanceData = async (month, year) => {
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:8080/api/attendance/month-year`,
        {
          params: { month, year },
        }
      );

      const { code, result } = response.data;
      if (code === 1000) {
        const transformedData = result.map((employee) => ({
          id: employee.employeeCode.toString(),
          name: employee.employeeName,
          attendance: employee.attendanceRecords.map((record) => ({
            work_date: record.attendanceDate,
            attendanceType: record.attendanceResult
              .replace(/ /g, "_")
              .toLowerCase(),
          })),
        }));
        setEmployees(transformedData);
      } else {
        setError("Failed to fetch attendance records.");
      }
    } catch (err) {
      setError("Error while fetching attendance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
  const filteredDays = Array.from(
    { length: getDaysInMonth(selectedMonth, selectedYear) },
    (_, i) => i + 1
  );

  const handleDateClick = async (employeeCode, date) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/attendance/date`,
        {
          params: { code: employeeCode, date },
        }
      );

      const { code, result } = response.data;
      if (code === 1000) {
        setSelectedDateInfo(result);
      } else {
        setSelectedDateInfo({ error: "Ngày đó nhân viên này vắng không phép" });
      }
    } catch (err) {
      setSelectedDateInfo({ error: "Ngày đó nhân viên này vắng không phép" });
    }
  };

  const closeDateInfo = () => setSelectedDateInfo(null);

  if (loading)
    return <div className="text-center mt-4"><Loading/></div>;
  if (error) return <div className="text-center mt-4 text-danger">{error}</div>;

  return (
    <div className="admin-attendance">
        <h2 className="title">Check attendance</h2>
        <div className="filters">
          <label>Selected Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {[...Array(12).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <label>Selected Year:</label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          />
        </div>
    

      {employees.length === 0 ? (
        <div className="no-data">No have data.</div>
      ) : (
        <div className="attendance-table">
          <table>
            <thead>
              <tr>
                <th>Employee Name</th>
                {filteredDays.map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="employee-info">
                    <span>{employee.name}</span>
                  </td>
                  {filteredDays.map((day) => {
                    const attendanceEntry = employee.attendance.find(
                      (a) => new Date(a.work_date).getDate() === day
                    );
                    const status = attendanceEntry
                      ? attendanceEntry.attendanceType
                      : "absence";

                    const dateString = `${selectedYear}-${selectedMonth
                      .toString()
                      .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

                    return (
                      <td
                        key={day}
                        className={`status ${status}`}
                        onClick={() => handleDateClick(employee.id, dateString)}
                      >
                        {status === "full_day_work" && (
                          <TiTick style={{fontSize:"150%"}} />
                        )}
                        {status === "half_day_work" && <Clock size={20} />}
                        {status === "absence" && <X size={20} />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedDateInfo && (
        <div className="modal">
          <div className="modal-content">
            <h4>Chi tiết ngày làm việc</h4>
            {selectedDateInfo.error ? (
              <p className="error">{selectedDateInfo.error}</p>
            ) : (
              <ul>
                <li>
                  <strong>Giờ vào làm:</strong> {selectedDateInfo.checkInTime}
                </li>
                <li>
                  <strong>Giờ ra về:</strong> {selectedDateInfo.checkOutTime}
                </li>
                <li>
                  <strong>Khoảng thời gian:</strong> {selectedDateInfo.duration}
                </li>
              </ul>
            )}
            <button className="close-btn" onClick={closeDateInfo}>
              <ImCross />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
