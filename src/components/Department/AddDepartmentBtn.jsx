import React from "react";
import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AddDepartmentBtn = ({ setDepartments, children }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    managerId: "",
  });
  const [error, setError] = useState(null);

  const openForm = () => {
    setShowForm(true);
    setFormData({
      name: "",
      managerId: "",
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({
      name: "",
      managerId: "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const createDepartment = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        departmentName: formData.name,
        managerId: formData.managerId ? Number(formData.managerId) : null, // Ensure managerId is numeric or null
      };

      const response = await axios.post(
        "http://localhost:8080/api/departments/create",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response && response.data && response.data.result) {
        // Add the newly created department to the state
        setDepartments((prevDepartments) => [
          ...prevDepartments,
          response.data.result,
        ]);
        // alert("Department created successfully:", response.data.result);
        toast.success("Department created successfully!");
      }
    } catch (err) {
      setError(err.message);
      // alert("Error creating department:", err.message);
      toast.error("Error creating department: ", err.message);
    }

    closeForm();
  };

  return (
    <div className="mt-4">
      <ToastContainer />
      <span className="btn btn-success" onClick={openForm}>
        {children || "Thêm Phòng Ban"}
      </span>

      {showForm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Department</h5>
                <button type="button" className="close" onClick={closeForm}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={createDepartment}>
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Department Name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter ManagerID"
                      name="managerId"
                      value={formData.managerId}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary mr-2">
                      Create
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
