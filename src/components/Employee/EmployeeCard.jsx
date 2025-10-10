import React from "react";
import DefaultPhoto from "../assets/default_ava2.webp";
import { Eye, Edit, Trash2 } from "lucide-react";

const statusColorMap = {
  Active: "bg-green-100 text-green-800 border border-green-300",
  Paused: "bg-pink-100 text-pink-800 border border-pink-300",
  Vacation: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  Default: "bg-gray-100 text-gray-700 border border-gray-300",
};

const EmployeeCard = ({ employees, onDelete, onViewDetail, onEdit }) => {
  if (!employees || employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <img
          src="https://cdn-icons-png.flaticon.com/512/4076/4076505.png"
          alt="No employees"
          className="w-24 h-24 mb-4 opacity-70"
        />
        <p className="text-lg font-medium">No employees found</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white text-gray-800 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">NAME</th>
              <th className="px-4 py-3 text-left font-semibold">ROLE</th>
              <th className="px-4 py-3 text-left font-semibold">STATUS</th>
              <th className="px-4 py-3 text-left font-semibold">ACTIONS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {employees.map((emp, index) => {
              const statusClass =
                statusColorMap[emp.status] || statusColorMap.Default;
              return (
                <tr
                  key={emp.code || index}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  {/* NAME */}
                  <td className=" py-3 flex items-center gap-3">
                    <img
                      src={emp.avatarUrl || DefaultPhoto}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{emp.email}</p>
                    </div>
                  </td>

                  {/* ROLE */}
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">
                      {emp.role || "Employee"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {emp.department || "—"}
                    </p>
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}
                    >
                      {emp.status || "Active"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => onViewDetail?.(emp)}
                        className="text-gray-500 hover:text-blue-600 transition"
                        title="View details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit?.(emp)}
                        className="text-gray-500 hover:text-yellow-600 transition"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDelete?.(emp)}
                        className="text-gray-500 hover:text-red-600 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeCard;
