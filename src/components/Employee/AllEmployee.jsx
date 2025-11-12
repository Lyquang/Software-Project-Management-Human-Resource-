import React, { useState, useEffect, useContext } from "react";
import EmployeeCard from "./EmployeeCard";
import { AddPersonel } from "./AddPersonel";
import { FiFilter } from "react-icons/fi";
import { ThemeContext } from "../../context/ThemeContext";
import Loading from "../Loading/Loading";
import "../../index.css";
import { API_ROUTES } from "../../api/apiRoutes";
import axiosInstance from "../../api/axiosInstance";
import Pagination from "../common/Pagination";

function AllEmployee() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Temporary inputs (before submitting)
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [tempDepartment, setTempDepartment] = useState("All");
  const [tempGender, setTempGender] = useState("All");
  const [tempRole, setTempRole] = useState("All");

  // Applied filters (used in API)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");

  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8;
  const { theme } = useContext(ThemeContext);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          API_ROUTES.PERSONNELS.GET_SEARCH_FILLTER(
            currentPage,
            itemsPerPage,
            searchTerm,
            selectedRole,
            selectedGender,
            selectedDepartment
          )
        );
        const result = response.data.result || {};
        setEmployees(result.data || []);
        setTotalPages(result.totalPages || 1);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to fetch employees. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [
    currentPage,
    searchTerm,
    selectedRole,
    selectedGender,
    selectedDepartment,
  ]);

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="text-center text-red-500 text-lg py-10">{error}</div>
    );

  const genderOptions = ["All", "MALE", "FEMALE"];
  const roleOptions = ["All", "MANAGER", "EMPLOYEE"];

  const departmentOptions = [
    "All",
    ...new Set(employees.map((e) => e.departmentName || "Not Assigned")),
  ];

  // Handle submit
  const handleApplyFilters = () => {
    setSearchTerm(tempSearchTerm);
    setSelectedDepartment(tempDepartment);
    setSelectedGender(tempGender);
    setSelectedRole(tempRole);
    setCurrentPage(1);
  };

  return (
    <div className={`min-h-screen py-8 px-6 transition-colors duration-300`}>
      {/* Header: Title + Add Button */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">All Employees</h2>
        <AddPersonel />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 mb-6">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] max-w-[400px]">
          <input
            type="text"
            placeholder="Search employee..."
            value={tempSearchTerm}
            onChange={(e) => setTempSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none placeholder-gray-400 text-gray-700"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z"
            />
          </svg>
        </div>

        {/* Filter Button */}
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200"
          >
            <FiFilter className="text-lg text-gray-500" />
            <span className="font-medium">Filter</span>
          </button>

          {/* Apply Button */}
          <button
            onClick={handleApplyFilters}
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Department */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Department
              </label>
              <input
                value={tempDepartment}
                onChange={(e) => setTempDepartment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              ></input>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Gender
              </label>
              <select
                value={tempGender}
                onChange={(e) => setTempGender(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              >
                {genderOptions.map((g, idx) => (
                  <option key={idx} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Role */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Role
              </label>
              <select
                value={tempRole}
                onChange={(e) => setTempRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              >
                {roleOptions.map((r, idx) => (
                  <option key={idx} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Employee List */}
      {employees.length === 0 ? (
        <div className="text-center text-lg">No employees found.</div>
      ) : (
        <>
          <EmployeeCard employees={employees} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}

export default AllEmployee;
