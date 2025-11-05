import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import store from "./store";

import { Provider } from "react-redux";
//import component chưa sử dụng
// import AdminTraining from "./components/Training/AdminTraining";
// import Page
import MainPage from "./Page/MainPage";
import Home from "./components/Authentication/Home";
import Login from "./components/Authentication/Login";
import Signup from "./components/Authentication/Signup";
// import component of employee
import AllEmployee from "./components/Employee/AllEmployee";
import EDashboard from "./Page/EDashboard";
import SubmitTask from "./components/Project/Employee/SubmitTask";
import EmployeeAttendance from "./components/Attendance/EmployeeAttendance";
import PersonelInfor from "./components/Information/PersonelInfor";
import EmployeeNotification from "./components/Notification/Employee/EmployeeNotification";
// import component of manager
import ManagerProject from "./components/Project/Manager/ManagerProject";
// import component of admin
import DepartmentPage from "./components/Department/DepartmentPage";
import AdminAttendance from "./components/Attendance/AdminAttendance";
import AdminSalary from "./components/Salary/AdminSalary";
import "./index.css";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route exact path="/login/admin" element={<MainPage />}>
            <Route path="employee" element={<AllEmployee />} />
            <Route path="admin-attendance" element={<AdminAttendance />} />
            <Route path="admin-salary" element={<AdminSalary />} />
            <Route path="department" element={<DepartmentPage />} />
            <Route path="notification" element={<EmployeeNotification />} />
          </Route>

          <Route exact path="/login/employee" element={<MainPage />}>
            <Route index element={<EDashboard />}></Route>
            <Route path="infor" element={<PersonelInfor />} />
            <Route path="attendance" element={<EmployeeAttendance />} />
            <Route path="submittask" element={<SubmitTask />} />
            <Route path="notification" element={<EmployeeNotification />} />
          </Route>

          <Route exact path="/login/manager" element={<MainPage />}>
            <Route path="infor" element={<PersonelInfor />} />
            <Route path="attendance" element={<EmployeeAttendance />} />
            <Route path="department" element={<DepartmentPage />} />
            <Route path="project" element={<ManagerProject />} />
            <Route path="notification" element={<EmployeeNotification />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </ThemeProvider>
);

reportWebVitals();
