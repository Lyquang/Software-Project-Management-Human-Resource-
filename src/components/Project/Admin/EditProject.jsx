c// EditTask.js
import React, { useState } from 'react';
import './EditProject.css';

const EditProject = ({ project, onClose, onSave }) => {
    const [name, setName] = useState(project.name);
    const [company, setCompany] = useState(project.company);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [assignedPerson, setAssignedPerson] = useState('');

    const handleSave = () => {
        const updatedProject = {
            ...project,
            name,
            company,
            startDate,
            endDate,
            assignedPerson,
        };
        onSave(updatedProject);
        onClose();
    };

    return (
        <div className="edit-task-modal">
            <div className="edit-task-content">
                <h3></h3>
                <label>
                    Project Name:
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label>
                    Company:
                    <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
                </label>
                <label>
                    Start Date:
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </label>
                <label>
                    End Date:
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </label>
                <label>
                    Assign Person (ID):
                    <input type="text" value={assignedPerson} onChange={(e) => setAssignedPerson(e.target.value)} />
                </label>
                <button onClick={handleSave}>Save</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default EditProject;
