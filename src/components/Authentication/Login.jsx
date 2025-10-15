import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import {jwtDecode } from "jwt-decode"; // 🧩 thêm dòng này
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import backgroundImage from "../assets/background.jpg";
import { API_ROUTES } from "../../api/apiRoutes";


function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {


      const response = await axios.post(API_ROUTES.PERSONNELS.LOGIN, {
        username,
        password,
      });


      console.log("Login response:", response.data);

      if (response && response.data?.result) {
        const { token, authenticated } = response.data.result;

        if (!authenticated) {
          setErrorMessage("Authentication failed!");
          return;
        }

        // 🧩 Giải mã token
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);

        // Lưu token và payload vào localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(decoded));

        // Cập nhật redux (nếu cần)
        // dispatch(login({ user: decoded, token }));

        // 🧭 Điều hướng dựa trên scope
        const scope = decoded.scope;

        if (scope === "EMPLOYEE") {
          navigate("/login/employee");
        } else if (scope === "MANAGER") {
          navigate("/login/manager");
        } else if (scope === "ADMIN") {
          navigate("/login/admin");
        } else {
          navigate("/unauthorized");
        }
      }
    } catch (error) {
      setErrorMessage("Login failed. Please check your credentials and try again.");
      console.error("Login error:", error);
    }
  };

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
        <h3 className="text-center mb-4">Login to your account</h3>
        {errorMessage && <p className="text-center text-danger mb-3">{errorMessage}</p>}
        <form onSubmit={submit}>
          <div className="mb-3 position-relative">
            <input
              type="text"
              className="form-control rounded-pill p-2 ps-4 pe-5"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <span className="position-absolute top-50 end-0 translate-middle-y me-3">
              <i className="bi bi-person"></i>
            </span>
          </div>
          <div className="mb-3 position-relative">
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
            Login
          </button>
        </form>
        <p className="text-center mt-3">
          Don't have an account?{" "}
          <a href="signup" className="text-primary">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
