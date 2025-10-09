import React from "react";
import { Modal } from "react-bootstrap";
import "../../index.css";
import "./AllEmployee.css";
import Default_Profile from "../assets/default_ava2.webp";
import { FaTasks } from "react-icons/fa";

const ModalOfEachEmployee = ({ show, onClose, employee }) => {
  if (!employee) return null;

  const {
    code,
    firstName,
    lastName,
    email,
    phone,
    city,
    street,
    gender,
    position,
    departmentName,
    tasksCompleteNumber,
    projectInvolved,
    avatar,
  } = employee;

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      dialogClassName="custom-modal-width"
    >
      <Modal.Body className="p-0 rounded-4 overflow-hidden employee-modal-bg text-white">
        <div className="p-4 position-relative text-center">
          {/* Avatar */}
          <div className="d-flex justify-content-center mb-3">
            <img
              src={avatar || Default_Profile}
              alt="avatar"
              className="rounded-circle border border-3 border-white"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
          </div>

          {/* Name & Role */}
          <h5 className="fw-bold">
            {lastName} {firstName}
          </h5>
          <p className="text-light">
            {position || departmentName || "Unknown"}
          </p>

          {/* Badge Info */}
          <div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
            <span className="badge-custom">
              {gender === "MALE" ? "Nam" : "Nữ"}
            </span>
            <span className="badge-custom">{phone || "No Phone"}</span>
            <span className="badge-custom">{email || "No Email"}</span>
            <span className="badge-custom">
              {`${street}, ${city}` || "No Address"}
            </span>
          </div>

          {/* Stats */}
          <div className="d-flex justify-content-around text-center text-white my-4">
            <div>
              <div className="d-flex justify-content-center align-items-center gap-2 mb-1">
                <i className="bi bi-check2-circle"></i>
                <h6 className="mb-0 fw-bold">{tasksCompleteNumber || "0"}</h6>
              </div>
              <small>Tasks Done</small>
            </div>
            <div>
              <div className="d-flex justify-content-center align-items-center gap-2 mb-1">
                <i className="bi bi-kanban-fill"></i>
                <h6 className="mb-0 fw-bold">{projectInvolved || 0}</h6>
              </div>
              <small>Projects</small>
            </div>
            <div>
              <div className="d-flex justify-content-center align-items-center gap-2 mb-1">
                <i className="bi bi-hash"></i>
                <h6 className="mb-0 fw-bold">{code || 0}</h6>
              </div>
              <small>Code</small>
            </div>
          </div>

          <div className="d-flex justify-content-around text-center text-white my-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <i className="bi bi-facebook"></i>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <i className="bi bi-instagram"></i>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <i className="bi bi-linkedin"></i>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <i className="bi bi-github"></i>
            </a>
          </div>

          {/* Button */}
          <div className="text-center mt-3">
            <button
              className="btn btn-light fw-bold px-4 py-2 rounded-pill"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ModalOfEachEmployee;
