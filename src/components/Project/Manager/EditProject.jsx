import React, { useState, useEffect } from 'react';
import './EditProject.scss';
import axios from 'axios';

const EditProject = ({ onClose, onSave }) => {
    const [departments, setDepartments] = useState([]);
    const [project, setProject] = useState({
        name: '',
        description: '',
        departmentId: ''
    });

    const [errors, setErrors] = useState({
        projectName: '',
        departmentId: ''
    });

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/departments/all');
                if (response.data && response.data.code === 1000 && Array.isArray(response.data.result)) {
                    setDepartments(response.data.result);
                } else {
                    console.error('Invalid data format:', response.data);
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
            const response = await axios.post('http://localhost:8080/api/projects/create', {
                projectName: project.name,
                projectDescription: project.description,
                departmentId: project.departmentId
            });

            if (response.data && response.data.code === 1000) {
                onSave(response.data.result);
                onClose();
            } else {
                console.error('Error creating project:', response.data.message);
            }
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
                                    <option key={department.departmentId} value={department.departmentId}>
                                        {department.departmentName}
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
