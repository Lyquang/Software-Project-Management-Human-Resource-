import React, { useState, useRef, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { API_ROUTES } from "../../api/apiRoutes";
import { ToastContainer, toast } from "react-toastify";

export const AddPersonel = ({ children }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [errors, setErrors] = useState("");

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
    basicSalary: 0,
    role: "EMPLOYEE",
  });

  const dropdownRef = useRef(null);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

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

  const validate = () => {
    const newError = {};
    const userNameRegex = /^[A-Za-z\s]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username.trim()) {
      newError.username = "UserName must be require";
    } else if (!userNameRegex.test(formData.username.trim())) {
      newError.username = "UserName only have letter";
    }
    console.log(newError);
    setErrors(newError);
    return Object.keys(newError).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      validate();
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
        basicSalary: formData.basicSalary,
        accountCreationRequest: {
          username: formData.username,
          password: formData.password,
          role: formData.role,
        },
      });

      console.log("✅ Created personnel:", res.data);
      if (res.status === 200 || res.status === 201) {
        toast.success(`${formData.role} created successfully!`);
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
          position: "",
          basicSalary: 0,
          role: "EMPLOYEE",
        });
      } else {
        // Nếu server trả lỗi trong res
        console.log("vao else", res);
        const message =
          res.data?.message || res.message || "Error creating personnel.";
        toast.error(message);
      }
    } catch (error) {
      console.error("❌ Error creating personnel:", error);
      // Lấy message từ backend (ví dụ "Age must be at least 18")
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Error creating personnel.";
      toast.error(message);
    }
  };

  // Close dropdown when clicking outside
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
    <div className="p-4">
      {/* Dropdown */}
      <div className="relative inline-block" ref={dropdownRef}>
        {/* Main button */}
        <button
          onClick={toggleDropdown}
          className="flex items-center gap-2 backdrop-blur-md bg-white/10 border border-white/20  font-medium px-6 py-3 rounded-xl hover:bg-white/20 hover:border-white/40 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <span className="text-xl">➕</span>
          <span>Add Personnel</span>
        </button>

        {/* Dropdown menu */}
        {showDropdown && (
          <div className="absolute mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden animate-fadeIn">
            <button
              onClick={handleAddEmployee}
              className="flex items-center w-full text-left px-4 py-2.5 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-150"
            >
              <span className="text-lg mr-2">👤</span>
              Add Employee
            </button>

            <div className="h-px bg-gray-100 mx-2"></div>

            <button
              onClick={handleAddManager}
              className="flex items-center w-full text-left px-4 py-2.5 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
            >
              <span className="text-lg mr-2">👑</span>
              Add Manager
            </button>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-white rounded-2xl shadow-lg w-[750px] max-h-[90vh] overflow-y-auto">
            {/* Header Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { id: "personal", label: "Personal Information" },
                { id: "professional", label: "Professional Information" },
                { id: "account", label: "Account Access" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-indigo-400"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* === PERSONAL INFORMATION === */}
              {activeTab === "personal" && (
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200"
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200"
                    required
                  />
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200"
                    required
                  />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200"
                    required
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200 col-span-2"
                    required
                  />
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200 col-span-2"
                    required
                  />
                </div>
              )}

              {/* === PROFESSIONAL INFORMATION === */}
              {activeTab === "professional" && (
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="Position"
                    className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200"
                  />
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="Skills"
                    className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200"
                  />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200"
                  />
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Street"
                    className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200"
                  />
                  <input
                    type="number"
                    name="basicSalary"
                    value={formData.basicSalary}
                    onChange={handleChange}
                    placeholder="Basic Salary (USD)"
                    className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200 col-span-2"
                  />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description"
                    rows="3"
                    className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200 col-span-2"
                  />
                </div>
              )}

              {/* === ACCOUNT ACCESS === */}
              {activeTab === "account" && (
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200"
                  />
                  {errors.username && (
                    <small style={{ color: "red" }}>{errors.username}</small>
                  )}
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200"
                  />
                  <div className="col-span-2 text-sm text-gray-500">
                    Role: <span className="font-semibold">{formData.role}</span>
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-end mt-6 gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
};
export default AddPersonel;
