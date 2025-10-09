import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import "./EmployeeAttendance.scss";
import axios from "axios";

export const CheckInBtn = ({ employeeCode, onSuccess }) => {
  const handleCheckIn = async () => {
    try {
      await axios.post(`http://localhost:8080/api/attendance/checkIn`, null, {
        params: { code: employeeCode },
      });
      toast.success("You have successfully checked in!");
      if (onSuccess) onSuccess();

      // alert("Check-in successful!");
      //  fetchAttendanceData(selectedMonth, selectedYear);
    } catch (err) {
      if (err.response?.data?.code === 2002) {
        toast.info(err.response?.data?.message);
      } else {  
        toast.info(err.response?.data?.message || "Check-in failed. Please try again.");
      }
    }
  };
  return (
    <button onClick={handleCheckIn} className="check-in">
      Check-In
    </button>
  );
};

//   <CheckInBtn employeeCode={employeeCode}  onCheckSuccess={() => fetchAttendanceData(selectedMonth, selectedYear)} />
//           <CheckOutBtn employeeCode={employeeCode}/>
