import React, { useState } from "react";
import axios from "axios";
import { CheckCircle, Loader2 } from "lucide-react";
import { API_ROUTES } from "../../../api/apiRoutes";

const MarkAsRead = ({ notificationId, isRead, onMarkAsRead }) => {
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("token");

  const handleMarkAsRead = async () => {
    if (isRead) return; // Đã đọc thì bỏ qua
    setLoading(true);
    try {
      const res = await axios.post(
        API_ROUTES.PERSONNELS.MARK_NOTIFICATION_AS_READ(notificationId),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.code === 200) {
        onMarkAsRead?.(notificationId); // gọi callback từ cha
      }
    } catch (err) {
      console.error("Error marking as read:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleMarkAsRead}
      disabled={loading || isRead}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm transition-all duration-200 ${
        isRead
          ? "bg-green-100 text-green-700 border border-green-300 cursor-default"
          : "bg-blue-500 hover:bg-blue-600 text-white"
      }`}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : isRead ? (
        <>
          <CheckCircle size={16} />
          Read
        </>
      ) : (
        "Mark as Read"
      )}
    </button>
  );
};

export default MarkAsRead;
