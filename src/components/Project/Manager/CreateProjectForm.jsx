import React, { useState } from 'react';
import axios from 'axios';

const CreateProjectForm = ({ onClose, onSave }) => {
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [departmentId, setDepartmentId] = useState(1); // Set a default departmentId

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newProject = {
            projectName,
            projectDescription,
            departmentId,
        };

        try {
            const response = await axios.post('http://localhost:8080/ems/projects/create', newProject);
            if (response.data && response.data.code === 1000) {
                // Call the onSave function passed from the parent to update the project list
                onSave(response.data.result);
                onClose(); // Close the modal after successful creation
            } else {
                console.error('Error creating project:', response.data.message);
            }
        } catch (error) {
            console.error('Error creating project:', error);
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
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="projectDescription">Project Description</label>
                    <textarea
                        id="projectDescription"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
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
                <button type="submit" className="btn btn-primary">Add New Project</button>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            </form>
        </div>
    );
};

export default CreateProjectForm;
