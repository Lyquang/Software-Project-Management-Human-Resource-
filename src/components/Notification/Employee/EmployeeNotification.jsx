import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";
import NotificationBar from "./NotificationBar";
import CreateNotification from "../Manager/CreateNotification";
import { API_ROUTES } from "../../../api/apiRoutes";
import Pagination from "../../common/Pagination";

dayjs.extend(relativeTime);

const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [sentNotifications, setSentNotifications] = useState([]); // ✅ lưu thông báo đã gửi
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [unreadNotiCount, setUnradCount] = useState(0);

  const departmentId = sessionStorage.getItem("departmentId");
  console.log("Department ID in EmployeeNotifications:", departmentId);

  const pageSize = 5;
  const scope = sessionStorage.getItem("scope");

  // useEffect(() => {
  //   if (scope) setUserRole(scope);

  //   fetchNotifications();
  // }, []);

  useEffect(() => {
    if (scope && userRole !== scope) setUserRole(scope);
    console.log("my role", userRole);
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadNotiCount]);

  // ✅ Fetch tất cả thông báo mà nhân viên nhận
  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(API_ROUTES.PERSONNELS.GET_MY_NOTIFICATIONS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.code === 200) {
        setNotifications(res.data.result);
        const unreadNotiCount = notifications.filter(
          (noti) => noti.read == false
        ).length;
        sessionStorage.setItem("unreadNotiCount", unreadNotiCount);
        console.log("thong bao chuaw doc", unreadNotiCount);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch thông báo đã gửi của Manager and admin
  const fetchSentNotifications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      if (userRole?.toLowerCase() === "manager") {
        const resManagerSent = await axios.get(
          API_ROUTES.MANAGERS.GET_MY_SENT_NOTIFICATIONS,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (resManagerSent.data.code === 200) {
          setSentNotifications(resManagerSent.data.result);
        }
      } else if (userRole?.toLowerCase() === "admin") {
        const resAdminSent = await axios.get(
          API_ROUTES.PERSONNELS.GET_ADMIN_SENT_NOTIFICATIONS,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (resAdminSent.data.code === 200) {
          setSentNotifications(resAdminSent.data.result);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching sent notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Khi đổi tab sang “Đã gửi” → gọi API
  useEffect(() => {
    if (activeTab === "sent") {
      fetchSentNotifications();
    }
  }, [activeTab]);

  const getSenderType = (n) => {
    if (!n.sender) return "human resources";
    if (/^\w+$/.test(n.sender)) return "manager";
    return (n.senderRole || n.sender || "").toLowerCase();
  };

  // ✅ Lọc và nhóm dữ liệu cho tab “received” (thông báo đến)
  const filteredNotifications = notifications.filter((n) => {
    const senderType = getSenderType(n);
    const matchSearch = n.subject
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchTab =
      activeTab === "all"
        ? true
        : activeTab === "human resources"
        ? senderType === "human resources"
        : activeTab === "manager"
        ? senderType === "manager"
        : false;
    return matchSearch && matchTab;
  });

  const sortedNotifications = [...filteredNotifications].sort(
    (a, b) => new Date(b.sendAt) - new Date(a.sendAt)
  );

  const totalPages = Math.ceil(sortedNotifications.length / pageSize);
  const paginatedNotifications = sortedNotifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const groupedFiltered = paginatedNotifications.reduce((acc, noti) => {
    const date = dayjs(noti.sendAt).format("DD MMMM, YYYY");
    if (!acc[date]) acc[date] = [];
    acc[date].push(noti);
    return acc;
  }, {});

  // ✅ Hiển thị riêng cho tab “Đã gửi”
  const sortedSent = [...sentNotifications].sort(
    (a, b) => new Date(b.sendAt) - new Date(a.sendAt)
  );

  const totalSentPages = Math.ceil(sortedSent.length / pageSize);
  const paginatedSent = sortedSent.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const groupedSent = paginatedSent.reduce((acc, noti) => {
    const date = dayjs(noti.sendAt).format("DD MMMM, YYYY");
    if (!acc[date]) acc[date] = [];
    acc[date].push(noti);
    return acc;
  }, {});

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Bell className="text-blue-500" />
          <h1 className="text-xl font-semibold">Notifications</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-2 rounded-xl shadow-md mb-6 gap-3 flex-wrap">
        <input
          type="text"
          placeholder="🔍 Search by subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[2rem] md:w-1/3 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 outline-none"
        />

        {(userRole?.toLowerCase() === "manager" ||
          userRole?.toLowerCase() === "admin") && (
          <CreateNotification
            fetchNotifications={fetchNotifications}
            userRole={userRole}
          />
        )}

        {(userRole?.toLowerCase() === "employee" ||
          userRole?.toLowerCase() === "manager") && (
          <button
            onClick={() => setActiveTab("human resources")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "human resources"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            Thông báo chung
          </button>
        )}

        {(userRole?.toLowerCase() === "manager" ||
          userRole?.toLowerCase() === "admin") && (
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "sent"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            Thông báo đã gửi
          </button>
        )}

        {userRole?.toLowerCase() === "employee" && (
          <button
            onClick={() => setActiveTab("manager")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "manager"
                ? "bg-blue-600 text-white shadow"
                : "text-gray-700 hover:text-blue-600"
            }`}
          >
            Thông báo nội bộ
          </button>
        )}
      </div>

      {activeTab === "sent" ? (
        <>
          <NotificationBar
            groupedFiltered={groupedSent}
            isSentTab
            userRole={userRole}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalSentPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <>
          <NotificationBar
            groupedFiltered={groupedFiltered}
            fetchNotifications={fetchNotifications}
            userRole={userRole}
          />

          {/* Pagination cho các tab khác */}
          {activeTab !== "sent" && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default EmployeeNotifications;
