import React from "react";
import { Trash, User } from "react-feather";
import "bootstrap/dist/css/bootstrap.min.css";
import { Settings2Icon } from "lucide-react";
import DefaultPhoto from "../assets/default_ava2.webp"; // Adjust the path as necessary
import "../../index.css";
import "./AllEmployee.css";
import { IoIosInformationCircle } from "react-icons/io";
import  ModalOfEachEmployee  from "./ModalOfEachEmployee";
import { useState } from "react";
const getRoleColor = (role) => (role === "EMPLOYEE" ? "#0004fc" : "#fc0000");

const EmployeeCard = ({ employee, index, onSettingClick }) => {

  const [showModal, setShowModal] = useState(false);
  return (
    <div className="col" style={{ animationDelay: `${index * 0.2}s` }}>
      <div className="profile-card card ">
        <div className="row no-gutters employee-list-row">
          {/* HEADER */}
          <div className=" card-ava col-3 d-flex flex-column align-items-center">
            <img
              src={employee.avatar || DefaultPhoto}
              className="card-img rounded-circle mt-2"
              alt="Avatar"
            />
          </div>

          {/* BODY */}
          <div className="col-9 ">
            <div className="card-body d-flex flex-column mt-2">
              {/* Phần tên chiếm 1/5 */}
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0">
                {employee.lastName} {employee.firstName}
                </h5>

                <IoIosInformationCircle
                  style={{ cursor: "pointer", color: "blue", fontSize: "1.5rem" }}
                  onClick={() => setShowModal(true)}
                />
              </div>

              {/* Phần chức vụ chiếm 1/5, chỉ tô màu nền trong phạm vi chữ */}
              <div className="d-flex align-items-center mt-4 ">
                {/* Position tag */}
                <h6 className="card-subtitle mb-0 custom-ml">
                  <span
                    style={{
                      backgroundColor: getRoleColor(employee.position),
                      color: "white",
                      borderRadius: "4px",
                      padding: "2px 8px",
                    }}
                  >
                    {employee.position}
                  </span>
                </h6>

                {/* Department tag */}
                <h6 className="card-subtitle mb-0 custom-ml">
                  <span
                    style={{
                      marginLeft: "15px",
                      backgroundColor: "green",
                      color: "white",
                      borderRadius: "4px",
                      padding: "2px 8px",
                    }}
                  >
                    {employee.departmentName || "Not found"}
                  </span>
                </h6>
              </div>

              {/* Phần mô tả công việc chiếm 2/5 */}
              <div className="d-flex" style={{ flex: "2" }}>
                <p className="card-text">{employee.job}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
       <ModalOfEachEmployee
        show={showModal}
        onClose={() => setShowModal(false)}
        employee={employee}
      />
    </div>
    
  );
};

export default EmployeeCard;


            // "personelCode": 7,
            // "firstName": "Quang",
            // "lastName": "2212737-Ly Thanh Nhat",
            // "email": "quang.ly2004bkhcm@hcmut.edu.vn",
            // "phone": "0856141590",
            // "city": " Bình Thuận",
            // "street": "Hương Sơ",
            // "role": null,
            // "avatar": "http://res.cloudinary.com/dkamugos5/image/upload/v1743590761/vf2zd1bw5hpah8ebmr45.png",
            // "gender": "MALE",
            // "position": "EMPLOYEE",
            // "departmentName": "Phòng Kinh Doanh",
            // "taskList": [],
            // "tasksCompleteNumber": 0,
            // "projectList": [],
            // "projectInvolved": 0
            // "projectInvolved": 0
            // "skills": [SoftWare, Mobile, Friendly,...]
            // "decription": " toi toi day de tim kiem thu thach moi, luong cao, on dinh"
            // "Facebook": "https://www.facebook.com/nhan.phunghoanghuu"
            // "Ins": "https://www.facebook.com/nhan.phunghoanghuu"
            // "Github": "https://www.facebook.com/nhan.phunghoanghuu"
            // "Linkedin": "https://www.facebook.com/nhan.phunghoanghuu"
