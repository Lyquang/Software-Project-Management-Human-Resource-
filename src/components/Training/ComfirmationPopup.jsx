import React from 'react';
import './ConfirmationPopup.css'; // CSS cho animation

const ConfirmationPopup = ({ onConfirm, onCancel }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <p>Bạn có chắc chắn với lựa chọn của mình không?</p>
                <div className="popup-buttons">
                    <button onClick={onConfirm} className="confirm-button">Xác nhận</button>
                    <button onClick={onCancel} className="cancel-button">Hủy</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPopup;
