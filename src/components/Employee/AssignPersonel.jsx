import React, { useState, useEffect } from "react";
import { MdAssignment } from "react-icons/md";
import { X } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { API_ROUTES } from "../../api/apiRoutes";
import { ToastContainer, toast } from "react-toastify";

const AssignPersonel = ({ empCode, role }) => {
  const [showForm, setShowForm] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get(API_ROUTES.DEPARTMENT.GET_ALL);
        setDepartments(response.data.result || []);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  // ✅ Assign employee
  const handleAssign = async () => {
    if (!selectedDepartment) {
      // alert("Please select a department first!");
      toast.error("Please select a department first!");
      return;
    }

    try {
      setLoading(true);
      if (role === "MANAGER") {
        await axiosInstance.put(
          API_ROUTES.PERSONNELS.ASSIGN_MANAGER(selectedDepartment, empCode)
        );
      } else if (role === "EMPLOYEE") {
        await axiosInstance.put(
          API_ROUTES.PERSONNELS.ASSIGN_EMPLOYEE(selectedDepartment, empCode)
        );
      }

      // alert("Employee assigned successfully!");
      toast.success("Employee assigned successfully!");
      setShowForm(false);
    } catch (error) {
      console.error("Error assigning employee:", error);
      toast.error("Failed to assign employee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🧩 Trigger Button */}
      <button
        onClick={() => setShowForm(true)}
        className="text-gray-500 hover:text-indigo-600 transition"
        title="Assign into Department"
      >
        <MdAssignment size={22} />
      </button>

      {/* 🪟 Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up border border-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-500 text-white">
              <h2 className="text-lg font-semibold tracking-wide">
                Assign Employee to Department
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-full hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600">
                  Employee Code:
                  <span className="ml-2 font-semibold text-gray-900">
                    {empCode}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Role:
                  <span className="ml-2 font-semibold text-indigo-600">
                    {role}
                  </span>
                </p>
              </div>

              <div>
                <label
                  htmlFor="departmentSelect"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Select Department
                </label>
                <select
                  id="departmentSelect"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((dep) => (
                    <option key={dep.department_id} value={dep.department_id}>
                      {dep.department_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={loading}
                className={`px-5 py-2.5 rounded-lg text-white font-medium transition ${
                  loading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {loading ? "Assigning..." : "Confirm Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </>
  );
};

export default AssignPersonel;
