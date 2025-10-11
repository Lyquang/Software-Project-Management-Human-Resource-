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
import DefaultProfile from "../components/assets/defaut_pho.png";
// phần này Dựa vào role trong token để hiển thị các link tương ứng
// Roles: EMPLOYEE, MANAGER, ADMIN

function MainSideBar() {
  const [expanded, setExpanded] = useState(true);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  // ✅ Get role from JWT token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // Redirect to login if no token
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userRole = decoded.scope || decoded.role;
      setRole(userRole);
    } catch (error) {
      console.error("Invalid token:", error);
      navigate("/");
    }
  }, [navigate]);

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ✅ Define link sets by role
  const linksByRole = {
    EMPLOYEE: [
      { to: "/login/employee", icon: <FaHome />, text: "Home" },
      { to: "infor", icon: <FaRegUser />, text: "My Information" },
      { to: "attendance", icon: <PiNotePencilDuotone />, text: "Check Attendance" },
      { to: "submittask", icon: <IoMdCloudUpload />, text: "Submit Task" },
      { to: "notification", icon: <BiChat />, text: "Notifications" },
      { to: "/", icon: <BiLogOut />, text: "Log Out", onClick: handleLogout },
    ],
    MANAGER: [
      { to: "/login/manager", icon: <FaHome />, text: "Home" },
      { to: "infor", icon: <FaRegUser />, text: "My Information" },
      { to: "project", icon: <FaProjectDiagram />, text: "Projects" },
      { to: "notification", icon: <BiChat />, text: "Notifications" },
      { to: "/", icon: <BiLogOut />, text: "Log Out", onClick: handleLogout },
    ],
    ADMIN: [
      { to: "/login/admin", icon: <FaHome />, text: "Home" },
      { to: "employee", icon: <FaRegUser />, text: "All Employees" },
      { to: "department", icon: <PiNotePencilDuotone />, text: "All Departments" },
      { to: "admin-attendance", icon: <IoMdCloudUpload />, text: "Check Attendance" },
      { to: "admin-salary", icon: <IoMdCloudUpload />, text: "Salary & Benefits" },
      { to: "/", icon: <BiLogOut />, text: "Log Out", onClick: handleLogout },
    ],
  };

  const sidebarLinks = linksByRole[role] || [];

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
      {/* <div className="flex flex-col items-center py-4 border-b border-gray-300 dark:border-gray-700">
        <img
          src={DefaultProfile}
          alt="Avatar"
          className="w-14 h-14 rounded-full object-cover border-2 border-blue-300 dark:border-blue-500"
        />
        {expanded && (
          <div className="mt-2 text-sm font-semibold">
            {role ? role.charAt(0) + role.slice(1).toLowerCase() : "User"}
          </div>
        )}
      </div> */}

      {/* Sidebar Links */}
      <SidebarLinks expanded={expanded} links={sidebarLinks} />
    </div>
  );
}

// ✅ Subcomponent for reusable sidebar links
function SidebarLinks({ expanded, links }) {
  return (
    <nav className="flex flex-col px-2 mt-4 space-y-1 text-base font-medium">
      {links.map(({ to, icon, text, onClick }, idx) => (
        <NavLink
          key={idx}
          to={to}
          onClick={onClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 
             ${
               isActive
                 ? "bg-[#1d5084] text-white shadow-md"
                 : "hover:bg-blue-100 dark:hover:bg-gray-700 text-[#094067] dark:text-gray-200"
             }`
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
