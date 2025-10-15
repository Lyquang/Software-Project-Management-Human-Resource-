// src/components/EmployeeAttendance/AttendanceCard.jsx
import React from "react";
import PropTypes from "prop-types";

// Định nghĩa các biến thể màu sắc bằng Tailwind classes
const styleVariants = {
  total: {
    bg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  present: {
    bg: "bg-green-100",
    iconColor: "text-green-600",
  },
  late: {
    bg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  absent: {
    bg: "bg-red-100",
    iconColor: "text-red-600",
  },
  average: {
    bg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
};

const AttendanceCard = ({ icon, value, title, variant = "total" }) => {
  const styles = styleVariants[variant];

  return (
    <div className={`p-6 rounded-xl ${styles.bg}`}>
      <div className={`text-3xl mb-4 ${styles.iconColor}`}>{icon}</div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-base text-gray-500 font-medium">{title}</div>
    </div>
  );
};

AttendanceCard.propTypes = {
  icon: PropTypes.element.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["total", "present", "late", "absent", "average"]).isRequired,
};

export default AttendanceCard;