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
import AdminDashboard from "./Page/AdminDashboard";
import Home from "./components/Authentication/Home";
import Login from "./components/Authentication/Login";
import Signup from "./components/Authentication/Signup";
// import component of employee
import AllEmployee from "./components/Employee/AllEmployee";
import EDashboard from "./Page/MainEmployeeDashBoard";
import SubmitTask from "./components/Project/Employee/SubmitTask";
import EmployeeAttendance from "./components/Attendance/EmployeeAttendance";
import PersonelInfor from "./components/Information/PersonelInfor";
import EmployeeNotification from "./components/Notification/Employee/EmployeeNotification";
// import component of manager
import ManagerProject from "./components/Project/Manager/ManagerProject";
import CreateTask from "./components/Project/Manager/CreateTask";
import ProjectTasksPage from "./components/Project/Manager/ProjectTasksPage";
import ProjectTaskCreate from "./components/Project/Manager/ProjectTaskCreate";
// import component of admin
import DepartmentPage from "./components/Department/DepartmentPage";
import AdminAttendance from "./components/Attendance/AdminAttendance";
import AdminSalary from "./components/Salary/AdminSalary";
import "./index.css";
import TaskManagementPage from "./components/Project/Employee/TaskManagementPage";
import TaskDetail from "./components/Project/Employee/TaskDetail";
import TaskEdit from "./components/Project/Employee/TaskEdit";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import RootProvider from "./context/RootProvider";

//import meeting room pages
import MeetingRoomAdmin from "./Page/MeetingRoomAdmin";
import EmployeeMeetingRoom from "./Page/EmployeeMeetingRoom";
import ManagerMeetingRoom from "./Page/ManagerMeetingRoom";
import ManagerDashboard from "./components/MeetingRoom/Manager/ManagerDashboard";
import EmployeeDashboard from "./components/MeetingRoom/Employee/EmployeeDashboard";
import MainEmployeeDashBoard from "./Page/MainEmployeeDashBoard";
import MainManagerDashBoard from "./Page/MainManagerDashBoard";



const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <RootProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Project tasks route with layout to keep Header/Sidebar */}
        <Route path="/project" element={<MainPage />}>
          <Route path=":id/tasks" element={<ProjectTasksPage />} />
          <Route path=":id/tasks/create" element={<ProjectTaskCreate />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route exact path="/login/admin" element={<MainPage />}>
          <Route index element={<AdminDashboard />}></Route>
          <Route path="employee" element={<AllEmployee />} />
          <Route path="admin-attendance" element={<AdminAttendance />} />
          <Route path="admin-salary" element={<AdminSalary />} />
          <Route path="department" element={<DepartmentPage />} />
          <Route path="meeting-rooms" element={<MeetingRoomAdmin />} />
          <Route path="notification" element={<EmployeeNotification />} />
        </Route>

        <Route path="/login/employee" element={<MainPage />}>
          <Route index element={<MainEmployeeDashBoard />}></Route>
          <Route path="infor" element={<PersonelInfor />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="submittask" element={<SubmitTask />} />
          <Route path="notification" element={<EmployeeNotification />} />
          <Route path="meeting-rooms" element={<EmployeeMeetingRoom />} />
          <Route path="task" element={<TaskManagementPage />} />
          <Route path="task/:id" element={<TaskDetail />} />
          <Route path="task/:id/edit" element={<TaskEdit />} />
        </Route>

        <Route path="/login/manager" element={<MainPage />}>
          <Route index element={<MainManagerDashBoard/>}></Route>
          <Route path="infor" element={<PersonelInfor />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="department" element={<DepartmentPage />} />
          <Route path="project" element={<ManagerProject />} />
          <Route path="meeting-rooms" element={<ManagerMeetingRoom />} />
          <Route
            path="project/:projectId/tasks"
            element={<ProjectTasksPage />}
          />
          <Route path="project/:projectId/tasks/create" element={<ProjectTaskCreate />} />
          <Route path="notification" element={<EmployeeNotification />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </RootProvider>
);

reportWebVitals();
