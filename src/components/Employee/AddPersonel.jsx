import React, { useState, useRef, useEffect } from "react";
// import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { API_ROUTES } from "../../api/apiRoutes";
import axiosInstance from "../../api/axiosInstance";

export const AddPersonel = ({ children }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    gender: "MALE",
    dob: "",
    email: "",
    phoneNumber: "",
    city: "",
    street: "",
    description: "",
    skills: "",
    position: "software",
    role: "EMPLOYEE",
  });

  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleAddEmployee = () => {
    setFormData((prev) => ({ ...prev, role: "EMPLOYEE" }));
    setShowDropdown(false);
    setShowForm(true);
  };

  const handleAddManager = () => {
    setFormData((prev) => ({ ...prev, role: "MANAGER" }));
    setShowDropdown(false);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.post(API_ROUTES.PERSONNELS.CREATE, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dob: formData.dob,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        city: formData.city,
        street: formData.street,
        description: formData.description,
        skills: formData.skills,
        position: formData.position,
        accountCreationRequest: {
          username: formData.username,
          password: formData.password,
          role: formData.role,
        },
      });

      console.log("✅ Tạo nhân sự thành công:", res.data);

      if (res.status === 200 || res.status === 201) {
        alert(`✅ Tạo ${formData.role} thành công!`);
        setShowForm(false);
        setFormData({
          username: "",
          password: "",
          firstName: "",
          lastName: "",
          gender: "MALE",
          dob: "",
          email: "",
          phoneNumber: "",
          city: "",
          street: "",
          description: "",
          skills: "",
          position: "software",
          role: "EMPLOYEE",
        });
      }
    } catch (error) {
      console.error("❌ Lỗi tạo nhân sự:", error);
      alert("❌ Có lỗi xảy ra khi tạo nhân sự.", error);
    }
  };

  // Click ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="container mt-4">
      <div
        className="dropdown mb-3"
        style={{ backgroundColor: "transparent" }}
        ref={dropdownRef}
      >
        <span
          className="btn btn-success dropdown-toggle"
          type="button"
          onClick={toggleDropdown}
        >
          {children || "+ Thêm nhân sự"}
        </span>

        <div className={`dropdown-menu ${showDropdown ? "show" : ""}`}>
          <button
            className="dropdown-item bg-success text-white"
            onClick={handleAddEmployee}
          >
            ➕ Add Employee
          </button>
          <button
            className="dropdown-item bg-success text-white"
            onClick={handleAddManager}
          >
            ➕ Add Manager
          </button>
        </div>
      </div>

      {/* hiện form đang kí thông tin nhân sự */}
      {showForm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
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
                <h5 className="modal-title">Thông tin nhân sự</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowForm(false)}
                >
                  <span>&times;</span>
                </button>
              </div>

              <div
                className="modal-body"
                style={{
                  maxHeight: "75rem",
                  maxWidth: "60rem",
                  overflowY: "auto",
                }}
              >
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col">
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row mt-2">
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row mt-2">
                    <div className="col">
                      <select
                        className="form-control"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                      </select>
                    </div>
                    <div className="col">
                      <input
                        type="date"
                        className="form-control"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row mt-2">
                    <div className="col">
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row mt-2">
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row mt-2">
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Position"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <textarea
                      className="form-control"
                      placeholder="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div className="modal-footer mt-3">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowForm(false)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Tạo tài khoản
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
