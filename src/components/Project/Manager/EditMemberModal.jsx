import React, { useState, useEffect } from "react";
import "./EditMemberModal.scss";
import { API_ROUTES } from "../../../api/apiRoutes";
import Loading from "../../Loading/Loading";

const EditMemberModal = ({ onClose, onSave, projectDetails }) => {
    const [currentMembers, setCurrentMembers] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const fetchProjectEmployees = async () => {
        if (!projectDetails?.id) {
            setMessage("Project ID not provided.");
            setIsLoading(false);
            return;
        }

        try {
            const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
            const response = await fetch(API_ROUTES.PROJECT.EMPLOYEES(projectDetails.id), {
                headers: {
                    Accept: 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const data = await response.json().catch(() => ({}));
            
            if (response.ok && (data?.code === 200 || data?.code === 0) && data?.result) {
                setCurrentMembers(Array.isArray(data.result) ? data.result : []);
                setMessage("");
            } else {
                setMessage("Failed to fetch employees: " + (data?.message || "Unknown error"));
                setCurrentMembers([]);
            }
        } catch (err) {
            setMessage("Error fetching employees: " + err.message);
            console.error("Error fetching employees:", err);
            setCurrentMembers([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectEmployees();
    }, [projectDetails?.id]);

    return (
        <>
            <div className="overlay" onClick={onClose}></div>
            <div className="member-modal">
                <div className="modal-content">
                    {isLoading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <>
                            <div className="modal-header d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5 className="mb-1">Project Members</h5>
                                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                        {projectDetails?.name || 'Project'} - {currentMembers.length} {currentMembers.length === 1 ? 'member' : 'members'}
                                    </p>
                                </div>
                                <button className="close-btn btn-danger" onClick={onClose}>
                                    ×
                                </button>
                            </div>

                            <ul className="member-list list-unstyled">
                                {currentMembers.length > 0 ? (
                                    currentMembers.map((member, index) => (
                                        <li
                                            key={member.code || index}
                                            className="member-item p-3 mb-2 border rounded d-flex align-items-center"
                                            style={{ backgroundColor: '#f8f9fa' }}
                                        >
                                            <div className="member-avatar me-3">
                                                {member.avatar ? (
                                                    <img 
                                                        src={member.avatar} 
                                                        alt={member.name}
                                                        className="rounded-circle"
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div 
                                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                                        style={{ width: '40px', height: '40px', fontWeight: 'bold' }}
                                                    >
                                                        {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="member-info flex-grow-1">
                                                <div className="fw-bold">{member.name || 'Unknown'}</div>
                                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                    <span className="me-3">📧 {member.email || 'N/A'}</span>
                                                    <span className="me-3">📱 {member.phone || 'N/A'}</span>
                                                </div>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    <span className="badge bg-secondary me-2">{member.code}</span>
                                                    <span className="badge bg-info">{member.position || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-center text-muted py-4">
                                        <p>No employees in this project.</p>
                                    </li>
                                )}
                            </ul>

                            {message && (
                                <div className="alert alert-danger mt-3" role="alert">
                                    {message}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default EditMemberModal;
