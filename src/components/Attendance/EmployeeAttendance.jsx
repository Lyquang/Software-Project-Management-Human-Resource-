import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";      
import "react-toastify/dist/ReactToastify.css";
import "./EmployeeAttendance.scss";
import { CheckInBtn } from "./CheckInBtn";
import { CheckOutBtn } from "./CheckOutBtn";
const EmployeeAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const employeeCode = localStorage.getItem("personelCode");

  const fetchAttendanceData = async (month, year) => {
    setLoading(true);
    setError(null);

    if (!employeeCode) {
      setError("Employee code not found in local storage.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:8080/api/attendance/all/employee",
        {
          params: { code: employeeCode },
        }
      );

      const { code, result } = response.data;
      if (code === 1000) {
        const filteredData = result.filter((attendance) => {
          const attendanceDate = new Date(attendance.date);
          return (
            attendanceDate.getMonth() === month - 1 &&
            attendanceDate.getFullYear() === year
          );
        });
        setAttendanceData(filteredData);
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

  const calculateDurationInMinutes = (duration) => {
    if (!duration) {
      return 0; // Default to 0 if duration is null or undefined
    }
    const [hours, minutes] = duration.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const getDayStatus = (day) => {
    const match = attendanceData.find((attendance) => {
      const attendanceDate = new Date(attendance.date);
      return attendanceDate.getDate() === day;
    });

    if (!match) {
      const today = new Date();
      const isFuture = new Date(selectedYear, selectedMonth - 1, day) > today;
      return isFuture
        ? { color: "silver", text: "" }
        : { color: "#ff4d4f", text: "Absent" };
    }

    const durationMinutes = calculateDurationInMinutes(match.duration);
    let durationStatus = "";
    let color = "";
    console.log("da lam dc bn phut", durationMinutes);
    if (durationMinutes >= 5) {
      durationStatus = "Full Work ";
      color = "#52c41a"; // Green for full work
    } else if (durationMinutes >= 3 && durationMinutes < 5) {
      durationStatus = "Half Work ";
      color = "#faad14"; // Yellow for half work
    } else {
      durationStatus = "Absent";
      color = "#ff4d4f"; // Red for absent
    }

    return { color, text: durationStatus };
  };

  return (
    <div className="container-fluid employee-attendance">
      <ToastContainer />
      <div className="title">My Attendance</div>
      <div className="filters">
        <div className="month-year-text">Month:</div>
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

        <div className="month-year-text">Year:</div>
        <input
          type="number"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        />
      </div>

      <div className="calendar">
        <div className="calendar-row">
          {Array.from(
            { length: new Date(selectedYear, selectedMonth, 0).getDate() },
            (_, i) => i + 1
          ).map((day) => {
            const { color, text } = getDayStatus(day);
            return (
              <div
                key={day}
                className="calendar-day"
                style={{
                  backgroundColor: color,
                margin:"3px",
                  height:"16%",
                  width:"16%",
                  borderRadius: "8px",
                  color: color === "transparent" ? "#000" : "#fff",
                }}
              >
                <div className="day-number">{day}</div>
                <div className="day-status">{text}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="button-group">
        <CheckInBtn
          employeeCode={employeeCode}
          onSuccess={() => fetchAttendanceData(selectedMonth, selectedYear)}
        />
        <CheckOutBtn
          employeeCode={employeeCode}
          onSuccess={() => fetchAttendanceData(selectedMonth, selectedYear)}
        />
      </div>
    </div>
  );
};

export default EmployeeAttendance;
