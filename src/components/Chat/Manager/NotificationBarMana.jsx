// NotificationBarMana.jsx
import React from "react";
import "../Employee/EmployeeNotification.scss";

export const NotificationBarMana = ({ notification, fetchNotifications }) => {
  return (
    <div
      className={`notification-card-custom ${
        notification.read ? "read" : "unread"
      }`}
    >
      <div className="noti-header">
        <h5 className="noti-title">{notification.title}</h5>
        {!notification.read && <span className="badge-new">Chưa đọc</span> || <span className="badge-read">Đã đọc</span> }
      </div>
      <p className="noti-content">{notification.content}</p>
      <div className="noti-footer">
        <div className="sender-time">
          <span className="sender">From 👤 : {notification.sender.name}</span>
          <span className="time">🕒 {notification.createdAt}</span>
        </div>
      <div className="recipients">
       To 👥 : {notification.recipients.map(r => r.name).join(", ")}
      </div>

      </div>
    </div>
  );
};
