import React, { useRef } from "react";
import { toast, ToastContainer } from "react-toastify";    

export const AvatarUploadBtn = ({ setProfile,children }) => {
    const fileInputRef = useRef();
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    console.log("toggle");

    // ✅ Kiểm tra định dạng PNG hoặc JPG
    if (!file || !["image/png", "image/jpeg"].includes(file.type)) {
    // if( !file || file.type !== "image/png" && file.type !== "image/jpeg") {
      alert("Vui lòng tải lên ảnh PNG hoặc JPG");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:8080/ems/images/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Không thể tải ảnh lên server");
      }

      const data = await response.json();

      // ✅ Cập nhật URL ảnh đại diện vào profile state
      if (setProfile) {
        setProfile((prev) => ({
          ...prev,
          profileImage: data.imageUrl,
        }));
      }
      toast.success("New avartar is updated")
      // alert("✅ Ảnh đại diện đã được cập nhật!");
    } catch (err) {
      // console.error("Lỗi khi upload avatar:", err);
      // alert("❌ Đã xảy ra lỗi khi tải ảnh đại diện");
      toast.error("Error with uploading avatar")
    }
  };

    const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <span className="btn btn-outline-primary btn-sm mb-2" 
            onClick={triggerFileInput}
            style={{ cursor: "pointer" }}
        >
        
        {children || "Chọn ảnh đại diện"}
        <input
          type="file"
          accept="image/png, image/jpeg"
          ref={fileInputRef}
          onChange={handleAvatarUpload}
          className="d-none"
        />
      </span>
    </div>
  );
};

export default AvatarUploadBtn;
