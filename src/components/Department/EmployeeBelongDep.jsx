import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { API_ROUTES } from "../../api/apiRoutes";
import { X } from "lucide-react";
import AssignPersonel from "../Employee/AssignPersonel";

export const EmployeeBelongDep = ({ departmentId, children }) => {
  const [show, setShow] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [manager, setManager] = useState(null);
  const [departmentName, setDepartmentName] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => setShow(false);

  const handleShow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in again.");
      return;
    }

    try {
      const response = await axiosInstance.get(
        API_ROUTES.DEPARTMENT.GET_DEPARTMENT_PERSONNEL(departmentId)
      );

      const result = response.data.result;
      setEmployees(result.employees || []);
      setManager(result.manager || null);
      setDepartmentName(result.department_name || "");
      setShow(true);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching employees:", err);
    }
  };

  return (
    <>
      <div
        onClick={handleShow}
        className="inline-flex items-center gap-2 cursor-pointer text-indigo-600 hover:text-indigo-800 transition"
      >
        {children || (
          <>
            👥 <span className="font-medium">View Employees</span>
          </>
        )}
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">
                Department:{" "}
                <span className="text-indigo-600 font-bold">
                  {departmentName || "Unknown"}
                </span>
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                    <tr>
                      <th className="py-3 px-4 border-b">Role</th>
                      <th className="py-3 px-4 border-b">Employee Code</th>
                      <th className="py-3 px-4 border-b">Name</th>
                      <th className="py-3 px-4 border-b">Gender</th>
                      <th className="py-3 px-4 border-b">Email</th>
                      <th className="py-3 px-4 border-b">Phone</th>
                      <th className="py-3 px-4 border-b">
                        Start Managing Date
                      </th>
                      <th className="py-3 px-4 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Manager Row */}
                    {manager && (
                      <tr className="bg-green-50 hover:bg-green-100 transition">
                        <td className="py-3 px-4 font-semibold text-green-700">
                          Manager
                        </td>
                        <td className="py-3 px-4">{manager.code}</td>
                        <td className="py-3 px-4">{manager.name}</td>
                        <td className="py-3 px-4">
                          {manager.gender === "MALE" ? "Male" : "Female"}
                        </td>
                        <td className="py-3 px-4">{manager.email}</td>
                        <td className="py-3 px-4">{manager.phone}</td>
                        <td className="py-3 px-4">
                          {manager.manageDate || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <AssignPersonel
                            empCode={manager.code}
                            role={"MANAGER"}
                          />
                        </td>
                      </tr>
                    )}

                    {/* Employees */}
                    {employees.length > 0 ? (
                      employees.map((emp, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 border-t border-gray-100"
                        >
                          <td className="py-3 px-4 text-gray-600">Employee</td>
                          <td className="py-3 px-4">{emp.code}</td>
                          <td className="py-3 px-4">{emp.name}</td>
                          <td className="py-3 px-4">
                            {emp.gender === "MALE" ? "Male" : "Female"}
                          </td>
                          <td className="py-3 px-4">{emp.email}</td>
                          <td className="py-3 px-4">{emp.phone}</td>
                          <td className="py-3 px-4 text-gray-400">—</td>
                          <td className="py-3 px-4">
                            <AssignPersonel
                              empCode={emp.code}
                              role={"EMPLOYEE"}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="py-4 px-4 text-center text-gray-500"
                          colSpan="7"
                        >
                          No employees found in this department.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleClose}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
