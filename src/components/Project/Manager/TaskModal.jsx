import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./TaskModal.scss";
import axios from "axios";

const TaskModal = ({ projectId, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showCreateTaskForm, setShowCreateTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
    employeeId: "",
  });

  useEffect(() => {
    const fetchTasksByProjectId = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8080/ems/tasks/project?id=${projectId}`
        );
        if (response.data.code === 1000) {
          setTasks(response.data.result || []);
        } else {
          console.error("Error fetching tasks:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/ems/projects/employees?code=${projectId}`
        );
        if (
          response.data.code === 1000 &&
          Array.isArray(response.data.result)
        ) {
          setEmployees(response.data.result);
        } else {
          console.error("API did not return a valid result:", response.data);
          setEmployees([]);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      }
    };

    if (projectId) {
      fetchTasksByProjectId();
      fetchEmployees();
    }
  }, [projectId]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const toggleEditMode = (index) => {
    if (editingIndex === index) {
      const task = tasks[index];
      updateStatus(task.tasksId, task.status);
    }
    setEditingIndex(editingIndex === index ? null : index);
  };

  const handleInputChange = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  const updateStatus = async (taskId, status) => {
    try {
      const url = `http://localhost:8080/ems/tasks/status-update?id=${taskId}&status=${status}`;
      const response = await axios.patch(url); // Sử dụng PATCH để cập nhật trạng thái trên server
      if (response.data.code === 1000) {
        alert("Cập nhật trạng thái thành công!");
      } else {
        console.error("Lỗi khi cập nhật trạng thái:", response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái.");
    }
  };

  const assignEmployee = async (taskId, employeeId) => {
    try {
      const url = `http://localhost:8080/ems/tasks/assign?taskId=${taskId}&employeeId=${employeeId}`;
      const response = await axios.patch(url);
      alert("Gán nhân viên thành công!");
    } catch (error) {
      console.error("Error assigning employee:", error);
      alert("Có lỗi xảy ra khi gán nhân viên.");
    }
  };

  const deleteTask = async (taskId, index) => {
    try {
      const url = `http://localhost:8080/ems/tasks/${taskId}`; // URL API xóa task
      const response = await axios.delete(url); // Gọi API DELETE
      if (response.status === 200 && response.data.code === 1000) {
        // Kiểm tra phản hồi từ server
        const updatedTasks = tasks.filter((_, i) => i !== index); // Cập nhật danh sách task sau khi xóa
        setTasks(updatedTasks); // Gán danh sách mới vào state
        alert("Xóa nhiệm vụ thành công!"); // Thông báo thành công
      } else {
        alert(
          `Xóa nhiệm vụ thất bại: ${
            response.data.message || "Lỗi không xác định"
          }`
        );
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Có lỗi xảy ra khi xóa nhiệm vụ.");
    }
  };

  const handleCreateTask = async () => {
    if (
      !newTask.title ||
      !newTask.description ||
      !newTask.deadline ||
      !newTask.employeeId
    ) {
      alert("Vui lòng nhập đầy đủ thông tin nhiệm vụ.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/ems/tasks/create",
        {
          title: newTask.title,
          description: newTask.description,
          deadline: newTask.deadline,
          status: "IN_PROGRESS",
          projectId,
          employeeId: newTask.employeeId,
        }
      );

      if (response.data.code === 1000) {
        setTasks((prev) => [...prev, response.data.result]);
        setShowCreateTaskForm(false);
        setNewTask({
          title: "",
          description: "",
          deadline: "",
          employeeId: "",
        });
        alert("Nhiệm vụ đã được tạo thành công!");
      } else {
        console.error("Error creating task:", response.data.message);
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Có lỗi xảy ra khi tạo nhiệm vụ.");
    }
  };

  return (
    <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
      <div className="modal-dialog modal-lg task-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">List of Employees</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div
            className="modal-body"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            {loading ? (
              <p>Loading ...</p>
            ) : tasks.length > 0 ? (
              <div className="task-list">
                {tasks.map((task, index) => (
                  <div
                    key={task.tasksId}
                    className="task-item border rounded p-3 mb-3 d-flex flex-column position-relative"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Task Name: {task.title}</h6>
                      <div>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => toggleEditMode(index)}
                        >
                          {editingIndex === index ? "Lưu" : "Chỉnh sửa"}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteTask(task.tasksId, index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="row mb-2">
                      <div className="col-md-6">
                        <strong>Decription:</strong>
                        <p>{task.description || "Chưa có mô tả"}</p>
                      </div>
                      <div className="col-md-6">
                        <strong>Deadline:</strong>
                        <p>{formatDate(task.due) || "Chưa có hạn chót"}</p>
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-md-6">
                        <strong>Status:</strong>
                        {editingIndex === index ? (
                          <select
                            className="form-select"
                            value={task.status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              handleInputChange(index, "status", newStatus);
                            }}
                          >
                            <option value="COMPLETED">Completed</option>
                            <option value="IN_PROGRESS">In progress</option>
                          </select>
                        ) : (
                          <p>{task.status || "Chưa có trạng thái"}</p>
                        )}
                      </div>
                      <div className="col-md-6">
                        <strong>Project:</strong>
                        <p>{task.projectName || "Chưa có tên dự án"}</p>
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className="col-md-6">
                        <strong>Employee Assign:</strong>
                        {editingIndex === index ? (
                          <select
                            className="form-select"
                            value={task.employeeId || ""}
                            onChange={(e) => {
                              const selectedEmployeeId = e.target.value;
                              assignEmployee(task.tasksId, selectedEmployeeId);
                            }}
                          >
                            <option value="">Choose Employee</option>
                            {employees.map((employee) => (
                              <option
                                key={employee.employeeId}
                                value={employee.employeeId}
                              >
                                {employee.firstName} {employee.lastName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p>{task.employeeName || "Chưa phân công"}</p>
                        )}
                      </div>
                      <div className="col-md-6">
                        <strong>File Attachments</strong>
                        {task.fileName ? (
                          <a
                            href={task.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none text-primary"
                          >
                            {task.fileName}
                          </a>
                        ) : (
                          <p>Not yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Not have tasks for this project.</p>
            )}
            
            
            
            {/* api  http://localhost:8080/ems/tasks/create   create Task                     */}
            {showCreateTaskForm && (
              <div className="create-task-form border rounded p-3 mt-3">
                <h5>Create new Task</h5>
                <div className="mb-3">
                  <label className="form-label">Task Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Decription</label>
                  <textarea
                    className="form-control"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Deadline:</label>
                  <input
                    type="date"
                    className="form-control"
                    value={newTask.deadline}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        deadline: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Employee Assigned</label>
                  <select
                    className="form-select"
                    value={newTask.employeeId}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        employeeId: e.target.value,
                      }))
                    }
                  >
                    <option value="">Choose Employee</option>
                    {employees.map((employee) => (
                      <option
                        key={employee.employeeId}
                        value={employee.employeeId}
                      >
                        {employee.firstName} {employee.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="btn btn-success" onClick={handleCreateTask}>
                  Create Task
                </button>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateTaskForm(!showCreateTaskForm)}
            >
              {showCreateTaskForm ? "Cancel" : "Create new task"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
