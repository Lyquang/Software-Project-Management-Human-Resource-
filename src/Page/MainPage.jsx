import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import MainSideBar from "./MainSideBar";
import Header from "./Header"
import "bootstrap/dist/css/bootstrap.min.css";
import { ThemeProvider } from "../context/ThemeContext";
import { toast, ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import "../index.css";
import DefautAvartar from "../components/assets/defaut_pho.png"

const MainPage = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [tokenData, setTokenData] = useState(null);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarExpanded((prev) => !prev);
    const token = sessionStorage.getItem("token");
    const avartarUrl = sessionStorage.getItem("avartarUrl");

  useEffect(() => {
  
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
      console.log("Invalid token at mainpage:", err);
      toast.error("Invalid token. Please login again.");
      sessionStorage.removeItem("token");
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
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <MainSideBar
          // expanded={isSidebarExpanded}
          // toggleSidebar={toggleSidebar}
          // tokenData={tokenData}
        />

      
        <div className="flex flex-col flex-1">
          <Header
            userName={tokenData?.sub || "User"}
            avatarUrl={avartarUrl || DefautAvartar}
          />
          <main className="flex-1 p-4 overflow-y-auto">
            <Outlet context={{ tokenData }} />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default MainPage;
