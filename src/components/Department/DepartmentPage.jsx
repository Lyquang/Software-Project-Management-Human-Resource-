import React, { useEffect, useState } from "react";
import { AddDepartmentBtn } from "./AddDepartmentBtn";
import DepartmentCard from "./DepartmentCard";
import axios from "../utils/axiosCustomize";
import "bootstrap/dist/css/bootstrap.min.css";
import { MdAddHomeWork } from "react-icons/md";
import "../../index.css";
import Loading from "../Loading/Loading";
import { API_ROUTES } from "../../api/apiRoutes";
import axiosInstance from "../../api/axiosInstance";
const DepartmentPage = () => {
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

useEffect(() => {
  const fetchDepartmentsWithManagers = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found. Please log in again.");
        setLoading(false);
        return;
      }

      // const response = await axios.get("http://localhost:8080/ems/departments/all", {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      // const response = await axios.get(API_ROUTES.DEPARTMENT.GET_ALL);
      const response = await axiosInstance.get(API_ROUTES.DEPARTMENT.GET_ALL);

      console.log("Fetched departments with managers:", response.data);







      if (response.data && Array.isArray(response.data.result)) {
        setDepartments(response.data.result);
        console.log("all department", response.data.result)
        console.log("API Response all department:", departments);
      } else {
        setError("Invalid API response format.");
     
      }
    } catch (err) {
      setError("Failed to fetch departments. Please try again later.");
      console.error("Error fetching departments:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchDepartmentsWithManagers();
}, []);


  if (loading) return <Loading />;
  if (error)
    return (
      <div className="text-center text-red-500 text-lg py-10">{error}</div>
    );

  const totalPages = Math.ceil(departments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage; //6 12
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // 0 12
  const currentDepartment = departments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className="container py-4">
      <div className="row align-items-center mb-4">
        <div className="col">
          <h2 className="mb-0">All Departments</h2>
        </div>
        <div className="col-auto">
          <AddDepartmentBtn setDepartments={setDepartments}>
            <MdAddHomeWork style={{ fontSize: "1.5rem" }} />
          </AddDepartmentBtn>
        </div>
      </div>
      {departments.length === 0 ? (
        <h1> No Department founds</h1>
      ) : (
        <>
          <div className="row">
            {currentDepartment.map((department) => (
              <DepartmentCard
                key={department.department_id}
                department={department}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <nav className="d-flex justify-content-center mt-4">
            <ul className="pagination">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
};

export default DepartmentPage;
