import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import EmployeeCard from "./EmployeeCard";
import { AddPersonel } from "./AddPersonel";
import { AssignEmployeeBtn } from "./AssignEmployeeBtn";
import { IoMdPersonAdd } from "react-icons/io";
import { MdAssignment } from "react-icons/md";
import { ThemeContext } from "../../ThemeContext";
import Loading from "../Loading/Loading";
import "../../index.css";
import { API_ROUTES } from "../../api/apiRoutes";
import axiosInstance from "../../api/axiosInstance";

function AllEmployee() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in again.");
          setLoading(false);
          return;
        }

// đã thêm sẵn token ơn axiosInstance  /src/api/axiosInstance.js
        const response = await axiosInstance.get(API_ROUTES.PERSONNELS.GET_ALL);

        const data = response.data.result || [];
        console.log("Fetched employees:", data);
        setEmployees(data);
      } catch (err) {
        setError("Failed to fetch employees. Please try again later.");
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="text-center text-red-500 text-lg py-10">{error}</div>
    );

  return (
    <div className={`min-h-screen py-8 px-6 transition-colors duration-300`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">All Employees</h2>
        <div className="flex space-x-3">
          <AssignEmployeeBtn refresh={() => window.location.reload()}>
            <MdAssignment className="w-6 h-6" />
          </AssignEmployeeBtn>
          <AddPersonel>
            <IoMdPersonAdd className="w-6 h-6" />
          </AddPersonel>
        </div>
      </div>

      {/* Employee List */}
      {employees.length === 0 ? (
        <div className="text-center text-lg">No employees found.</div>
      ) : (
        <>
          <EmployeeCard employees={currentEmployees} />

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6">
            <ul className="flex space-x-2">
              {/* Previous Button */}
              <li>
                <button
                  className={`px-4 py-2 rounded ${
                    currentPage === 1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
              </li>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i}>
                  <button
                    className={`px-4 py-2 rounded ${
                      currentPage === i + 1
                        ? "bg-blue-700 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}

              {/* Next Button */}
              <li>
                <button
                  className={`px-4 py-2 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default AllEmployee;
