// import React from "react";
// import { useLocation, Link } from "react-router-dom";
// import './Home.css'; // Importing the CSS file

// function Home() {
//   const location = useLocation();

//   return (
//     <div className="home-container">
//       <div className="home-box">
//         <h2 className="home-title">Đăng nhập</h2>
//         <ul className="home-links">
//           <li>
//             <Link to="/login" className="home-link home-employee">
//               Nhân viên
//             </Link>
//           </li>
//           <li>
//             <Link to="/login" className="home-link home-manager">
//               Quản lý
//             </Link>
//           </li>
//           <li>
//             <Link to="/login" className="home-link home-hr">
//               Phòng Nhân sự
//             </Link>
//           </li>
//         </ul>
//       </div>
//     </div>
//   );
// }

// export default Home;

import React from "react";
import { useLocation, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // Ensure this path is correct
import backgroundImage from "../assets/background.jpg"; // Ensure this path is correct

function Home() {
  const location = useLocation();

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="p-5 rounded-3 shadow-lg w-25 d-flex flex-column justify-content-center"
        style={{
          minHeight: "450px",
          minWidth: "400px",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h2 className="text-center mb-4">Đăng nhập</h2>
        <ul className="list-unstyled home-links">
          <li className="mb-3">
            <Link to="/login" className="btn btn-primary w-100 rounded-pill home-link home-employee">
              Nhân viên
            </Link>
          </li>
          <li className="mb-3">
            <Link to="/login" className="btn btn-primary w-100 rounded-pill home-link home-manager">
              Quản lý
            </Link>
          </li>
          <li className="mb-3">
            <Link to="/login" className="btn btn-primary w-100 rounded-pill home-link home-hr">
              Phòng Nhân sự
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
