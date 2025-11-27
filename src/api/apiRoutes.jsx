// src/api/apiRoutes.js
const BASE_URL = "https://ems-toq5.onrender.com/ems";
//const BASE_URL = "https://ems-efub.onrender.com/ems";
// const BASE_URL = "http://localhost:8080/ems";
// link render trên web

export const API_ROUTES = {
  PERSONNELS: {
    LOGIN: `${BASE_URL}/auth/login`,
    BASE: `${BASE_URL}/personnels`,
    // GET_SEARCH_FILLTER: (page, size, keyword, role, gender, department) => `${BASE_URL}/personnels/all`,
    GET_SEARCH_FILLTER: (page, size, keyword, role, gender, department) => {
      let url = `${BASE_URL}/personnels/all?page=${page}&size=${size}`;

      if (keyword && keyword.trim() !== "") {
        url += `&keyword=${encodeURIComponent(keyword.trim())}`;
      }

      if (role && role !== "All") {
        url += `&role=${encodeURIComponent(role)}`;
      }

      if (gender && gender !== "All") {
        url += `&gender=${encodeURIComponent(gender)}`;
      }

      if (department && department !== "All") {
        url += `&department=${encodeURIComponent(department)}`;
      }

      return url;
    },

    GET_ONE: (empCode) => `${BASE_URL}/personnels/${empCode}`,
    CREATE: `${BASE_URL}/personnels`,
    UPDATE: (empCode) => `${BASE_URL}/personnels/${empCode}`,
    DELETE: (empCode) => `${BASE_URL}/personnels/${empCode}`,
    MY_INFO: `${BASE_URL}/personnels/myInfo`,

    UPLOAD_AVATAR: `${BASE_URL}/personnels/upload-avatar`,

    ASSIGN_EMPLOYEE: (departmentId, empCode) =>
      `${BASE_URL}/departments/${departmentId}/employee/assign?employeeCode=${empCode}`,
    ASSIGN_MANAGER: (departmentId, empCode) =>
      `${BASE_URL}/departments/${departmentId}/manager/assign?managerId=${empCode}`,

    GET_MY_NOTIFICATIONS: `${BASE_URL}/personnels/notifications`,

    MARK_NOTIFICATION_AS_READ: (notificationId) =>
      `${BASE_URL}/personnels/notifications/${notificationId}`,

    SENT_ADMIN_NOTIFICATIONS: `${BASE_URL}/notification/admin/send`,
    GET_ADMIN_SENT_NOTIFICATIONS: `${BASE_URL}/notification/admin`,
  },

  DEPARTMENT: {
    CREATE: `${BASE_URL}/departments`,
    DELETE: (departmentId) => `${BASE_URL}/departments/${departmentId}`,
    BASE: `${BASE_URL}/departments`,
    GET_ALL: `${BASE_URL}/departments/all`,
    GET_DEPARTMENT_PERSONNEL: (departmentId) =>
      `${BASE_URL}/departments/${departmentId}/employees`,
    // Get department employees with manager info
    GET_EMPLOYEES: (departmentId) =>
      `${BASE_URL}/departments/${encodeURIComponent(departmentId)}/employees`,
  },

  EMPLOYEES: {
    CREATE: `${BASE_URL}/employee/create`,
  },

  MANAGERS: {
    CREATE: `${BASE_URL}/managers/create`,
    GET_MY_EMPLOYEES: (departmentId) =>
      `${BASE_URL}/departments/${departmentId}/employees`,
    GET_MY_SENT_NOTIFICATIONS: `${BASE_URL}/notification/manager`,
    SEND_NOTIFICATION: `${BASE_URL}/notification/send`,
    DELETE_NOTIFICATION: (notificationId) =>
      `${BASE_URL}/notification/${notificationId}`,
  },

  PROJECT: {
    CREATE: `${BASE_URL}/projects`,
    BY_DEPARTMENT: (deptId) =>
      `${BASE_URL}/projects/department?deptID=${deptId}`,
    // Fetch a project by its unique projectId using RESTful path /projects/{id}
    GET_BY_ID: (projectId) =>
      `${BASE_URL}/projects/${encodeURIComponent(projectId)}`,
    UPDATE: (projectId) =>
      `${BASE_URL}/projects/${encodeURIComponent(projectId)}`,
    EMPLOYEES: (projectId) => `${BASE_URL}/projects/${projectId}/employees`,
    // Assign employee to project
    ASSIGN: (projectId, employeeCode) =>
      `${BASE_URL}/projects/${encodeURIComponent(
        projectId
      )}/assign?employeeCode=${encodeURIComponent(employeeCode)}`,
    // Remove employee from project
    REMOVE: (projectId) => `${BASE_URL}/projects/${encodeURIComponent(projectId)}/remove`,
  },

  UPLOAD: {
    TASK_FILE: (uploaderCode, taskId) =>
      `${BASE_URL}/files/upload-avatar?uploaderCode=${encodeURIComponent(
        uploaderCode || ""
      )}&taskId=${encodeURIComponent(taskId || "")}`,
  },

  FILES: {
    BY_TASK: (taskId) => `${BASE_URL}/files/task/${encodeURIComponent(taskId)}`,
  },

  ATTENDANCE: {
    OVERVIEW: `${BASE_URL}/attendance/overview`,
    CHECK_IN: `${BASE_URL}/attendance/checkIn`,
    CHECK_OUT: `${BASE_URL}/attendance/checkOut`,
    TODAY_STATUS: `${BASE_URL}/attendance/today/status`,
  },

  TASK: {
    EMPLOYEE: `${BASE_URL}/tasks/employee`,
    CREATE: `${BASE_URL}/tasks`,
    GET_ONE: (id) => `${BASE_URL}/tasks/${id}`,
    UPDATE: (id) => `${BASE_URL}/tasks/${id}`,
    BY_PROJECT: `${BASE_URL}/tasks/project`,
    UPDATE_STATUS: (taskId) =>
      `${BASE_URL}/tasks/status?taskId=${encodeURIComponent(taskId)}`,
  },
};
