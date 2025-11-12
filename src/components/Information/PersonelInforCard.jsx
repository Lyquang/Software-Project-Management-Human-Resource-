import React, { useState, useEffect } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBriefcase,
  FaTransgender,
  FaIdCard,
} from "react-icons/fa";
import DefaultPhoto from "../assets/defaut_pho.png";
import AvatarUploadBtn from "./AvatarUploadBtn";
import UpdateInforBtn from "./UpdateInforBtn";
import { MdPhoto, MdEdit, MdAddTask } from "react-icons/md";
import { IoIosCloudDone } from "react-icons/io";
import { GiProgression } from "react-icons/gi";
import { HiBuildingOffice2 } from "react-icons/hi2";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../index.css";
import "./PersonelInfor.css";
import Loading from "../Loading/Loading";

export const PersonelInforCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({
    personelCode: "",
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    position: "",
    profileImage: "",
    gender: "",
    taskList: [],
    tasksCompleteNumber: 0,
    projectList: [],
    projectsCompleteNumber: 0,
  });

  useEffect(() => {
    const fetchPersonelData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const accountId = sessionStorage.getItem("accountId");

        if (!token || !accountId) {
          setError("Authentication token or account ID not found");
          setLoading(false);
          return;
        }
        console.log("accountId at manager infor >>>> ", accountId);
        const Empresponse = await fetch(
          `http://localhost:8080/ems/employee/account?id=${accountId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        // http://localhost:8080/ems/managers/account?id=028b31fa-6ed0-42fb-8ae1-a4fd6f32ca21
        const ManaResponse = await fetch(
          `http://localhost:8080/ems/managers/account?id=${accountId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const MainResponse = Empresponse.ok ? Empresponse : ManaResponse;
        const data = await MainResponse.json();

        if (!MainResponse.ok) {
          throw new Error("Failed to fetch employee data");
        }

        sessionStorage.setItem("personelCode", data.personelCode);

        setProfile({
          personelCode: data.personelCode,
          firstName: data.firstName,
          lastName: data.lastName,
          name: `${data.lastName} ${data.firstName}`,
          email: data.email,
          phone: data.phone,
          address: `${data.street}, ${data.city}`,
          department: data.departmentName,
          position: data.position,
          profileImage: data.avatar,
          gender: data.gender,
          taskList: data.taskList || [],
          tasksCompleteNumber: data.tasksCompleteNumber || 0,
          projectList: data.projectList || [],
          projectsCompleteNumber: data.projectsCompleteNumber || 0,
        });
        // lưu personelCode vào sessionStorage để dùng chung
        sessionStorage.setItem("personelCode", data.personelCode);


        

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPersonelData();
  }, []);

  if (loading) return <div><Loading/></div>
  if (error) return <div className="alert alert-danger my-5">{error}</div>;

  return (
    <div className="card rounded shadow mt-4 p-0 overflow-hidden">
      <div className="row ">
        {/* LEFT PANEL */}
        <div
          className="col-md-4 text-center p-5 profile-img-background"

        >
          <img    className="rounded-circle img-fluid mb-3 flex-center mx-auto profile-img"
            src={profile.profileImage || DefaultPhoto}
            alt="Profile"
          />
          <div className="mt-3">
            <AvatarUploadBtn setProfile={setProfile}>
              <MdPhoto size={20} className="mr-1" />
              Upload Photo
            </AvatarUploadBtn>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-md-8 p-4 " style={{ padding: "2rem" }}>
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h1 className="mb-1 fw-bold" style={{ fontSize: "2.5rem" }}>
                {profile.name}
              </h1>
              <h5 className="text-muted" style={{ fontSize: "1.5rem" }}>
                {profile.position}
              </h5>
            </div>
            <UpdateInforBtn profile={profile} setProfile={setProfile}>
              <MdEdit size="1.8rem" />
            </UpdateInforBtn>
          </div>

          <div className="row">
            {/* Personal Info */}
            <div className="col-md-7 mb-4">
              <h6
                className="text-uppercase text-primary mb-3"
                style={{ fontSize: "1.2rem", fontWeight: 600 }}
              >
                Personal Info
              </h6>
              <ul
                className="list-unstyled"
                style={{ fontSize: "1.1rem", lineHeight: "2rem" }}
              >
                <li className="mb-2">
                  <FaIdCard className="me-2 text-secondary" />
                  <strong>ID:</strong> {profile.personelCode}
                </li>
                <li className="mb-2">
                  <FaPhone className="me-2 text-secondary" />
                  <strong>Phone:</strong> {profile.phone}
                </li>
                <li className="mb-2">
                  <FaEnvelope className="me-2 text-secondary" />
                  <strong>Email:</strong> {profile.email}
                </li>
                <li className="mb-2">
                  <FaTransgender className="me-2 text-secondary" />
                  <strong>Gender:</strong> {profile.gender}
                </li>
                <li className="mb-2">
                  <FaMapMarkerAlt className="me-2 text-secondary" />
                  <strong>Address:</strong> {profile.address}
                </li>
              </ul>
            </div>

            {/* Work Info */}
            <div className="col-md-5 mb-4 ">
              <h6
                className="text-uppercase text-primary mb-3"
                style={{ fontSize: "1.2rem", fontWeight: 600 }}
              >
                Work Info
              </h6>
              <ul
                className="list-unstyled"
                style={{ fontSize: "1.1rem", lineHeight: "2rem" }}
              >
                <li className="mb-2">
                  <HiBuildingOffice2 className="me-2 text-secondary" />
                  <strong>Department:</strong> {profile.department}
                </li>
                <li className="mb-2">
                  <FaBriefcase className="me-2 text-secondary" />
                  <strong>Tasks Remaining:</strong> {profile.taskList.length}
                </li>
                <li className="mb-2">
                  <MdAddTask className="me-2 text-secondary" />
                  <strong>Tasks Done:</strong> {profile.tasksCompleteNumber}
                </li>
                <li className="mb-2">
                  <GiProgression className="me-2 text-secondary" />
                  <strong>Projects Remaining:</strong>{" "}
                  {profile.projectList.length}
                </li>
                <li className="mb-2">
                  <IoIosCloudDone className="me-2 text-secondary" />
                  <strong>Projects Done:</strong>{" "}
                  {profile.projectsCompleteNumber}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
