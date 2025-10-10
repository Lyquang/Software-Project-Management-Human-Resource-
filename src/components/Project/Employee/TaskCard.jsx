// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FileUploadBtn } from "./FileUploadBtn";
// import { DeleteFileBtn } from "./DeleteFileBtn";
// import { SendFileBtn } from "./SendFileBtn";
// import { useSelector } from "react-redux";
// import "./SubmitTask.css"

// export const TaskCard = () => {
//   const { personnel } = useSelector((state) => state);

//   const [tasks, setTasks] = useState([]);
//   const personelCode = localStorage.getItem("personelCode");
//   console.log("personelCode at SubmitTask >>>> ", personelCode);
//   const fetchTasks = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:8080/ems/tasks/employee",
//         {
//           params: { code: personelCode },
//         }
//       );
//       if (response.data && response.data.result) {
//         const fetchedTasks = response.data.result.map((task) => ({
//           id: task.tasksId,
//           name: task.title,
//           description: task.description,
//           due: formatDueDate(task.due),
//           status: task.status,
//           proj_id: task.projectName,
//           files: task.fileName
//             ? [{ name: task.fileName, url: task.fileUrl }]
//             : [],
//           isUploaded: false,
//           isSent: false,
//         }));
//         setTasks(fetchedTasks);
//       } else {
//         console.error("No tasks found for the employee.");
//       }
//     } catch (error) {
//       console.error("Error fetching tasks:", error);
//     }
//   };

//   useEffect(() => {
//     fetchTasks();
//   }, [personelCode]);

//   const formatDueDate = (due) => {
//     const date = new Date(due); // Parse the ISO string into a Date object
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
//     const day = String(date.getDate()).padStart(2, "0");
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     const seconds = String(date.getSeconds()).padStart(2, "0");

//     return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
//   };

//   return (
//     <div className="row">
//       {tasks.map((task) => (
//         <div key={task.id} className="col-md-6 col-lg-4 mb-4 ">
//           <div
//             className={`card shadow-sm h-100
//           ${
//             task.status === "COMPLETED"
//               ? "bg-success"
//               : task.status === "OVERDUE"
//               ? "bg-danger text-white "
//               : "bg-warning text-white"
//           }`}
//           >
//             <div className="card-header fw-bold" >
//               Title: {task.name || "N/A"}{" "}
//             </div>

//             <div className="card-body" >
//               <ul className="list-unstyled medium g-4">
//                 <li>
//                   <strong>TaskID:</strong> {task.id}
//                 </li>
//                 <li>
//                   <strong>Belong to the Project :</strong> {task.proj_id}
//                 </li>
//                 <li>
//                   <strong>Task description :</strong> {task.description}
//                 </li>
//                 <li>
//                   <strong>Ngày hết hạn:</strong> {task.due}
//                 </li>
//                 <li>
//                   <strong>Trạng thái:</strong> {task.status}
//                 </li>
//               </ul>

//               <div className="text-center mt-3">
//                 <FileUploadBtn taskId={task.id} setTasks={setTasks} />
//                 <SendFileBtn taskId={task.id} task={task} setTasks={setTasks} />
//                 <DeleteFileBtn
//                   taskId={task.id}
//                   task={task}
//                   setTasks={setTasks}
//                 />
//               </div>

//               {task.files?.length > 0 && (
//                 <div className="mt-3">
//                   <p className="mb-1 font-italic text-muted">Tệp đã tải lên:</p>
//                   {task.files.map((file, index) => (
//                     <a
//                       key={index}
//                       href={file.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="d-block text-truncate card-text"
//                     >
//                       📄 {file.name}
//                     </a>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };
// export default TaskCard;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileUploadBtn } from "./FileUploadBtn";
import { DeleteFileBtn } from "./DeleteFileBtn";
import { SendFileBtn } from "./SendFileBtn";
import { useSelector } from "react-redux";
import { Modal, Button } from "react-bootstrap"; // import modal của Bootstrap
import "./SubmitTask.css";
import { Pointer } from "lucide-react";

