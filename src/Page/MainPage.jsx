import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import MainSideBar from "./MainSideBar";
import "bootstrap/dist/css/bootstrap.min.css";
import { ThemeProvider } from "../ThemeContext";
import ThemeSwitcher from "../ThemeSwitcher";
import { toast, ToastContainer } from "react-toastify";
import Message_icon from "../components/assets/icon_message.svg";
import { jwtDecode } from "jwt-decode";
import "../index.css";

const MainPage = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [tokenData, setTokenData] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarExpanded((prev) => !prev);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No token found. Please login again.");
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log("Decoded token in MainPage:", decoded);
      setTokenData(decoded);
    } catch (err) {
      console.error("Invalid token:", err);
      toast.error("Invalid token. Please login again.");
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  if (!tokenData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div>Loading user info...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ToastContainer />
      <div className="d-flex vh-100 bg-red-600" style={{ zIndex: 0 }}>
        {/* Sidebar */}
        <div className="main-sidebar">
          <MainSideBar
            expanded={isSidebarExpanded}
            toggleSidebar={toggleSidebar}
            tokenData={tokenData} // pass decoded data
          />
        </div>

        {/* Main content */}
        <div className="flex-grow-1 p-1  w-50 bg-">
          <Outlet context={{ tokenData }} />
        </div>

        {/* Floating buttons */}
        {/* <div>
          <a className="btn-to-top rounded-circle shadow-lg" title="Lên đầu trang">
            <ThemeSwitcher />
          </a>

          <a
            href="#"
            className="btn-message btn-primary rounded-circle shadow-lg"
            title="Liên hệ & Góp ý"
          >
            <span className="rounded-circle">
              <img className="img-message" src={Message_icon} alt="message" />
            </span>
          </a>
        </div> */}
      </div>
    </ThemeProvider>
  );
};

export default MainPage;
