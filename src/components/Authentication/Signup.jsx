// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate, Link } from "react-router-dom";
// import './Signup.css'; // Import the external CSS

// function Signup() {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   async function submit(e) {
//     e.preventDefault();

//     try {
//       const res = await axios.post("http://localhost:3001/signup", { email, password });
//       if (res.data === "exist") {
//         setErrorMessage("User already exists");
//       } else if (res.data === "notexist") {
//         navigate("/home", { state: { id: email } });
//       }
//     } catch (e) {
//       setErrorMessage("There was an error with the signup. Please try again.");
//       console.log(e);
//     }
//   }

//   return (
//     <div className="signup-container">
//       <table className="signup-table">
//         <thead>
//           <tr>
//             <td id="subTitle" className="signup-title">
//               BK Manager
//             </td>
//           </tr>
//         </thead>
//         <tbody className="signup-body">
//           <tr>
//             <td>
//               <table className="signup-content">
//                 <tr>
//                   <td id="pageContent" className="signup-box">
//                     <h1 className="signup-heading">Đăng ký</h1>
//                     {errorMessage && <p className="error-message">{errorMessage}</p>}
//                     <form className="signup-form" onSubmit={submit}>
//                       <div className="form-group">
//                         <label htmlFor="email" className="form-label">
//                           Tên đăng nhập
//                         </label>
//                         <input
//                           type="email"
//                           id="email"
//                           value={email}
//                           onChange={(e) => setEmail(e.target.value)}
//                           placeholder="Enter your username"
//                           className="form-input"
//                         />
//                       </div>
//                       <div className="form-group">
//                         <label htmlFor="password" className="form-label">
//                           Mật khẩu
//                         </label>
//                         <input
//                           type="password"
//                           id="password"
//                           value={password}
//                           onChange={(e) => setPassword(e.target.value)}
//                           placeholder="Enter your password"
//                           className="form-input"
//                         />
//                       </div>
//                       <div>
//                         <button type="submit" className="submit-button">
//                           Đăng ký
//                         </button>
//                       </div>
//                     </form>
//                     <div className="alternative">
//                       <p className="alt-text">OR</p>
//                       <Link to="/login" className="login-link">
//                         Đến phần Đăng Nhập
//                       </Link>
//                     </div>
//                     <hr className="separator" />
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default Signup;

// không cần làm
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // Ensure this path is correct
import backgroundImage from "../assets/background.jpg"; // Ensure this path is correct

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  async function submit(e) {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8080/signup", { email, password });
      if (res.data === "exist") {
        setErrorMessage("User already exists");
      } else if (res.data === "notexist") {
        navigate("/home", { state: { id: email } });
      }
    } catch (e) {
      setErrorMessage("There was an error with the signup. Please try again.");
      console.log(e);
    }
  }

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
        <h3 className="text-center mb-4">Sign up to your account</h3>
        {errorMessage && <p className="text-center text-danger mb-3">{errorMessage}</p>}
        <form onSubmit={submit}>
          <div className="mb-3 position-relative">
            <div className="position-relative">
              <input
                className="form-control rounded-pill p-2 ps-4 pe-5"
                placeholder="Enter your username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="position-absolute top-50 end-0 translate-middle-y me-3">
                <i className="bi bi-envelope"></i>
              </span>
            </div>
          </div>
          <div className="mb-3 position-relative">
            <div className="position-relative">
              <input
                type={passwordVisible ? "text" : "password"}
                className="form-control rounded-pill p-2 ps-4 pe-5"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer" }}
              >
                <i className={passwordVisible ? "bi bi-eye-slash" : "bi bi-eye"}></i>
              </span>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="rememberMe" />
              <label className="form-check-label" htmlFor="rememberMe">
                Remember me
              </label>
            </div>
            <a href="#" className="text-primary">
              Forget Password?
            </a>
          </div>
          <button type="submit" className="btn btn-primary w-100 rounded-pill">
            Sign up
          </button>
        </form>
        <p className="text-center mt-3">
          Already have an account? <Link to="/login" className="text-primary">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
