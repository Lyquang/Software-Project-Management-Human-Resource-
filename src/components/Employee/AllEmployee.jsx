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

function AllEmployee() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        const response = await axios.get("http://localhost:8080/ems/personnels/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

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

  const handleSettingClick = (employee) => {
    console.log("Clicked employee:", employee.firstName, employee.lastName);
  };

  if (loading) return <Loading />;
  if (error)
    return <div className="text-center text-red-500 text-lg py-10">{error}</div>;

  return (
    <div
      className={`min-h-screen py-8 px-6 transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
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

      {/* Employee Table */}
      <EmployeeCard employees={employees} />
    </div>
  );
}

export default AllEmployee;
