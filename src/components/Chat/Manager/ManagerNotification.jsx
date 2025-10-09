import React, { useState, useEffect } from "react";
import "./ManagerNotification.scss";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { IoIosSend } from "react-icons/io";
import { NotificationBarMana } from "./NotificationBarMana";
import Loading from "../../Loading/Loading";

const ManagerNotification = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    content: "",
    senderId: 0,
    recipientIds: [],
    sendToAll: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSederNotifications = async () => {
    const token = localStorage.getItem("token");
    const personelCode = localStorage.getItem("personelCode");

    const response = await axios.get(
      `http://localhost:8080/api/notifications/my-sent?managerCode=${personelCode}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = response.data.result;
    // console.log("Fetched sender ID data beforreeeee:", data);

    if (response.data.code === 1000) {
      const formattedNotifications = response.data.result.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        sender: {
          code: item.sender.code,
          name: item.sender.name,
        },
        recipients: item.recipients.map((r) => ({
          code: r.code,
          name: r.name,
        })),
        createdAt: item.createdAt,
        read: item.read,
      }));

      setNotifications(formattedNotifications);

      console.log("Fetched sender ID data afterrrr:", formattedNotifications);
      setLoading(false);
    } else {
      throw new Error(response.data.message || "Failed to fetch notifications");
    }
    setNewNotification((prev) => ({
      ...prev,
      senderId: personelCode,
    }));
  };

  useEffect(() => {
    fetchSederNotifications();
  }, []);

  const handleSendNotification = async () => {
    try {
      const formattedNotification = {
        ...newNotification,
        recipientIds: Array.isArray(newNotification.recipientIds)
          ? newNotification.recipientIds.filter((id) => !isNaN(id))
          : [],
      };
      const response = await axios.post(
        "http://localhost:8080/api/notifications/send",
        formattedNotification
      );
      if (response.data.code === 1000) {
        // alert("Notification sent successfully!");
        toast.success("Notification sent successfully!");
        setShowCreateModal(false);
        setNewNotification({
          title: "",
          content: "",
          senderId: newNotification.senderId,
          recipientIds: [],
          sendToAll: false,
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error("Error sending notification:", err);
      // alert("Failed to send notification.");
      toast.error("Failed to send notification: " + err.message);
    }
  };

  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotification = notifications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );

  return (
    <div className="notifications-container">
      <div className="header">
        <h2>Gửi thông báo</h2>
        <button
          className="create-notification-button"
          onClick={() => setShowCreateModal(true)}
        >
          <span className="material-icons">
            <IoIosSend />
          </span>
        </button>
      </div>

      {notifications.length === 0 ? (
        <h1> No Notification founds</h1>
      ) : (
        <>
          <div className="notifications">
            {currentNotification.map((notification) => (
              <NotificationBarMana
                key={notification.id}
                notification={notification}
                fetchNotifications={fetchSederNotifications}
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

      {/* Create Notification Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tạo thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tiêu đề"
                value={newNotification.title}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    title: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formContent">
              <Form.Label>Nội dung</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập nội dung"
                value={newNotification.content}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    content: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formRecipients">
              <Form.Label>ID người nhân (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập ID người nhận cách nhau bởi dấu ,"
                value={newNotification.recipientIds.join(",")}
                onChange={(e) => {
                  const inputValue = e.target.value || "";
                  setNewNotification({
                    ...newNotification,
                    recipientIds: inputValue
                      .split(",") // Split by commas
                      .map((id) => parseInt(id.trim(), 10)) // Convert to integers, trimming spaces
                      .filter((id) => !isNaN(id)), // Filter out invalid entries
                  });
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formSendToAll">
              <Form.Check
                type="checkbox"
                label="Gửi đến tất cả nhân viên trong phòng ban"
                checked={newNotification.sendToAll}
                onChange={(e) =>
                  setNewNotification({
                    ...newNotification,
                    sendToAll: e.target.checked,
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleSendNotification}>
            Gửi thông báo
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManagerNotification;
