import React from "react";
import DefaultPhoto from "../assets/default_ava2.webp";
import { Eye, Edit, Trash2 } from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";
import DeletePersonel from "./DeletePersonel";

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
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">NAME / CODE</th>
              <th className="px-4 py-3 text-left font-semibold">EMAIL / PHONE</th>
              <th className="px-4 py-3 text-left font-semibold">ROLE</th>
              <th className="px-4 py-3 text-left font-semibold">CITY</th>
              <th className="px-4 py-3 text-left font-semibold">ACTIONS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {employees.map((emp, index) => {
              const GenderIcon =
                emp.gender === "MALE"
                  ? FaMale
                  : emp.gender === "FEMALE"
                  ? FaFemale
                  : null;
              return (
                <tr
                  key={emp.code || index}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  {/* NAME + CODE */}
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img
                      src={emp.avatarUrl || DefaultPhoto}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border border-gray-300"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">
                          {emp.firstName} {emp.lastName}
                        </p>
                        {GenderIcon && (
                          <GenderIcon
                            className={`${
                              emp.gender === "MALE"
                                ? "text-blue-500"
                                : "text-pink-500"
                            } text-sm`}
                          />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Code: {emp.code || "—"}
                      </p>
                    </div>
                  </td>

                  {/* EMAIL + PHONE */}
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">
                      {emp.email || "—"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {emp.phoneNumber || "—"}
                    </p>
                  </td>

                  {/* ROLE */}
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800 bg-blue-100 inline-block px-2 py-1 rounded-full text-sm">
                      {emp.role || "Not Assigned"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {emp.position || "No Position"}
                    </p>
                  </td>

                  {/* CITY */}
                  <td className="px-4 py-3 ">
                    <p className="text-sm text-gray-700">{emp.city || "—"}</p>
                      <p className="text-sm text-gray-700">{emp.street|| "—"}</p>
                    
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
                      <DeletePersonel empCode={emp.code} onDeleted={onDelete} />

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
