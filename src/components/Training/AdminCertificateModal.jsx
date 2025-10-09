import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Check, X } from 'phosphor-react';

import './AdminCertificateModal.scss';

const AdminCertificateModal = ({ show, handleClose, employee, handleSave }) => {
    const initialTrainings = [
        { title: 'MOS', image: `${process.env.PUBLIC_URL}/Certificate.png`, accepted: false, rejected: false, id: 1, color: '#FFDDC1' },
        { title: 'DATA', image: `${process.env.PUBLIC_URL}/Certificate.png`, accepted: false, rejected: false, id: 2, color: '#FFABAB' },
        { title: 'AWS Certified', image: `${process.env.PUBLIC_URL}/Certificate.png`, accepted: false, rejected: false, id: 3, color: '#FFC3A0' },
        { title: 'PMP', image: `${process.env.PUBLIC_URL}/Certificate.png`, accepted: false, rejected: false, id: 4, color: '#D5AAFF' },
        { title: 'ITIL', image: `${process.env.PUBLIC_URL}/Certificate.png`, accepted: false, rejected: false, id: 5, color: '#85E3FF' },
        { title: 'CCNA', image: `${process.env.PUBLIC_URL}/Certificate.png`, accepted: false, rejected: false, id: 6, color: '#B9FBC0' },
    ];

    const [trainings, setTrainings] = useState(initialTrainings);

    const handleAcceptClick = (index) => {
        const newTrainings = [...trainings];
        newTrainings[index].accepted = true;
        newTrainings[index].rejected = false;
        setTrainings(newTrainings);
    };

    const handleRejectClick = (index) => {
        const newTrainings = [...trainings];
        newTrainings[index].rejected = true;
        newTrainings[index].accepted = false;
        setTrainings(newTrainings);
    };

    const onSave = () => {
        handleSave(employee);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} centered className="employee-profile-modal">
            <Modal.Header closeButton>
                <Modal.Title>Đào tạo và phát triển</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="admin-training-form">
                    <div className="training-grid">
                        {trainings.map((training, index) => (
                            <div key={training.id} className="training-card" style={{ backgroundColor: training.color }}>
                                <h3>{training.title}</h3>
                                <img
                                    src={training.image}
                                    alt={`${training.title} certificate`}
                                    className={`certificate-image ${training.rejected ? 'grayscale' : ''}`}
                                />

                                {/* Hiển thị nút "Duyệt" và "Từ chối" chỉ khi chưa có lựa chọn */}
                                {(!training.accepted && !training.rejected) && (
                                    <div className="button-group">
                                        <button
                                            className="accept-button"
                                            onClick={() => handleAcceptClick(index)}
                                            style={{ backgroundColor: '#4caf50', marginRight: '10px' }}
                                        >
                                            Duyệt
                                        </button>
                                        <button
                                            type="button"
                                            className="reject-button"
                                            onClick={() => handleRejectClick(index)}
                                            style={{ backgroundColor: '#f44336' }}
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                )}


                                {/* Hiển thị biểu tượng "Check" khi được Duyệt */}
                                {training.accepted && (
                                    <div className="accepted-icon">
                                        <Check size={20} color="#4caf50" />
                                    </div>
                                )}

                                {/* Hiển thị biểu tượng "X" khi bị Từ chối */}
                                {training.rejected && (
                                    <div className="rejected-icon">
                                        <X size={20} color="#f44336" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Đóng
                </Button>
                <Button variant="primary" onClick={onSave}>
                    Lưu
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AdminCertificateModal;
