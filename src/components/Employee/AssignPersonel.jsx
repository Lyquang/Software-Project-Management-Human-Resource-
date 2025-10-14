import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import axiosInstance from "../../api/axiosInstance";
import { API_ROUTES } from "../../api/apiRoutes";

const AssignPersonel = ({ empCode, role }) => {
  const [showForm, setShowForm] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // ✅ Fetch all departments when component mounts
  const fetchDepartmentData = async () => {
    try {
        //lay all department
      const response = await axiosInstance.get(API_ROUTES.DEPARTMENT.GET_ALL);
      const departments = response.data.result || [];
      console.log("Fetched departments:", departments);
      setDepartments(departments);
    } catch (error) {
      console.error("Error fetching department data:", error);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  // ✅ Open the modal
  const openForm = () => {
    setShowForm(true);
  };

  // ✅ Assign employee to selected department
  const handleAssign = async () => {
  
    if (!selectedDepartment) {
      alert("Please select a department first!");
      return;
    }

    try {
      console.log(
        "Assigning:",
        empCode,
        "to department:",
        selectedDepartment,
        "as:",
        role
      );

      if (role === "MANAGER") {
        // Example:
        const response = await axiosInstance.put(
          API_ROUTES.PERSONNELS.ASSIGN_MANAGER(selectedDepartment, empCode)
        );
        console.log("Manager assigned:", response.data);
      } else if (role === "EMPLOYEE") {
        const response = await axiosInstance.put(
          API_ROUTES.PERSONNELS.ASSIGN_EMPLOYEE(selectedDepartment, empCode)
        );
        console.log("depid", selectedDepartment);
        console.log("Assign success:", response.data);
      }

      alert("Employee assigned successfully!");
      setShowForm(false);
    } catch (error) {
      console.error("Error assigning employee:", error);
      alert("Failed to assign employee.");
    }
  };

  return (
    <>
      {/* 👁️ Button to open form */}
      <button
        onClick={openForm}
        className="text-gray-500 hover:text-blue-600 transition"
        title="Assign Into Department"
      >
        <Eye size={18} />
      </button>

      {/* 🧾 Modal Form */}
      {showForm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Employee to Department</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowForm(false)}
                >
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <p>
                  Employee code: <strong>{empCode}</strong>
                </p>
                <p>
                  Role: <strong>{role}</strong>
                </p>

                {/* 🏢 Department Dropdown */}
                <div className="form-group mt-3">
                  <label htmlFor="departmentSelect">Select Department</label>
                  <select
                    id="departmentSelect"
                    className="form-control"
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    <option value="">-- Choose Department --</option>
                    {departments.map((dep) => (
                      <option key={dep.department_id} value={dep.department_id}>
                        {dep.department_name || `Department ${dep.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAssign}
                >
                  Confirm Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignPersonel;
