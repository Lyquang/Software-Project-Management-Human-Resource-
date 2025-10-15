import React, { useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { API_ROUTES } from "../../api/apiRoutes";
import axiosInstance from "../../api/axiosInstance";

export const EmployeeBelongDep = ({ departmentId, children }) => {
  const [show, setShow] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [manager, setManager] = useState(null);
  const [departmentName, setDepartmentName] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => setShow(false);

  const handleShow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in again.");
      return;
    }

    try {
      // const response = await axios.get(
      //  API_ROUTES.DEPARTMENT.GET_DEPARTMENT_PERSONNEL(departmentId),
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      const response = await axiosInstance.get(
        API_ROUTES.DEPARTMENT.GET_DEPARTMENT_PERSONNEL(departmentId)
      );
      //       const response = await axiosInstance.get(
      //   API_ROUTES.DEPARTMENT.GET_DEPARTMENT_PERSONNEL(departmentId)
      // );
      console.log("departmentid", departmentId);

      const result = response.data.result;
      setEmployees(result.employees || []);
      setManager(result.manager || null);
      setDepartmentName(result.department_name || "");
      setShow(true);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching employees:", err);
    }
  };

  return (
    <>
      <div onClick={handleShow} style={{ cursor: "pointer" }}>
        <span>{children || "👥 View Employees"}</span>
      </div>

      <Modal show={show} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Department:{" "}
            <span className="text-primary fw-bold">
              {departmentName || "Unknown"}
            </span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
          {error && <div className="text-danger mb-3">Error: {error}</div>}

          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr className="text-left">
                  <th className="border p-2">Role</th>
                  <th className="border p-2">Employee Code</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Gender</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Phone</th>
                  <th className="border p-2">Start Managing Date</th>
                </tr>
              </thead>

              <tbody>
                {/* Manager Row */}
                {manager && (
                  <tr className="bg-green-50">
                    <td className="border p-2 font-semibold text-green-700">
                      Manager
                    </td>
                    <td className="border p-2">{manager.code}</td>
                    <td className="border p-2">{manager.name}</td>
                    <td className="border p-2">
                      {manager.gender === "MALE" ? "Male" : "Female"}
                    </td>
                    <td className="border p-2">{manager.email}</td>
                    <td className="border p-2">{manager.phone}</td>
                    <td className="border p-2">{manager.manageDate || "—"}</td>
                  </tr>
                )}

                {/* Employee Rows */}
                {employees.length > 0 ? (
                  employees.map((emp, index) => (
                    <tr key={index}>
                      <td className="border p-2 text-gray-600">Employee</td>
                      <td className="border p-2">{emp.code}</td>
                      <td className="border p-2">{emp.name}</td>
                      <td className="border p-2">
                        {emp.gender === "MALE" ? "Male" : "Female"}
                      </td>
                      <td className="border p-2">{emp.email}</td>
                      <td className="border p-2">{emp.phone}</td>
                      <td className="border p-2">—</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="border p-2 text-center" colSpan="7">
                      No employees found in this department.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
