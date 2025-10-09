

import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";       

import TaskCard from "./TaskCard";

const SubmitTask = () => {


  return (
    <div className="container ">
      <ToastContainer />
      <h2 className="text-center text-primary mb-4 fw-bold">My Task</h2>
      <TaskCard/>
      
    </div>
  );
};

export default SubmitTask;
