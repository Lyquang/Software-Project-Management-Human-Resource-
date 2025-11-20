import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Bell, CheckCircle, Circle } from "lucide-react";
import MarkAsRead from "./MarkAsRead";
import DeleteNotification from "../Manager/DeleteNotification";

dayjs.extend(relativeTime);

const NotificationBar = ({ groupedFiltered, fetchNotifications, userRole }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-2xl shadow-inner">
      {Object.keys(groupedFiltered).length === 0 && (
        <p className="text-center text-gray-500 py-6">No notifications found</p>
      )}

      {Object.entries(groupedFiltered).map(([date, notis]) => (
        <div key={date} className="mb-8">
          <h2 className="text-gray-500 text-sm mb-3 font-medium uppercase tracking-wide">
            {date === dayjs().format("DD MMMM, YYYY") ? "Today" : date}
          </h2>

          <div className="flex flex-col gap-4">
            {notis.map((n) => (
              <div
                key={n.id}
                className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5`}
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      alt="avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 text-base">
                        {n.subject}
                      </p>

                      {userRole?.toLowerCase() === "employee" && (
                        <p className="text-sm text-gray-500 bg-green-100 inline-block px-2 py-0.5 rounded-md mt-1">
                          From :{" "}
                          <span className="font-medium text-blue-600">
                            {n.sender || "Human Resources Department"}
                          </span>{" "}
                        </p>
                      )}

                      {userRole?.toLowerCase() === "manager" && (
                        <p className="text-sm text-gray-500 bg-green-100 inline-block px-2 py-0.5 rounded-md mt-1">
                          To:{" "}
                          <span className="font-medium text-blue-600">
                            {Array.isArray(n.recipients)
                              ? n.recipients.join(", ")
                              : n.recipients || "My Employees"}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-gray-400">
                    {dayjs(n.sendAt).fromNow()}
                  </span>
                </div>

                {/* Body */}
                <p className="text-gray-700 text-sm mt-3 leading-relaxed">
                  {n.content}
                </p>

                {/* Footer */}
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                        n.priority === "High"
                          ? "bg-red-100 text-red-600"
                          : n.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {n.priority || "Normal Priority"}
                    </span>

                    {n.read ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <Circle size={14} className="text-blue-500" />
                    )}
                  </div>

                  { (userRole?.toLowerCase() === "manager" || userRole?.toLowerCase() === "admin") && (
                    <div className="flex justify-end">
                      <DeleteNotification notificationId={n.id} />
                    </div>
                  )}

                  {userRole?.toLowerCase() === "employee" && (
                    <MarkAsRead
                      notificationId={n.id}
                      isRead={n.read}
                      onMarkAsRead={fetchNotifications}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationBar;
