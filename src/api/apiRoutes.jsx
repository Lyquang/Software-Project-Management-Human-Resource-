

// src/api/apiRoutes.js
// const BASE_URL = "http://localhost:8080/ems";
// link render trên web
const BASE_URL = "https://ems-efub.onrender.com/ems";

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
  },

  ATTENDANCE: {
    OVERVIEW: `${BASE_URL}/attendance/overview`,
  },
};
