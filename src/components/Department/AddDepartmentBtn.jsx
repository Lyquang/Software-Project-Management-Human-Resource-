import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_ROUTES } from "../../api/apiRoutes";

export const AddDepartmentBtn = ({ setDepartments, children }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    manager_id: "",
  });

  const token = localStorage.getItem("token");

  const openForm = () => {
    setShowForm(true);
    setFormData({ name: "", manager_id: "" });
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({ name: "", manager_id: "" });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const createDepartment = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: formData.name };
      if (formData.manager_id.trim())
        payload.manager_id = formData.manager_id.trim();

      const response = await axios.post(API_ROUTES.DEPARTMENT.CREATE, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.result) {
        setDepartments((prev) => [...prev, response.data.result]);
        toast.success("Department created successfully!");
      }

      closeForm();
    } catch (err) {
      toast.error("Failed to create department!");
      console.error(err);
    }
  };

  return (
    <div className="relative mt-4">
      {/* Add Button */}
      <div onClick={openForm} className="inline-block cursor-pointer">
        {children || (
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            ➕ Add Department
          </button>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  🏢 Create New Department
                </h2>
                <button
                  onClick={closeForm}
                  className="text-gray-500 hover:text-red-500 transition"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={createDepartment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    placeholder="Enter department name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager ID
                  </label>
                  <input
                    type="text"
                    name="manager_id"
                    value={formData.manager_id}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    placeholder="Optional"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};
