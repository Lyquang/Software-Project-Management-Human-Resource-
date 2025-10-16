import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { IoIosPeople } from "react-icons/io";
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
            department.department_id
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
  }, [department.department_id]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {department.department_name || "Unnamed Department"}
        </h3>

        <div className="flex gap-3">
          <EmployeeBelongDep departmentId={department.department_id}>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition">
              View All
            </button>
          </EmployeeBelongDep>
          {/* <DeleteDepartmentBtn departmentId={department.department_id}>
            <MdDelete
              size={18}
              className="text-red-500 hover:text-red-700 cursor-pointer transition"
            />
          </DeleteDepartmentBtn> */}
        </div>
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
                    {"Employee"} - {emp.position || "No Position"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* <IoIosPeople className="text-gray-400 hover:text-indigo-600 transition" /> */}
                <AssignPersonel empCode={emp.code} role={"EMPLOYEE"} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm italic">No members yet</p>
        )}
      </div>

      {/* Footer (Manager + Actions) */}
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
            <p className="text-sm text-gray-500 bg-red">Manager</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* <IoIosPeople className="text-gray-400 hover:text-indigo-600 transition" /> */}
          <AssignPersonel empCode={manager.code} role={"MANAGER"} />
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;
