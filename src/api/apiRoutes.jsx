// src/api/apiRoutes.js
const BASE_URL = "https://ems-efub.onrender.com/ems";
//const BASE_URL = "https://ems-efub.onrender.com/ems";
// const BASE_URL = "http://localhost:8080/ems";
// link render trên web


export const API_ROUTES = {
  PERSONNELS: {
    LOGIN: `${BASE_URL}/auth/login`,
    BASE: `${BASE_URL}/personnels`,
    GET_ALL: `${BASE_URL}/personnels/all`,
    GET_ONE: (empCode) => `${BASE_URL}/personnels/${empCode}`,
    CREATE:  `${BASE_URL}/personnels`,
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
    BASE: `${BASE_URL}/departments`,
    GET_ALL: `${BASE_URL}/departments/all`,
    GET_DEPARTMENT_PERSONNEL: (departmentId) =>
      `${BASE_URL}/departments/${departmentId}/employees`,
  },

  EMPLOYEES: {
    CREATE: `${BASE_URL}/employee/create`,
  },

  MANAGERS: {
    CREATE: `${BASE_URL}/managers/create`,
    GET_MY_EMPLOYEES: (departmentId) => `${BASE_URL}/departments/${departmentId}/employees`,
    GET_MY_SENT_NOTIFICATIONS: `${BASE_URL}/notification/manager`,
    SEND_NOTIFICATION: `${BASE_URL}/notification/send`,
    DELETE_NOTIFICATION: (notificationId) =>
      `${BASE_URL}/notification/${notificationId}`,
  },


  ATTENDANCE: {
    OVERVIEW: `${BASE_URL}/attendance/overview`,
    CHECK_IN: `${BASE_URL}/attendance/checkIn`,
    CHECK_OUT: `${BASE_URL}/attendance/checkOut`,
    TODAY_STATUS: `${BASE_URL}/attendance/today/status`,
  },
};
