import axios from "../utils/axiosCustomize";

// Authentication APIs
const postLogin = (username, password) => {
    return axios.post("/auth/login", { username, password });
};

const postCreateNewAccount = (username, password) => {
    return axios.post("/account/create", { username, password });
};

const getAllAccount = () => {
    return axios.get("/account/all");
};

const getAccountById = (id) => {
    return axios.get(`/account?accountId=${id}`);
};

const putUpdateAccount = (id, password) => {
    return axios.put("/account/edit", { id, password });
};

const deleteAccount = (id) => {
    return axios.delete(`/account/delete?accountId=${id}`);
};

// Personnel APIs con
const postCreateNewPersonelEmployee = (payload) => {
    return axios.post("/employee/create", payload, {
        headers: { "Content-Type": "application/json" },
    });
};

const postCreateNewPersonelManager = (payload) => {
    return axios.post("/manager/create", payload, {
        headers: { "Content-Type": "application/json" },
    });
};

const getAllPersonel = () => {
    return axios.get("/personel/all");
};

const getPersonelByCode = (code) => {
    return axios.get(`/personnel?code=${code}`);
};

const deletePersonel = (code) => {
    return axios.delete(`/personnel/delete?code=${code}`);
};


// Department APIs
const postCreateNewDepartment = (payload) => {
    return axios.post("http://localhost:8080/api/departments/create", payload, {
        headers: { "Content-Type": "application/json" },
    });
};

const getAllDepartment = () => {
    return axios.get("http://localhost:8080/api/departments/all");
};


//project API
const getAllProjects = () => {
    return axios.get("http://localhost:8080/api/projects/all");
};

// New API for assigning projects
const postAssignProject = (payload) => {
    return axios.post("http://localhost:8080/api/projects/assign", payload, {
        headers: { "Content-Type": "application/json" },
    });
};


const getEmployeeByAccountId = (id) => {
    return axios.get("/employee/account", {
        params: { id },
    })
}


const getTaskByEmployeeCode = (code) => {
    return axios.get("/tasks/employee", {
        params: { code: code },
    });
};

const postEmployeeCheckin = (code) => {
    return axios.post("/attendance/check-in", null, {
        params: { employeeId: code },
    });
};

const postEmployeeCheckout = (code) => {
    return axios.post("/attendance/check-out", null, {
        params: { employeeId: code },
    });
};

const getEmployeeAttendance = (code) => {
    return axios.get(`/attendance/employee`, {
        params: { employeeId: code },
    });
};



// Consolidated export
export {
    postLogin,
    postCreateNewAccount,
    postCreateNewPersonelEmployee,
    postCreateNewPersonelManager,
    postCreateNewDepartment,
    postEmployeeCheckin,
    postEmployeeCheckout,
    getAllAccount,
    getAccountById,
    getAllPersonel,
    getPersonelByCode,
    getAllDepartment,
    getEmployeeByAccountId,
    getTaskByEmployeeCode,
    putUpdateAccount,
    deleteAccount,
    deletePersonel,
    getAllProjects,
    getEmployeeAttendance,
    postAssignProject,
};
