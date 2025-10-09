import React from "react";
import { MdDelete } from "react-icons/md";
import { IoIosPeople } from "react-icons/io";
import DeleteDepartmentBtn from "./DeleteDepartmentBtn";
import { EmployeeBelongDep } from "./EmployeeBelongDep";
import DefaultAvatar from "../assets/defaut_pho.png"; // fix typo
import "../../index.css";
import "./DepartmentCard.css";

import dep1 from "../assets/dep_back_1.jpg";
import dep2 from "../assets/dep_back_2.jpg";
import dep3 from "../assets/dep_back_3.jpg";
import dep4 from "../assets/dep_back_4.jpg";
import dep5 from "../assets/dep_back_5.jpg";
import dep6 from "../assets/dep_back_6.jpg";
import dep7 from "../assets/dep_back_7.jpg";
import dep8 from "../assets/dep_back_8.jpg";
import dep10 from "../assets/dep_back_10.jpg";
import dep11 from "../assets/dep_back_11.jpg";
import dep12 from "../assets/dep_back_12.jpg";
import dep13 from "../assets/dep_back_13.jpg";

const departmentImages = [
  dep1, dep2, dep3, dep4, dep5, dep6, dep7, dep8, dep10, dep11, dep12, dep13
];

const DepartmentCard = ({ department }) => {
  const randomImage =
    departmentImages[Math.floor(Math.random() * departmentImages.length)];

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="d-flex rounded shadow-lg overflow-hidden">
        {/* Left Image Area */}
        <div
          className="card-image dep-img"
          style={{ backgroundImage: `url(${randomImage})` }}
        >
          <div className="avatar-icon">
            <img src={department.managerAvatar || DefaultAvatar} alt="Avatar" />
          </div>
        </div>

        {/* Right Info Area */}
        <div className="card px-3 py-3 flex-grow-1 card-text" style={{ marginLeft: "10px" }}>
          <h5 className="fw-bold display-7">{department.departmentName}</h5>
          <p className="mb-2 display-7 fw-bold" style={{ fontSize: "16px" }}>
            Department ID: {department.departmentId}<br />
            Manager ID: {department.managerId || "Not Yet"}<br />
            Number of Employees: {department.employeeNumber}<br />
            Establish Date: {department.establishmentDate}<br />
            Manager: {department.managerName || "Not Yet"}
          </p>

          <div className="d-flex justify-content-start gap-3 text-success" style={{ fontSize: "1.5rem" }}>
            <DeleteDepartmentBtn departmentId={department.departmentId}>
              <MdDelete style={{ cursor: "pointer", color: "red" }} />
            </DeleteDepartmentBtn>

            <EmployeeBelongDep departmentId={department.departmentId}>
              <IoIosPeople style={{ cursor: "pointer", color: "blue" }} />
            </EmployeeBelongDep>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;
