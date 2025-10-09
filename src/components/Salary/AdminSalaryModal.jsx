import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import './AdminSalaryModal.scss';

const AdminSalaryModal = ({ show, handleClose, record, handleSave }) => {
    const [formData, setFormData] = useState({
        bonus: '',
        penalty: '',
        real_pay: '',
    });

    useEffect(() => {
        if (record) {
            setFormData({
                bonus: record.bonus || '',
                penalty: record.penalty || '',
                real_pay: record.realPay || '',
            });
        }
    }, [record]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.bonus || !formData.penalty) {
            alert('Vui lòng điền đầy đủ thông tin tiền thưởng và tiền phạt!');
            return;
        }

        try {
            const response = await axios.patch(
                `http://localhost:8080/api/salary/bonus-penalty?id=${record.id}&bonus=${formData.bonus}&penalty=${formData.penalty}`
            );

            if (response.data.code === 1000) {
                alert('Cập nhật thành công!');
                handleSave(response.data.result); // Update the parent component
                handleClose();
            } else {
                alert('Đã có lỗi xảy ra. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Error updating bonus and penalty:', error);
            alert('Không thể cập nhật. Vui lòng kiểm tra lại!');
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Sửa lương lại cho {record?.firstName} {record?.lastName}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <label className="form-label">Tiền thưởng</label>
                    <input
                        type="number"
                        className="form-control"
                        name="bonus"
                        value={formData.bonus}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Phạt</label>
                    <input
                        type="number"
                        className="form-control"
                        name="penalty"
                        value={formData.penalty}
                        onChange={handleChange}
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Đóng
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Lưu thay đổi
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AdminSalaryModal;
