import React, { useEffect, useState } from "react";
import { MdAddHomeWork } from "react-icons/md";
import { AddDepartmentBtn } from "./AddDepartmentBtn";
import DepartmentCard from "./DepartmentCard";
import Loading from "../Loading/Loading";
import { API_ROUTES } from "../../api/apiRoutes";
import axiosInstance from "../../api/axiosInstance";

const DepartmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchDepartmentsWithManagers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in again.");
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(API_ROUTES.DEPARTMENT.GET_ALL);
      console.log("Fetched departments with managers:", response.data);

      if (response.data && Array.isArray(response.data.result)) {
        setDepartments(response.data.result);
      } else {
        setError("Invalid API response format.");
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to fetch departments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsWithManagers();
  }, []);

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="text-center text-red-600 text-lg font-medium py-10">
        {error}
      </div>
    );

  const totalPages = Math.ceil(departments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDepartment = departments.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Departments</h2>
        <AddDepartmentBtn
          setDepartments={setDepartments}
          onAdded={fetchDepartmentsWithManagers}
        >
        </AddDepartmentBtn>
      </div>

      {/* Departments Grid */}
      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <h3 className="text-lg font-medium">No departments found</h3>
          <p className="text-sm text-gray-400">
            Start by adding a new department above.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentDepartment.map((department) => (
              <DepartmentCard
                key={department.department_id}
                department={department}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm rounded-lg border ${
                  currentPage === 1
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-indigo-600 border-indigo-400 hover:bg-indigo-50"
                } transition-all`}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-200"
                  } transition-all`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm rounded-lg border ${
                  currentPage === totalPages
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-indigo-600 border-indigo-400 hover:bg-indigo-50"
                } transition-all`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DepartmentPage;
