import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import EmployeeCard from "../Employee/EmployeeCard";

export const EmployeeBelongDep = ({ departmentId, children }) => {
  const [show, setShow] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const handleClose = () => setShow(false);

  const handleShow = async () => {
    try {
      const response = await axios.get("http://localhost:8080/ems/employee/department", {
        params: { id: departmentId },
      });

      setEmployees(response.data.result.employees);
      setShow(true);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching employees:", err);
    }
  };

  return (
    <>
      <div onClick={handleShow} style={{ cursor: "pointer" }}>
        <span>{children || "👥 Xem nhân viên"}</span>
      </div>

      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nhân viên trong phòng ban</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "300%", overflowY: "auto" }}>
          {error && <div className="text-danger">Lỗi: {error}</div>}
          {employees.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-2 g-4">
              {employees.map((employee, index) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  index={index}
                  onSettingClick={() => {}}
                />
              ))}
            </div>
          ) : (
            <div>Không có nhân viên nào.</div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};
