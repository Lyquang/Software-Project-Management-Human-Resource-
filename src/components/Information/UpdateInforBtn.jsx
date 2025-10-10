import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";    

const UpdateInforBtn = ({ profile, setProfile, children }) => {
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  // Temporary editable copy
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleShow = () => {
    setEditedProfile(profile); // Reset with current data
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setError(null);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const personnelCode = localStorage.getItem("personelCode");

      const updatedData = {
        street: editedProfile.address.split(",")[0].trim(),
        city: editedProfile.address.split(",")[1]?.trim() ,
        phone: editedProfile.phone,
        email: editedProfile.email,
        gender: editedProfile.gender,
      };

      const response = await fetch(
        `http://localhost:8080/ems/employee/update?personnel_code=${personnelCode}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) throw new Error("❌ Cập nhật thất bại!");

      // Update actual profile state
      setProfile((prev) => ({
        ...prev,
        ...updatedData,
        address: `${updatedData.street}, ${updatedData.city}`,
      }));

      if( response.ok){
        toast.success("Update information for you successfully")
      }

      setShowModal(false);
    } catch (err) {
      console.error("Update failed:", err);
      // setError(err.message);
      toast.error(err);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <span variant="primary" onClick={handleShow} style={{color: "blue" , fontSize: "1.2rem", cursor: "pointer"}}>
        {children ||"✏️ Update"}
      </span>

      {/* Modal */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa thông tin</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
      
              <Form.Control
                type="text"
                placeholder="Enter your updated gender"
                value={editedProfile.gender}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, gender: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                 placeholder="Enter your updated phone number"
                value={editedProfile.phone}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, phone: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">

              <Form.Control
                type="email"
                placeholder="Enter your updated Email"
                value={editedProfile.email}
                onChange={(e) =>
                  setEditedProfile({ ...editedProfile, email: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter your updated address (Street, City)"
                value={editedProfile.address.split(",")[0]}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    address: `${e.target.value}, ${
                      editedProfile.address.split(",")[1] || ""
                    }`,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter your updated city"
                value={editedProfile.address.split(",")[1]}
                onChange={(e) =>
                  setEditedProfile({
                    ...editedProfile,
                    address: `${
                      editedProfile.address.split(",")[0]
                    }, ${e.target.value}`,
                  })
                }
              />
            </Form.Group>

            {error && <p className="text-danger">Error: {error}</p>}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            💾 Save Change
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UpdateInforBtn;
