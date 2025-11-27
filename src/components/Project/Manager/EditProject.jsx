import React, { useState, useEffect } from 'react';
import './EditProject.scss';
import { API_ROUTES } from '../../../api/apiRoutes';
import { toast } from 'react-toastify';

const EditProject = ({ onClose, onSave }) => {
    const [project, setProject] = useState({
        name: '',
        description: '',
        departmentId: '',
        maxParticipants: ''
    });

    const [deptName, setDeptName] = useState('');

    const [errors, setErrors] = useState({
        projectName: '',
        departmentId: ''
    });

    // Fetch current user's department from myInfo
    useEffect(() => {
        const fetchMyInfo = async () => {
            try {
                const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
                const res = await fetch(API_ROUTES.PERSONNELS.MY_INFO, {
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || data?.code !== 200) {
                    throw new Error(data?.message || `Failed (${res.status})`);
                }
                const deptId = data?.result?.departmentId;
                const deptName = data?.result?.departmentName;
                setProject(prev => ({ ...prev, departmentId: deptId || '' }));
                setDeptName(deptName || '');
            } catch (err) {
                console.error('Error fetching my info:', err);
                toast.error(err.message || 'Cannot load your department');
            }
        };
        fetchMyInfo();
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
                toast.error(data?.message || 'Create project failed');
                return;
            }
            toast.success('Project created');
            onSave(data.result);
            onClose();
        } catch (error) {
            console.error('Error creating project:', error);
            toast.error('Error creating project');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#ffffff', borderRadius: 12 }}>
                <div className="modal-content" style={{ backgroundColor: '#ffffff' }}>
                    <div className="modal-header">
                        <h2>Create Project</h2>
                        <button type="button" className="btn-close btn-primary" aria-label="Close" onClick={onClose}></button>
                    </div>
                    <form className="form-container">
                        <label>
                            Department:
                            <input
                                type="text"
                                value={deptName || ''}
                                readOnly
                                className="form-control"
                                placeholder="Department"
                            />
                            <input type="hidden" name="departmentId" value={project.departmentId} />
                            {errors.departmentId && <p className="error">{errors.departmentId}</p>}
                        </label>
                        <label>
                            Project Name:
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter project name"
                                value={project.name}
                                onChange={handleChange}
                            />
                            {errors.projectName && <p className="error">{errors.projectName}</p>}
                        </label>
                        <label>
                            Project Description:
                            <textarea
                                name="description"
                                placeholder="Enter project description"
                                value={project.description}
                                onChange={handleChange}
                            />
                        </label>
                        <label>
                            Max Participants:
                            <input
                                type="number"
                                name="maxParticipants"
                                placeholder="Enter maximum number of participants"
                                value={project.maxParticipants}
                                onChange={handleChange}
                                min={0}
                            />
                        </label>
                    </form>
                    <div className="action-buttons">
                        <button onClick={handleSave} className="btn btn-primary btn-success">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProject;
