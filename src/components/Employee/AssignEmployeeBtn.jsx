import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

export const AssignEmployeeBtn = ({ refresh, children }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    departmentId: ''
  });

  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  const openForm = () => {
    setShowForm(true);
    setFormData({
      employeeId: '',
      departmentId: ''
    });
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({
      employeeId: '',
      departmentId: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `http://localhost:8080/api/employee/assign-to-department`,
        {}, // body is empty, since params are in URL
        {
          params: {
            employeeId: formData.employeeId,
            departmentId: formData.departmentId
          }
        }
      );

      if (response.data && response.data.code === 1000) {
        alert('✅ Gán nhân viên vào phòng ban thành công!');
        if (typeof refresh === 'function') refresh(); // optional callback
      } else {
        alert('⚠️ Không thể gán nhân viên: ' + (response.data?.message || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert('❌ Lỗi khi gán nhân viên vào phòng ban.');
    }

    closeForm();
  };

  return (
    <div className="mt-4">
      <span className="btn btn-success" onClick={openForm}>
       { children||"🏷️ Assign Employee to Department"} 
      </span>

      {showForm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1050
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Employee to Department</h5>
                <button type="button" className="close" onClick={closeForm}>
                  <span>&times;</span>
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter EmployeeId"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      name="departmentId"
                      placeholder="Enter DepartmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {error && <div className="alert alert-danger">{error}</div>}
                </div>

                <div className="modal-footer">
                  <button type="submit" className="btn btn-success">Gán</button>
                  <button type="button" className="btn btn-secondary" onClick={closeForm}>Hủy</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
