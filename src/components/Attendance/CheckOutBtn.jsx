import React from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import "./EmployeeAttendance.scss";
import axios from "axios";

export const CheckOutBtn = ({ employeeCode, onSuccess }) => {
  const handleCheckOut = async () => {
    try {
      await axios.post(`http://localhost:8080/api/attendance/checkOut`, null, {
        params: { code: employeeCode },
      });
      toast.success("You have successfully checked out!");
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err.response?.data?.code === 2002) {
        toast.info(err.response?.data?.message);
      } else {
        toast.info(
          err.response?.data?.message || "Check-in failed. Please try again."
        );
      }
    }
  };
  return (
    <button onClick={handleCheckOut} className="check-out">
      Check-Out
    </button>
  );
};
