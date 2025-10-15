// src/api/apiRoutes.js
// const BASE_URL = "http://localhost:8080/ems";

// export const API_ROUTES = {
//   PERSONNELS: {
//     BASE: `${BASE_URL}/personnels`,
//     GET_ALL: `${BASE_URL}/personnels/all`,
//     GET_ONE: (empCode) => `${BASE_URL}/personnels/${empCode}`,
//     CREATE: `${BASE_URL}/personnels`,
//     UPDATE: (empCode) => `${BASE_URL}/personnels/${empCode}`,
//     DELETE: (empCode) => `${BASE_URL}/personnels/${empCode}`,
//   },

//   ACCOUNTS: {
//     CREATE: `${BASE_URL}/account/create`,
//   },

//   EMPLOYEES: {
//     CREATE: `${BASE_URL}/employee/create`,
//   },

//   MANAGERS: {
//     CREATE: `${BASE_URL}/managers/create`,
//   },
// };


// src/api/apiRoutes.js
// const BASE_URL = "http://localhost:8080/ems";
const BASE_URL = "https://ems-efub.onrender.com/ems";

export const API_ROUTES = {
  PERSONNELS: {
    LOGIN: `${BASE_URL}/auth/login`,
    BASE: `${BASE_URL}/personnels`,
    GET_ALL: `${BASE_URL}/personnels/all`,
    GET_ONE: (empCode) => `${BASE_URL}/personnels/${empCode}`,
    CREATE: `${BASE_URL}/personnels`,
    UPDATE: (empCode) => `${BASE_URL}/personnels/${empCode}`,
    DELETE: (empCode) => `${BASE_URL}/personnels/${empCode}`,
    MY_INFO: `${BASE_URL}/personnels/myInfo`,
    UPLOAD_AVATAR: `${BASE_URL}/personnels/upload-avatar`,
  },

  DEPARTMENT: {
    BASE: `${BASE_URL}/departments`,
    GET_ALL: `${BASE_URL}/departments/all`,},

  ACCOUNTS: {
    CREATE: `${BASE_URL}/account/create`,
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

