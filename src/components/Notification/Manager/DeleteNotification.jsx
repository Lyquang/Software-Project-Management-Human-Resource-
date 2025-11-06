import React from "react";
import { API_ROUTES } from "../../../api/apiRoutes";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Trash2 } from "lucide-react";

const DeleteNotification = ({ notificationId, onDeleted }) => {
  const token = sessionStorage.getItem("token");
  const confirmDelete = () => {
    toast.info(
      <div className="text-sm">
        <p className="font-medium text-gray-800 mb-2">
          Are you sure you want to delete this notification?
        </p>
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={() => {
              toast.dismiss(); // close confirm toast
              handleDelete();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs font-medium transition-all"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-xs font-medium transition-all"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        hideProgressBar: true,
        className: "border border-gray-300 shadow-lg rounded-lg p-2",
      }
    );
  };

  const handleDelete = async () => {
    try {
      
      const res = await axios.delete(
        API_ROUTES.MANAGERS.DELETE_NOTIFICATION(notificationId),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.code === 200) {
        toast.success("✅ Notification deleted successfully!");
        if (onDeleted) onDeleted(notificationId);
      } else {
        toast.error("❌ Failed to delete notification.");
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      toast.error("⚠️ Something went wrong while deleting.");
    }
  };

  return (
    <>
      <button
        onClick={confirmDelete}
        className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:scale-105 transition-all duration-200 font-medium"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <ToastContainer position="top-right" />
    </>
  );
};

export default DeleteNotification;
