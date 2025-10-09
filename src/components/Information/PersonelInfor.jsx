import "bootstrap/dist/css/bootstrap.min.css";
import { PersonelInforCard } from "./PersonelInforCard";
import "./PersonelInfor.css"

const PersonelInfor = () => {
  return (
    <div className="container my-4 ">
       <h2 className="text-center  mb-4 fw-bold">My Information</h2>
      <PersonelInforCard />
    </div>
  );
};
export default PersonelInfor;
