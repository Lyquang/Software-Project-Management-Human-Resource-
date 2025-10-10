import axios from "axios";
import React from "react";
import { toast } from "react-toastify";

export const SendFileBtn = ({ taskId, task, setTasks }) => {
  const personelCode = localStorage.getItem("personelCode");
  const isSent = task?.isSent;

  const submitTask = (taskId, file, personelCode) => {
    const formData = new FormData();
    formData.append("taskId", taskId);
    formData.append("file", file);
    formData.append("personnelId", personelCode);

    try {
      axios.post("http://localhost:8080/ems/tasks/submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Submit Successful");
    } catch (error) {
      toast.error("Submit error");
    }
  };

  const handleSendFiles = async () => {
    if (!task || !task.files || task.files.length === 0) {
      toast.warning("Please upload a file before submitting.");
      // alert("Please upload a file before submitting.");
      return;
    }

    try {
      const file = task.files[0];
      const response = await submitTask(taskId, file, personelCode);
      console.log("Response: >>", response);

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? { ...t, isSent: true } : t))
      );
    } catch (error) {
      // console.error("Error uploading files:", error);
      toast.error("An error occurred while uploading files.");
    }
  };

  return (
    <button
      className={`btn mx-1 ${isSent ? "btn-success" : "btn-primary"}`}
      onClick={handleSendFiles}
      disabled={isSent}
    >
      {isSent ? "✅ Done" : "📤 Submit"}
    </button>
  );
};
