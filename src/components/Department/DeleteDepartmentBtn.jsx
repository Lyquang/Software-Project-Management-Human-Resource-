import React from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toast } from 'primereact/toast';
        
        

export const DeleteDepartmentBtn = ({ departmentId, children }) => {
  const handleDelete = async () => {
    if (!departmentId) {
      // alert("❌ Thiếu mã phòng ban!");
      toast.error("Thiếu mã phòng ban!");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa phòng ban này không?")) {
      try {
        console.log("🔁 Đang xóa phòng ban với ID:", departmentId);

        // B1: Xóa trưởng phòng
        const removeManagerRes = await axios.post(
          "http://localhost:8080/api/managers/remove",
          null,
          { params: { deptId: departmentId } }
        );

        if (removeManagerRes.status === 200) {
          console.log("✅ Trưởng phòng đã được xóa thành công.");

          // B2: Xóa phòng ban
          const removeDepartmentRes = await axios.delete(
            "http://localhost:8080/api/departments/delete",
            { params: { id: departmentId } }
          );

          if (removeDepartmentRes.status === 200) {
            // alert("✅ Đã xóa phòng ban thành công!");
            toast.success("Delete Department successfully!");
            window.location.reload(); // Or call a prop like onDeleteSuccess() to re-fetch
          } else {
            // alert("❌ Không thể xóa phòng ban.");
            toast.error("Cannot delete the department.");
          }
        } else {
          // alert("❌ Không thể xóa trưởng phòng.");
          toast.error("Cannot remove the manager.");
        }
      } catch (error) {
        console.error("❌ Error deleting the department:", error);
        if (error.response) {
          console.log("📥 Server response code:", error.response.status);
          console.log("📥 Server response data:", error.response.data);
        }
        // alert("❌ Đã xảy ra lỗi khi xóa phòng ban.");
        toast.error("Error occurred while deleting the department.");
      }
    }
  };

  return (
    <span onClick={handleDelete} style={{ cursor: "pointer" }}>
      {children || "🗑"}
    </span>
  );
};

export default DeleteDepartmentBtn;
