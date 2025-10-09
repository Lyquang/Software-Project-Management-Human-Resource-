import React, { useState, useEffect } from "react";
import "./EmployeeNotification.scss";
import axios from "axios";

export const MarkAsReadBtn = ({ notificationId, fetchNotifications ,setNotifications }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      const personelCode = localStorage.getItem("personelCode");
      const token = localStorage.getItem("token");

      if (!personelCode || !token) {
        throw new Error("personel code or token not found");
      }

      await axios.post(
        `http://localhost:8080/api/notifications/${notificationId}/mark`,
        null,
        {
          params: { personnelId: personelCode },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      fetchNotifications();
    } catch (err) {
      console.error("Error marking notification as read:", err);
      setError(err.message);
    }
  };
  return (
    <div>
      <button
        className="mark-read-button"
        onClick={() => markAsRead(notificationId)}
      >
        Đánh dấu đã đọc
      </button>
    </div>
  );
};
