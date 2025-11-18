import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

const AdjustRateModal = ({ show, handleClose, rates, handleSave }) => {
    const [formData, setFormData] = useState({
        fullShiftRate: 0,
        halfShiftRate: 0
    });
    const [loading, setLoading] = useState(false);

    // Sync formData với rates prop khi modal mở
    useEffect(() => {
        if (show && rates) {
            setFormData({
                fullShiftRate: rates.fullShiftRate || 0,
                halfShiftRate: rates.halfShiftRate || 0
            });
        }
    }, [show, rates]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSubmit = async () => {
        console.log('Final data before save:', formData);

        // Validation
        if (formData.fullShiftRate <= 0 || formData.halfShiftRate <= 0) {
            alert('Vui lòng nhập giá trị hợp lệ (lớn hơn 0)');
            return;
        }

        setLoading(true);

        try {
            // Sử dụng URL đúng từ API
            const API_URL = "https://ems-toq5.onrender.com/ems/";
            
            const response = await axios.patch(
                `${API_URL}/salary/payrate-edit`,
                null,
                {
                    params: {
                        fullWorkPay: formData.fullShiftRate,
                        halfWorkPay: formData.halfShiftRate,
                    },
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                    }
                }
            );

            console.log('API Response:', response.data);

            if (response.data.code === 1000) {
                alert('Cập nhật hệ số thành công!');
                handleSave(formData);
                handleClose();
            } else {
                alert(`Lỗi: ${response.data.message || 'Đã có lỗi xảy ra'}`);
            }
        } catch (error) {
            console.error('Error updating rates:', error);
            
            if (error.response) {
                // Server responded with error
                alert(`Lỗi từ server: ${error.response.data?.message || error.response.statusText}`);
            } else if (error.request) {
                // Request made but no response
                alert('Không thể kết nối đến server. Vui lòng kiểm tra kết nối!');
            } else {
                // Other errors
                alert('Đã có lỗi xảy ra. Vui lòng thử lại!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Điều chỉnh hệ số</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <label className="form-label">Lương 1 ca (Full Shift)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        name="fullShiftRate"
                        value={formData.fullShiftRate}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Nhập hệ số lương 1 ca"
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Lương nửa ca (Half Shift)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        name="halfShiftRate"
                        value={formData.halfShiftRate}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Nhập hệ số lương nửa ca"
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