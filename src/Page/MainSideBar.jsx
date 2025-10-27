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
import {
  MdDashboard,
  MdOutlineSettings,
  MdOutlineTaskAlt,
  MdOutlineAttachMoney,
} from "react-icons/md";
import { BsGraphUpArrow, BsBullseye } from "react-icons/bs";
import { HiOutlineDotsCircleHorizontal } from "react-icons/hi";
import logo from "../components/assets/logo.jpg";
import { IoMdNotificationsOutline } from "react-icons/io";

function MainSideBar() {
  const [expanded, setExpanded] = useState(true);
  const [role, setRole] = useState("");

  const navigate = useNavigate();
  const unreadNotiCount = localStorage.getItem("unreadNotiCount");

  // Decode role từ token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    try {
      console.log("unreadConnt at sidebar", unreadNotiCount);
      const decoded = jwtDecode(token);
      const userRole = decoded.scope || decoded.role;
      setRole(userRole);
    } catch (error) {
      console.error("Invalid token:", error);
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Links theo role
  const linksByRole = {
    EMPLOYEE: [
      {
        group: "MAIN MENU",
        items: [
          { to: "/login/employee", icon: <MdDashboard />, text: "Dashboard" },
          {
            to: "message",
            icon: <BiChat />,
            text: "Message",
          },
          {
            to: "notification",
            icon: <IoMdNotificationsOutline />,
            text: "Notifications",
          },
        ],
      },
      {
        group: "EMPLOYEES",
        items: [
          { to: "infor", icon: <FaRegUser />, text: "My information" },
          { to: "attendance", icon: <FaRegUser />, text: "My attendance" },
          { to: "task", icon: <MdOutlineTaskAlt />, text: "Task" },
          { to: "payroll", icon: <PiNotePencilDuotone />, text: "My Payroll" },
        ],
      },
    ],
    MANAGER: [
      {
        group: "MAIN MENU",
        items: [
          { to: "/login/manager", icon: <MdDashboard />, text: "Dashboard" },
          {
            to: "message",
            icon: <BiChat />,
            text: "Message",
          },
          {
            to: "notification",
            icon: <IoMdNotificationsOutline />,
            text: "Notifications",
          },
        ],
      },
      {
        group: "MANAGER",
        items: [
          { to: "infor", icon: <FaRegUser />, text: "My information" },
          { to: "attendance", icon: <FaRegUser />, text: "My attendance" },
          { to: "project", icon: <FaProjectDiagram />, text: "Projects" },
        ],
      },
    ],
    ADMIN: [
      {
        group: "MAIN MENU",
        items: [
          { to: "/login/admin", icon: <MdDashboard />, text: "Dashboard" },
          {
            to: "notification",
            icon: <IoMdNotificationsOutline />,
            text: "Notifications",
          },
        ],
      },
      {
        group: "ADMIN",
        items: [
          { to: "employee", icon: <FaRegUser />, text: "All Employees" },
          {
            to: "department",
            icon: <PiNotePencilDuotone />,
            text: "Departments",
          },
          {
            to: "admin-attendance",
            icon: <IoMdCloudUpload />,
            text: "Attendance",
          },
          {
            to: "admin-salary",
            icon: <MdOutlineAttachMoney />,
            text: "Salary & Benefits",
          },
        ],
      },
    ],
  };

  const groupedLinks = linksByRole[role] || [];

  return (
    /* parent relative để nút toggle absolute hoạt động đúng */
    <div
      className={`relative h-screen bg-white shadow-lg flex flex-col justify-between transition-all duration-300 ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-200 relative">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-[8rem] h-[8rem]" />
            {expanded}
          </div>

          {/* Toggle button: functional updater + z-index cao + accessible */}
          <button
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            onClick={() => setExpanded((prev) => !prev)} // <-- functional updater
            className="z-50 -mr-2 w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-md hover:scale-105 transition-transform absolute right-[-14px] top-5"
            style={{ pointerEvents: "auto" }}
            // keyboard accessibility
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                setExpanded((prev) => !prev);
            }}
          >
            {expanded ? (
              <FaArrowLeft className="text-[#1d3b84]" />
            ) : (
              <FaArrowRight className="text-[#1d3b84]" />
            )}
          </button>
        </div>

        {/* Sidebar Links */}
        <div className="mt-6 flex flex-col gap-6 px-3 overflow-y-auto">
          {groupedLinks.map((section, idx) => (
            <div key={idx}>
              {expanded && (
                <p className="text-xs text-gray-400 uppercase font-medium mb-3 tracking-wide pl-2">
                  {section.group}
                </p>
              )}
              <div className="flex flex-col gap-1">
                {section.items.map(({ to, icon, text, onClick }, i) => (
                  <NavLink
                    key={i}
                    to={to}
                    onClick={onClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 ${
                        expanded ? "px-4" : "px-2 justify-center"
                      } py-2 rounded-md transition-all ${
                        isActive
                          ? "text-[#1d3b84] font-medium bg-blue-50"
                          : "text-gray-600 hover:bg-blue-50 hover:text-[#1d3b84]"
                      }`
                    }
                  >
                    {/* <span className="text-lg">{icon}</span> */}
                    {/* Icon + Badge */}
                    <div className="relative">
                      <span className="text-lg">{icon}</span>

                      {/* 🔴 Hiển thị badge khi có thông báo chưa đọc */}
                      {text === "Notifications" &&
                        Number(unreadNotiCount) > 0 && (
                          <span
                            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs  
                     rounded-full w-4 h-4 flex items-center justify-center"
                          >
                            {unreadNotiCount}
                          </span>
                        )}
                    </div>
                    {expanded && (
                      <span className="text-sm truncate">{text}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Section */}
      <div className="border-t border-gray-200 px-3 py-4">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 text-gray-600 hover:text-[#1d3b84] hover:bg-blue-50 w-full rounded-md transition-all ${
            expanded ? "px-4 py-2" : "px-2 justify-center py-2"
          }`}
        >
          <BiLogOut className="text-lg" />
          {expanded && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default MainSideBar;