export const TaskCard = () => {
  const { personnel } = useSelector((state) => state);
  const [tasks, setTasks] = useState([]);
  const personelCode = localStorage.getItem("personelCode");
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/ems/tasks/employee",
        {
          params: { code: personelCode },
        }
      );
      if (response.data?.result) {
        const fetchedTasks = response.data.result.map((task) => ({
          id: task.tasksId,
          name: task.title,
          description: task.description,
          due: task.due,
          status: task.status,
          proj_id: task.projectName,
          files: task.fileName
            ? [{ name: task.fileName, url: task.fileUrl }]
            : [],
          isUploaded: false,
          isSent: false,
        }));
        setTasks(fetchedTasks);
      } else {
        console.error("No tasks found for the employee.");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [personelCode]);

  const getCardBgClass = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return "card-in-progress";
      case "COMPLETED":
        return "card-completed";
      case "OVERDUE":
        return "card-overdue";
      default:
        return "card-default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "NOT_STARTED":
        return <span className="badge bg-secondary">Chưa làm</span>;
      case "IN_PROGRESS":
        return <span className="badge bg-dark">Đang làm</span>;
      case "COMPLETED":
        return <span className="badge bg-info text-dark">Đã nộp</span>;
      case "REJECTED":
        return <span className="badge bg-danger">Bị trả về</span>;
      case "OVERDUE":
        return <span className="badge bg-danger">Quá hạn</span>;
      default:
        return <span className="badge bg-warning">Không xác định</span>;
    }
  };

  const calculateOverdueDays = (due) => {
    const dueDate = new Date(due);
    const today = new Date();
    const diffMs = today - dueDate;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return days;
  };

  const handelCardClick = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  return (
    <div className="row">
      {tasks.map((task) => {
        const isOverdue = new Date(task.due) < new Date();
        const overdueDays = isOverdue ? calculateOverdueDays(task.due) : 0;

        return (
          <div key={task.id} className="col-md-6 col-lg-4 mb-4">
            <div
              className={` ${getCardBgClass(
                task.status
              )} h-100 shadow-sm border-1 rounded-4 p-4 `}
              onClick={() => handelCardClick(task)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="text-dark m-0">
                    TASKID-{task.id.toString().padStart(3, "0")}
                  </h6>
                  {getStatusLabel(task.status)}
                </div>

                <h5 className="fw-bold mb-2">{task.name}</h5>
                {/* <p className="text-muted mb-2">{task.proj_id}</p> */}
                <p className="mb-3">{task.description}</p>

                <div className="d-flex align-items-center mb-2">
                  <span className="me-2">📅</span>
                  <span>{new Date(task.due).toLocaleDateString("vi-VN")}</span>
                </div>

                {isOverdue && (
                  <div className="text-danger small fw-semibold mb-2">
                    ⏰ Quá hạn {overdueDays} ngày
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal chi tiết task */}
      {selectedTask && (
        <Modal
          show={isModalOpen}
          onHide={() => setModalOpen(false)}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Decription: {selectedTask.description}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col">
                <div >
                <FileUploadBtn taskId={selectedTask.id} setTasks={setTasks}  setSelectedTask={setSelectedTask}/>
                </div>

                <SendFileBtn
                  taskId={selectedTask.id}
                  task={selectedTask}
                  setTasks={setTasks}
                />
                <DeleteFileBtn
                  taskId={selectedTask.id}
                  task={selectedTask}
                  setTasks={setTasks}
                />
              </div>
              <div className="col">
                {  selectedTask.files.length > 0 && fetchTasks() && (
                  <div className="mt-3">
                    <p className="mb-1 text-muted">Tệp đã tải lên:</p>
                    {selectedTask.files.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="d-block text-truncate"
                      >
                        📄 {file.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default TaskCard;
