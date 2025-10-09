
import React, { useState, useEffect } from "react";
import axios from "axios";
import EmployeeCard from "./EmployeeCard";
import "bootstrap/dist/css/bootstrap.min.css";
import { AddPersonel } from "./AddPersonel";
import { AssignEmployeeBtn } from "./AssignEmployeeBtn";
import { IoMdPersonAdd } from "react-icons/io";
import { MdAssignment } from "react-icons/md";
import { ThemeContext } from "../../ThemeContext";
import { useContext } from "react";
import "./AllEmployee.css"
import "../../index.css"
import Loading from "../Loading/Loading";

function AllEmployee() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { theme } = useContext(ThemeContext);

useEffect(() => {
  const fetchEmployees = async () => {
    try {
      // ✅ Lấy token từ localStorage (sau khi login bạn phải lưu token vào đây)
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found. Please log in again.");
        setLoading(false);
        return;
      }

      // ✅ Gửi token trong header Authorization
      const response = await axios.get("http://localhost:8080/ems/personnels/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("API Response:", response.data);
      const data = response.data.result || [];
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


  const handleSettingClick = (employee) => {
    console.log("employee gà vcccc:", employee.lastName, employee.firstName);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  if (loading)
    return <Loading />;
  if (error)
    return <div className="text-center text-red-500 text-lg py-10">{error}</div>;

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen container-bg">


      <div className="row align-items-center mb-4">
        <div className="col">
          <h2 className="mb-0">All Employees </h2>
          {/* <h1>Chế độ hiện tại: {theme.toUpperCase()}</h1> */}
        </div>
        <div className="col-auto">
          <AssignEmployeeBtn refresh={() => window.location.reload()}>
            <MdAssignment />
          </AssignEmployeeBtn>
        </div>
        <div className="col-auto">
          <AddPersonel>
            <IoMdPersonAdd />
          </AddPersonel>
        </div>
      </div>

      {employees.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No employees found.</p>) 
        : (
        <>
          <div className="row row-cols-1 row-cols-md-2 g-4 ">
            {currentEmployees.map((employee, index) => (
              <div
                className="col"
                key={employee.code || index}
                style={{ "--animation-delay": `${index * 0.2}s` }}
              >
                <EmployeeCard
                  employee={employee}
                  onSettingClick={() => handleSettingClick(employee)}
                  index={index}
                />
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <nav className="d-flex justify-content-center mt-4">
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                >
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}

export default AllEmployee;

