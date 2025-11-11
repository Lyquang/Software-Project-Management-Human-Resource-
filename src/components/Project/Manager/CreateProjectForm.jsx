import React, { useState } from 'react';
import { API_ROUTES } from '../../../api/apiRoutes';
import { toast } from 'react-toastify';

const CreateProjectForm = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [departmentId, setDepartmentId] = useState(0);
    const [maxParticipants, setMaxParticipants] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newProject = {
            name,
            description,
            department_id: Number(departmentId),
            max_participants: Number(maxParticipants) || 0,
        };

        try {
            const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
            const res = await fetch(API_ROUTES.PROJECT.CREATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(newProject),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || (data && data.code !== 200 && data.code !== 0)) {
                toast.error(data?.message || `Create failed (${res.status})`);
                return;
            }
            onSave(data.result);
            onClose();
        } catch (error) {
            console.error('Error creating project:', error);
            toast.error('Error creating project');
        }
    };

    return (
        <div className="create-project-form">
            <h3>Add New Project</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="projectName">Project Name</label>
                    <input
                        type="text"
                        id="projectName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="projectDescription">Project Description</label>
                    <textarea
                        id="projectDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="departmentId">Department ID:</label>
                    <input
                        type="number"
                        id="departmentId"
                        value={departmentId}
                        onChange={(e) => setDepartmentId(Number(e.target.value))}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="maxParticipants">Max Participants:</label>
                    <input
                        type="number"
                        id="maxParticipants"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(Number(e.target.value))}
                        min={0}
                    />
                </div>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700">Add New Project</button>
                <button type="button" className="ml-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50" onClick={onClose}>Cancel</button>
            </form>
        </div>
    );
};

export default CreateProjectForm;
