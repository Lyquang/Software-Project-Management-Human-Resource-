import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import DeleteDepartmentBtn from "./DeleteDepartmentBtn";
import { EmployeeBelongDep } from "./EmployeeBelongDep";
import DefaultAvatar from "../assets/defaut_pho.png";
import { API_ROUTES } from "../../api/apiRoutes";
import axiosInstance from "../../api/axiosInstance";
import AssignPersonel from "../Employee/AssignPersonel";

const DepartmentCard = ({ department }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const manager = department.manager || {};

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get(
          API_ROUTES.DEPARTMENT.GET_DEPARTMENT_PERSONNEL(
            department.departmentId
          )
        );
        if (response.data && response.data.result) {
          setEmployees(response.data.result.employees || []);
        }
      } catch (error) {
        console.error("Failed to fetch employees for department:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [department.departmentId]);

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {department.departmentName || "Unnamed Department"}
        </h3>
        <EmployeeBelongDep departmentId={department.departmentId}>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition">
            View All
          </button>
        </EmployeeBelongDep>
      </div>

      {/* Sub-info */}
      <p className="text-sm text-gray-500 mb-3">{employees.length} Members</p>

      {/* Employee List */}
      <div className="flex flex-col gap-3 mb-3">
        {loading ? (
          <p className="text-gray-400 text-sm italic">Loading members...</p>
        ) : employees.length > 0 ? (
          employees.slice(0, 3).map((emp, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 py-1 transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={emp.avatar || DefaultAvatar}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-gray-800 text-sm font-medium leading-tight">
                    {emp.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Employee - {emp.position || "No Position"}
                  </p>
                </div>
              </div>
              <AssignPersonel empCode={emp.code} role={"EMPLOYEE"} />
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm italic">No members yet</p>
        )}
      </div>

      {/* Footer (Manager + Delete Button) */}
      <div className="border-t pt-3 mt-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={manager.avatar || DefaultAvatar}
            alt="Manager Avatar"
            className="w-9 h-9 rounded-full object-cover border border-gray-300"
          />
          <div>
            <p className="text-sm font-medium text-gray-800">
              {manager.name || "No Manager"}
            </p>
            <p className="text-sm text-gray-500">Manager</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AssignPersonel empCode={manager.code} role={"MANAGER"} />
          <DeleteDepartmentBtn departmentId={department.departmentId}>
            <MdDelete
              title="Delete this Department"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
              size={20}
              className="text-red-500 hover:text-red-700 cursor-pointer transition ml-1"
            />
          </DeleteDepartmentBtn>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;
