import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaProjectDiagram,
  FaRegUser,
  FaHome,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";
import { PiNotePencilDuotone } from "react-icons/pi";
import { BiLogOut, BiChat } from "react-icons/bi";
import { IoMdCloudUpload } from "react-icons/io";
import { jwtDecode } from "jwt-decode";
import Defaut_Profile from "../components/assets/defaut_pho.png";

function MainSideBar() {
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({});
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPersonnelData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found");
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const userRole = decoded.scope;
        setRole(userRole);

        if (userRole === "ADMIN") {
          setLoading(false);
          return;
        }

        const apiUrl = "http://localhost:8080/ems/personnels/myInfo";
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch personnel data");

        const data = await response.json();

        setProfile({
          personelCode: data.personelCode,
          firstName: data.firstName,
          lastName: data.lastName,
          name: `${data.lastName} ${data.firstName}`,
          email: data.email,
          phone: data.phone,
          department: data.departmentName,
          position: data.position,
          profileImage: data.avatar,
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPersonnelData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div
      className={`flex flex-col h-full bg-[#d8eefe] dark:bg-gray-800 text-[#094067] dark:text-gray-100 transition-all duration-300 rounded-xl shadow-lg ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 dark:border-gray-700">
        {expanded && (
          <span className="text-lg font-bold text-[#001858] dark:text-white">
            BK-MANARATE
          </span>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[#3da9fc] dark:text-blue-400 text-xl hover:scale-110 transition-transform"
        >
          {expanded ? <FaArrowLeft /> : <FaArrowRight />}
        </button>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center py-4 border-b border-gray-300 dark:border-gray-700">
        <img
          src={profile?.profileImage || Defaut_Profile}
          alt="Avatar"
          className="w-14 h-14 rounded-full object-cover border-2 border-blue-300 dark:border-blue-500"
        />
        {expanded && (
          <div className="mt-2 text-sm font-semibold">{profile?.name}</div>
        )}
      </div>

      {/* Sidebar Links */}
      <div className="flex flex-col mt-4 space-y-1 text-base font-medium">
        {role === "EMPLOYEE" && (
          <SidebarLinks
            expanded={expanded}
            links={[
              { to: "/login/employee", icon: <FaHome />, text: "Home" },
              { to: "infor", icon: <FaRegUser />, text: "My Information" },
              { to: "attendance", icon: <PiNotePencilDuotone />, text: "Check Attendance" },
              { to: "submittask", icon: <IoMdCloudUpload />, text: "Submit Task" },
              { to: "notification", icon: <BiChat />, text: "Notifications" },
              { to: "/", icon: <BiLogOut />, text: "Log Out", onClick: handleLogout },
            ]}
          />
        )}

        {role === "MANAGER" && (
          <SidebarLinks
            expanded={expanded}
            links={[
              { to: "/login/manager", icon: <FaHome />, text: "Home" },
              { to: "infor", icon: <FaRegUser />, text: "My Information" },
              { to: "project", icon: <FaProjectDiagram />, text: "Projects" },
              { to: "notification", icon: <BiChat />, text: "Notifications" },
              { to: "/", icon: <BiLogOut />, text: "Log Out", onClick: handleLogout },
            ]}
          />
        )}

        {role === "ADMIN" && (
          <SidebarLinks
            expanded={expanded}
            links={[
              { to: "/login/admin", icon: <FaHome />, text: "Home" },
              { to: "employee", icon: <FaRegUser />, text: "All Employees" },
              { to: "department", icon: <PiNotePencilDuotone />, text: "All Departments" },
              { to: "admin-attendance", icon: <IoMdCloudUpload />, text: "Check Attendance" },
              { to: "admin-salary", icon: <IoMdCloudUpload />, text: "Salary & Benefits" },
              { to: "/", icon: <BiLogOut />, text: "Log Out", onClick: handleLogout },
            ]}
          />
        )}
      </div>
    </div>
  );
}

function SidebarLinks({ expanded, links }) {
  return (
    <nav className="flex flex-col px-2">
      {links.map(({ to, icon, text, onClick }, idx) => (
        <NavLink
          key={idx}
          to={to}
          onClick={onClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 
             ${isActive ? "bg-[#1d5084] text-white shadow-md" : "hover:bg-blue-100 dark:hover:bg-gray-700 text-[#094067] dark:text-gray-200"}`
          }
        >
          <span className="text-lg">{icon}</span>
          {expanded && <span className="truncate">{text}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

export default MainSideBar;
