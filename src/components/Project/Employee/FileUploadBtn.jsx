// import "./SubmitTask.css";
// import { FaFileUpload } from "react-icons/fa";
// export const FileUploadBtn = ({ taskId, setTasks, setSelectedTask}) => {
//   console.log("taskId", taskId);
//   const handleFileUpload = (event, taskId) => {
//     const files = Array.from(event.target.files);
//     setTasks((prevTasks) =>
//       prevTasks.map((t) =>
//         t.id === taskId
//           ? {
//               ...t,
//               files: files,
//               isUploaded: true,
//               isSent: false,
//             }
//           : t
//       )
//     );
//     // Cập nhật lại selectedTask để modal nhận thay đổi mới
//       const updatedTask = updatedTasks.find((t) => t.id === taskId);
//       setSelectedTask(updatedTask); // 👈 Thêm dòng này
//     console.log("pass upload", files);
//       return updatedTasks;

//   };

//   return (
//     <>
//       <input
//         type="file"
//         accept=".pdf,.doc,.docx,.jpg,.png"
//         multiple
//         id={`upload-${taskId}`}
//         style={{ display: "none" }}
//         onChange={(event) => handleFileUpload(event, taskId)}
//       />
//       <label className="upload-box" htmlFor={`upload-${taskId}`}>
//         <div className="upload-content">
//           <FaFileUpload className="icon-upload-task" />
//           <p>Drag & drop or click to upload</p>
//         </div>
//       </label>
//     </>
//   );
// };

// // <input
// //   type="file"
// //   accept=".pdf, .doc, .docx, .jpg, .png"
// //   multiple
// //   onChange={(e) => handleFileUpload(e, task.id)}
// //   className="file-input"
// //   id={`upload-${task.id}`}
// // />
// // <label htmlFor={`upload-${task.id}`} className="upload-button">
// //   📂 Upload Files
// // </label>

 import "./SubmitTask.css";
import { FaFileUpload } from "react-icons/fa";
export const FileUploadBtn = ({ taskId, setTasks, setSelectedTask }) => {
  const handleFileUpload = (event, taskId) => {
    const files = Array.from(event.target.files);
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              files: files,
              isUploaded: true,
              isSent: false,
            }
          : t
      );
      // Cập nhật lại selectedTask để modal nhận thay đổi mới
      const updatedTask = updatedTasks.find((t) => t.id === taskId);
      setSelectedTask(updatedTask); // 👈 Thêm dòng này

      return updatedTasks;
    });
  };

  return (
    <>
      <input
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.png"
        multiple
        id={`upload-${taskId}`}
        style={{ display: "none" }}
        onChange={(event) => handleFileUpload(event, taskId)}
      />
      <label className="upload-box" htmlFor={`upload-${taskId}`}>
        <div className="upload-content">
          <FaFileUpload className="icon-upload-task" />
          <p>Drag & drop or click to upload</p>
        </div>
      </label>
    </>
  );
};
