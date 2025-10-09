// ManagerDevideTask.js
import React, { useState } from 'react';
import './ManagerDivideTask.scss';


const ManagerDevideTask = ({ project, onClose, onSave }) => {
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('COMPLETED');
    const [employeeId, setEmployeeId] = useState('');

    const handleSave = () => {
        const newTask = {
            projectId: project.id,
            description,
            dueDate,
            status,
            employeeId,
        };
        onSave(newTask);
        onClose();
    };

    return (
        <div className="edit-task-modal">
            <div className="edit-task-content">
                <h3>Phân chia công việc</h3>
                <label>
                    Mô tả công việc:
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                </label>
                <label>
                    Ngày hết hạn:
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </label>
                <label>
                    Trạng Thái:
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="OVERDUE">Quá hạn</option>
                        <option value="CANCEL">Hủy</option>
                    </select>
                </label>
                <label>
                    Giao cho Nhân viên (ID):
                    <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
                </label>
                <button onClick={handleSave}>Save</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default ManagerDevideTask;
