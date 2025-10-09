// NotificationBar.jsx
import React from "react";
import "./EmployeeNotification.scss";
import { MarkAsReadBtn } from "./MarkAsReadBtn";

export const NotificationBar = ({ notification, fetchNotifications }) => {
  return (
    <div
      className={`notification-card-custom ${
        notification.read ? "read" : "unread"
      }`}
    >
      <div className="noti-header">
        <h5 className="noti-title">{notification.title}</h5>
                <h5 className="noti-title">{notification.id}</h5>
        {!notification.read && <span className="badge-new">Mới</span> || <span className="badge-read">Đã đọc</span> } 
      </div>
      <p className="noti-content">{notification.content}</p>
      <div className="noti-footer">
        <div className="sender-time">
          <span className="sender">👤 {notification.sender}</span>
          <span className="time">🕒 {notification.createdAt}</span>
        </div>
        {!notification.read && (
          <MarkAsReadBtn
            notificationId={notification.id}
            fetchNotifications={fetchNotifications}
          />
        )}
      </div>
    </div>
  );
};
