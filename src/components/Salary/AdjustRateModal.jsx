import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

const AdjustRateModal = ({ show, handleClose, rates, handleSave }) => {
    const [formData, setFormData] = useState(rates);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedFormData = { ...formData, [name]: parseFloat(value) };
        setFormData(updatedFormData);
        console.log(`Updated field: ${name}, Value: ${value}`); // For debugging
    };

    const handleSubmit = async () => {
        console.log('Final data before save:', formData); // For debugging

        // Start loading state
        setLoading(true);

        try {
            // Call API to update rates
            const response = await axios.patch(
                `http://localhost:8080/ems/salary/payrate-edit`,
                null,
                {
                    params: {
                        fullWorkPay: formData.fullShiftRate,
                        halfWorkPay: formData.halfShiftRate,
                    },
                }
            );

            if (response.data.code === 1000) {
                alert('Cập nhật hệ số thành công!');
                handleSave(formData); // Update parent state with new rates
                handleClose();
            } else {
                alert('Đã có lỗi xảy ra, vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Error updating rates:', error);
            alert('Không thể cập nhật hệ số. Vui lòng kiểm tra kết nối!');
        } finally {
            setLoading(false); // Stop loading state
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Điều chỉnh hệ số</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <label className="form-label">Lương 1 ca</label>
                    <input
                        type="number"
                        className="form-control"
                        name="fullShiftRate"
                        value={formData.fullShiftRate}
                        onChange={handleChange}
                        disabled={loading} // Disable input during loading
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Lương nửa ca</label>
                    <input
                        type="number"
                        className="form-control"
                        name="halfShiftRate"
                        value={formData.halfShiftRate}
                        onChange={handleChange}
                        disabled={loading} // Disable input during loading
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    Đóng
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AdjustRateModal;
