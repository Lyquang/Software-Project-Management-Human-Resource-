import React, { useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { API_ROUTES } from "../../api/apiRoutes"; // 👈 import file route
import { ToastContainer, toast } from "react-toastify";

const DeletePersonel = ({ empCode, onDeleted }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete personnel ${empCode}?`
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.delete(API_ROUTES.PERSONNELS.DELETE(empCode), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("✅ Personnel deleted successfully!");
      onDeleted?.(empCode);
      // window.location.reload();
    } catch (error) {
      console.error("❌ Error deleting personnel:", error);

      // Lấy message chi tiết từ backend
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "❌ Failed to delete personnel. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={loading}
        className={`text-gray-500 hover:text-red-600 transition ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        title="Delete"
      >
        <Trash2 size={18} color="red" />
      </button>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
};

export default DeletePersonel;
