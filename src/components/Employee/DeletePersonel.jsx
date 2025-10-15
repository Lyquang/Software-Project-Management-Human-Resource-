import React, { useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { API_ROUTES } from "../../api/apiRoutes"; // 👈 import file route

const DeletePersonel = ({ empCode, onDeleted }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete personnel ${empCode}?`
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      await axios.delete(API_ROUTES.PERSONNELS.DELETE(empCode), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });


    alert("✅ Personnel deleted successfully!");
    window.location.reload()
      onDeleted?.(empCode);
    } catch (error) {
      console.error("❌ Error deleting personnel:", error);
      alert("❌ Failed to delete personnel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default DeletePersonel;
