import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";       
import TaskManagementPage from "./TaskManagementPage";

const SubmitTask = () => {
  return (
    <div className="container ">
      <ToastContainer />
      <h2 className="text-center text-primary mb-4 fw-bold">My Task</h2>
      <TaskManagementPage/>
    </div>
  );
};

export default SubmitTask;
