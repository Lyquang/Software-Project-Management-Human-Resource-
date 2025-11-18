import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

const AdminSalaryModal = ({ show, handleClose, record, handleSave }) => {
    const [formData, setFormData] = useState({
        totalWorkHours: 0,
        overtimeHours: 0,
        fullDayWork: 0,
        halfDayWork: 0,
        absenceDays: 0,
        lateDays: 0,
        notEnoughHourDays: 0,
        positionAllowance: 0,
        overtimePay: 0,
        penalty: 0
    });
    
    const [loading, setLoading] = useState(false);
    const [detailedRecord, setDetailedRecord] = useState(null);

    const API_URL = "https://ems-toq5.onrender.com/ems/";

    const getHeaders = () => ({
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        "Content-Type": "application/json",
    });

    // Fetch detailed salary data when modal opens
    useEffect(() => {
        if (show && record?.id) {
            fetchSalaryDetail(record.id);
        }
    }, [show, record]);

    const fetchSalaryDetail = async (id) => {
        try {
            setDetailedRecord(record);
            if (record) {
                setFormData({
                    totalWorkHours: record.totalWorkHours || 0,
                    overtimeHours: record.overtimeHours || 0,
                    fullDayWork: record.fullDayWork || 0,
                    halfDayWork: record.halfDayWork || 0,
                    absenceDays: record.absenceDays || 0,
                    lateDays: record.lateDays || 0,
                    notEnoughHourDays: record.notEnoughHourDays || 0,
                    positionAllowance: record.positionAllowance || 0,
                    overtimePay: record.overtimePay || 0,
                    penalty: record.penalty || 0
                });
            }
        } catch (error) {
            console.error("Error fetching salary details:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSubmit = async () => {
        if (!record?.id) {
            alert("No record selected");
            return;
        }

        setLoading(true);
        try {
            await handleSave({
                id: record.id,
                ...formData
            });
            handleClose();
        } catch (error) {
            console.error("Error updating salary:", error);
            alert("Failed to update salary. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const calculateCalculatedFields = () => {
        return {
            socialInsurance: detailedRecord?.socialInsurance || 0,
            healthInsurance: detailedRecord?.healthInsurance || 0,
            unemploymentInsurance: detailedRecord?.unemploymentInsurance || 0,
            personalIncomeTax: detailedRecord?.personalIncomeTax || 0,
            grossSalary: detailedRecord?.grossSalary || 0,
            totalDeductions: detailedRecord?.totalDeductions || 0,
            netSalary: detailedRecord?.netSalary || 0
        };
    };

    const calculated = calculateCalculatedFields();

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    Edit Salary - {record?.personnelName} ({record?.personnelCode})
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {record && (
                    <div className="space-y-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Period</label>
                                <p className="font-semibold">{record.month}/{record.year}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Position</label>
                                <p className="font-semibold">{record.position || "N/A"}</p>
                            </div>
                        </div>

                        {/* Work Hours & Attendance */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Total Work Hours
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="form-control"
                                    name="totalWorkHours"
                                    value={formData.totalWorkHours}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Overtime Hours
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="form-control"
                                    name="overtimeHours"
                                    value={formData.overtimeHours}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Attendance Details */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Day Work
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="fullDayWork"
                                    value={formData.fullDayWork}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Half Day Work
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="halfDayWork"
                                    value={formData.halfDayWork}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Absence Days
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="absenceDays"
                                    value={formData.absenceDays}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Late Days
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="lateDays"
                                    value={formData.lateDays}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Not Enough Hour Days
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="notEnoughHourDays"
                                    value={formData.notEnoughHourDays}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Allowances & Deductions */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Position Allowance
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="form-control"
                                    name="positionAllowance"
                                    value={formData.positionAllowance}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Overtime Pay
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="form-control"
                                    name="overtimePay"
                                    value={formData.overtimePay}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Penalty
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                className="form-control"
                                name="penalty"
                                value={formData.penalty}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Calculated Fields (Read-only) */}
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <h6 className="font-semibold text-blue-800 mb-2">Calculated Fields</h6>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Gross Salary:</span>
                                    <span className="ml-2 font-semibold">${calculated.grossSalary?.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Net Salary:</span>
                                    <span className="ml-2 font-semibold text-green-600">${calculated.netSalary?.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Total Deductions:</span>
                                    <span className="ml-2 font-semibold text-red-600">${calculated.totalDeductions?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AdminSalaryModal;