import React from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
// import { Toast } from "primereact/toast"; // Không cần dùng cái này nếu đã dùng react-toastify
import { toast, ToastContainer } from "react-toastify"; // Giữ lại nếu bạn chưa chuyển ToastContainer ra App.js
import "react-toastify/dist/ReactToastify.css";
import { API_ROUTES } from "../../api/apiRoutes";

export const DeleteDepartmentBtn = ({ departmentId, children }) => {
  const handleDelete = async () => {
    // 1. Lấy token bên trong hàm để đảm bảo luôn mới nhất
    const token = sessionStorage.getItem("token");

    if (!departmentId) {
      toast.error("❌ Thiếu mã phòng ban!");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa phòng ban này không?")) {
      try {
        console.log("🔁 Đang xóa phòng ban với ID:", departmentId);

        const removeDepartmentRes = await axios.delete(
          API_ROUTES.DEPARTMENT.DELETE(departmentId),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (removeDepartmentRes.status === 200) {
          // 2. XÓA BỎ alert() ĐỂ TOAST CHẠY MƯỢT
          toast.success("✅ Đã xóa phòng ban thành công!");
          
          // 3. Đợi toast hiện xong rồi mới reload
          setTimeout(() => {
            window.location.reload(); 
          }, 2000); // Chỉ cần 2s là đủ đọc, 6s hơi lâu
          
        } else {
          toast.error("❌ Không thể xóa phòng ban.");
        }
      } catch (error) {
        console.error("❌ Error deleting the department:", error);
        toast.error("❌ Đã xảy ra lỗi khi xóa phòng ban.");
      }
    }
  };

  return (
    <>
      {/* Tốt nhất là nên mang dòng này ra file App.js */}
      <ToastContainer position="top-right" autoClose={2000} />
      
      <span onClick={handleDelete} style={{ cursor: "pointer" }}>
        {children || "🗑"}
      </span>
    </>
  );
};

export default DeleteDepartmentBtn;