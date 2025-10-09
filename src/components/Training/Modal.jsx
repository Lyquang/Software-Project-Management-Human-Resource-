import React from 'react';
import './Modal.scss'; // Import the SCSS for styling

const Modal = ({ message, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{message.title}</h2>
                <p>{message.text}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default Modal;
