import React, { useState } from "react";
import DefaultPhoto from "../assets/default_ava2.webp";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { FaMale, FaFemale } from "react-icons/fa";
import DeletePersonel from "./DeletePersonel";
import AssignPersonel from "./AssignPersonel";

const EmployeeCard = ({ employees, onDelete, onEdit }) => {
  // Define all possible columns and their labels
  const allColumns = {
    avatarName: "Name",
    code: "Code",
    gender: "Gender",
    department: "Department",
    role: "Role",
    position: "Position",
    actions: "Actions",
  };

  // Columns visible by default
  const [visibleColumns, setVisibleColumns] = useState(Object.keys(allColumns));

  const toggleColumn = (column) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

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
      {/* === Column Selection Dropdown === */}
      <div className="flex justify-end mb-3">
        <details className="relative">
          <summary className="cursor-pointer px-4 py-2 bg-gray-100 border rounded-lg text-sm font-medium hover:bg-gray-200">
            ⚙️ Select Columns
          </summary>
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
            {Object.entries(allColumns).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(key)}
                  onChange={() => toggleColumn(key)}
                  className="mr-2 accent-blue-600"
                />
                {label}
              </label>
            ))}
          </div>
        </details>
      </div>

      {/* === Employee Table === */}
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {visibleColumns.includes("avatarName") && (
                <th className="px-4 py-3 text-left font-semibold">
                  {allColumns.avatarName}
                </th>
              )}
              {visibleColumns.includes("code") && (
                <th className="px-4 py-3 text-left font-semibold">
                  {allColumns.code}
                </th>
              )}
              {visibleColumns.includes("gender") && (
                <th className="px-4 py-3 text-left font-semibold">
                  {allColumns.gender}
                </th>
              )}
              {visibleColumns.includes("department") && (
                <th className="px-4 py-3 text-left font-semibold">
                  {allColumns.department}
                </th>
              )}
              {visibleColumns.includes("role") && (
                <th className="px-4 py-3 text-left font-semibold">
                  {allColumns.role}
                </th>
              )}
              {visibleColumns.includes("position") && (
                <th className="px-4 py-3 text-left font-semibold">
                  {allColumns.position}
                </th>
              )}
              {visibleColumns.includes("actions") && (
                <th className="px-4 py-3 text-left font-semibold">
                  {allColumns.actions}
                </th>
              )}
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
                  {/* AVATAR + NAME */}
                  {visibleColumns.includes("avatarName") && (
                    <td className="px-4 py-3 flex items-center gap-3">
                      <img
                        src={emp.avatarUrl || DefaultPhoto}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover border border-gray-300"
                      />
                      <div className="font-semibold text-gray-900">
                        {emp.firstName} {emp.lastName}
                      </div>
                    </td>
                  )}

                  {/* CODE */}
                  {visibleColumns.includes("code") && (
                    <td className="px-4 py-3 text-gray-700">
                      {emp.code || "—"}
                    </td>
                  )}

                  {/* GENDER */}
                  {visibleColumns.includes("gender") && (
                    <td className="px-4 py-3 text-gray-700">
                      {GenderIcon && (
                        <div className="flex items-center gap-1">
                          <GenderIcon
                            className={`${
                              emp.gender === "MALE"
                                ? "text-blue-500"
                                : "text-pink-500"
                            }`}
                          />
                          <span>{emp.gender}</span>
                        </div>
                      )}
                    </td>
                  )}

                  {/* DEPARTMENT */}
                  {visibleColumns.includes("department") && (
                    <td className="px-4 py-3 text-gray-800">
                      {emp.departmentName || "Not Assigned"}
                    </td>
                  )}

                  {/* ROLE */}
                  {visibleColumns.includes("role") && (
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold inline-block px-2 py-1 rounded-full text-sm ${
                          emp.role === "MANAGER"
                            ? "bg-red-100 text-red-700"
                            : emp.role === "EMPLOYEE"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {emp.role || "—"}
                      </span>
                    </td>
                  )}

                  {/* EMAIL */}
                  {visibleColumns.includes("position") && (
                    <td className="px-4 py-3 text-gray-700">
                      {emp.position || "—"}
                    </td>
                  )}

                  {/* ACTIONS */}

                  {visibleColumns.includes("actions") && (
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <AssignPersonel empCode={emp.code} role={emp.role} />
                        <button
                          onClick={() => onEdit?.(emp)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="View Detail"
                        >
                          <IoIosInformationCircleOutline size={20} />
                        </button>
                        <DeletePersonel
                          empCode={emp.code}
                          onDeleted={onDelete}
                        />
                      </div>
                    </td>
                  )}
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
