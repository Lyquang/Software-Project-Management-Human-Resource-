import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_ROUTES } from "../../../api/apiRoutes";

const CreateNotification = ({ fetchNotifications, userRole}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [employees, setEmployees] = useState([]);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("token");
    const departmentId = sessionStorage.getItem("departmentId");
  console.log("Department ID in create Notifications:", departmentId);

  // 🔹 Fetch employees from Department 1
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          API_ROUTES.MANAGERS.GET_MY_EMPLOYEES(departmentId),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEmployees(res.data.result.employees || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch employees.");
      }
    };
    fetchEmployees();
  }, []);

  // 🔹 Toggle employee selection
  const toggleSelect = (code) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // 🔹 Send notification
  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      if (userRole?.toLowerCase() === "manager") {
        if (selectedCodes.length === 0) {
          toast.warning("Please select at least one recipient.");
          return;
        }
        const managerSentPayload = {
          subject: title,
          message: message,
          receivers: selectedCodes,
        };

        console.log("Payload to send:", managerSentPayload);

        const sentManagerResponse = await axios.post(
          API_ROUTES.MANAGERS.SEND_NOTIFICATION,
          managerSentPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(" Notification from Manager sent successfully!");
        setTitle("");
        setMessage("");
        setSelectedCodes([]);
        setShowModal(false);
      } else if (userRole?.toLowerCase() === "admin") {
        const adminSentPayload = {
          subject: title,
          message: message,
        };

        console.log("Payload to send:", adminSentPayload);

        const sentAdminResponse = await axios.post(
          API_ROUTES.PERSONNELS.SENT_ADMIN_NOTIFICATIONS,
          adminSentPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(
          "Notification from Human Resources Department sent successfully!"
        );
        setTitle("");
        setMessage("");
        setShowModal(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to send notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />

      {/* 🔘 Button to open modal */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md"
      >
        <Bell className="w-5 h-5" />
        Create Notification
      </button>

      {/* 🔹 Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 relative"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Bell className="text-indigo-600" />
                  Create a Notification
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter notification title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  rows="4"
                  placeholder="Enter message content..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Recipients from manager */}
              {userRole?.toLowerCase() === "manager" && (
                <div className="mb-6">
                  <label className="block font-medium text-gray-700 mb-2">
                    Select Recipients
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                    {employees.map((emp) => (
                      <button
                        key={emp.code}
                        onClick={() => toggleSelect(emp.code)}
                        className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                          selectedCodes.includes(emp.code)
                            ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                            : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {emp.avatar ? (
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300" />
                          )}
                          <span className="text-sm font-medium">
                            {emp.name}
                          </span>
                        </div>
                        {selectedCodes.includes(emp.code) && (
                          <CheckCircle className="text-green-600 w-5 h-5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {userRole?.toLowerCase() === "admin" && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 font-semibold">
                    As an admin, the notification will be sent to all employees.
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-4 border-t pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className={`px-6 py-2 rounded-lg text-white font-medium shadow-md transition ${
                    loading
                      ? "bg-indigo-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreateNotification;
