import React, { useState, useEffect } from "react";
import "./EmployeeNotification.scss";
import axios from "axios";
import { NotificationBar } from "./NotificationBar";
import Loading from "../../Loading/Loading";

const EmployeeNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotification = notifications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  // Fetch notifications based on personnelCode

  const fetchNotifications = async () => {
    try {
      const personelCode = localStorage.getItem("personelCode");
      const token = localStorage.getItem("token");

      if (!personelCode || !token) {
        throw new Error("Personnel code or token not found");
      }

      const response = await axios.get(
        `http://localhost:8080/api/notifications/my-notification`,
        {
          params: { personnelId: personelCode },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 1000) {
        const formattedNotifications = response.data.result.map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          sender: item.sender.name,
          createdAt: item.createdAt,
          read: item.read,
        }));
        setNotifications(formattedNotifications);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch notifications"
        );
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="notifications-container">
      <h2>Thông báo</h2>
      {notifications.length === 0 ? (
        <h1> No notification founds</h1>
      ) : (
        <>
          <div className="notifications">
            {currentNotification.map((notification) => (
              <NotificationBar
                key={notification.id}
                notification={notification}
                fetchNotifications={fetchNotifications}
                setNotifications={setNotifications}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <nav className="d-flex justify-content-center mt-4">
            <ul className="pagination">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
};

export default EmployeeNotification;
