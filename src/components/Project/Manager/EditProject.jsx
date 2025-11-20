import React, { useState, useEffect } from 'react';
import './EditProject.scss';
import axios from 'axios';
import { API_ROUTES } from '../../../api/apiRoutes';

const EditProject = ({ onClose, onSave }) => {
    const [departments, setDepartments] = useState([]);
    const [project, setProject] = useState({
        name: '',
        description: '',
        departmentId: '',
        maxParticipants: ''
    });

    const [errors, setErrors] = useState({
        projectName: '',
        departmentId: ''
    });

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
                const response = await fetch(API_ROUTES.DEPARTMENT.GET_ALL, {
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const data = await response.json().catch(() => ({}));
                if (response.ok && data && Array.isArray(data.result)) {
                    setDepartments(data.result);
                } else {
                    console.error('Invalid data format:', data);
                    setDepartments([]);
                }
            } catch (error) {
                console.error('Error fetching departments:', error);
                setDepartments([]);
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!project.name || !project.departmentId) {
            setErrors((prev) => ({
                ...prev,
                projectName: !project.name ? 'Project name is required' : '',
                departmentId: !project.departmentId ? 'Department is required' : ''
            }));
            return;
        }

        try {
            const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
            const payload = {
                name: project.name,
                description: project.description,
                department_id: Number(project.departmentId),
                max_participants: project.maxParticipants === '' ? 0 : Number(project.maxParticipants),
            };
            const res = await fetch(API_ROUTES.PROJECT.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || (data && data.code !== 200 && data.code !== 0)) {
                console.error('Error creating project:', data?.message || res.status);
                return;
            }
            onSave(data.result);
            onClose();
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>Tạo dự án</h2>
                        <button type="button" className="btn-close btn-primary" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <form className="form-container">
                        <label>
                            Phòng ban:
                            <select
                                name="departmentId"
                                value={project.departmentId}
                                onChange={handleChange}
                            >
                                <option value="">Chọn phòng ban</option>
                                {departments.map((department) => (
                                    <option key={department.departmentId || department.id} value={department.departmentId || department.id}>
                                        {department.departmentName || department.name}
                                    </option>
                                ))}
                            </select>
                            {errors.departmentId && <p className="error">{errors.departmentId}</p>}
                        </label>
                        <label>
                            Tên dự án:
                            <input
                                type="text"
                                name="name"
                                placeholder="Nhập tên dự án"
                                value={project.name}
                                onChange={handleChange}
                            />
                            {errors.projectName && <p className="error">{errors.projectName}</p>}
                        </label>
                        <label>
                            Mô tả dự án:
                            <textarea
                                name="description"
                                placeholder="Nhập mô tả dự án"
                                value={project.description}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Số lượng thành viên tối đa:
                            <input
                                type="number"
                                name="maxParticipants"
                                placeholder="Nhập số lượng tối đa"
                                value={project.maxParticipants}
                                onChange={handleChange}
                                min={0}
                            />
                        </label>
                    </form>
                    <div className="action-buttons">
                        <button onClick={handleSave} className="btn btn-primary btn-success">
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProject;
