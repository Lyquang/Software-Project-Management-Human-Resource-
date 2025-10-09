import React, { useState } from 'react';
import './EmployeeTraining.scss';
import Modal from './Modal'; // Import the modal component

const EmployeeTraining = () => {
    const initialTrainings = [
        { title: 'MOS', description: 'Microsoft Office Specialist certification', details: 'This certification demonstrates proficiency in Microsoft Office applications.', file: null, uploaded: false, sent: false, id: 1, color: '#FFDDC1' },
        { title: 'DATA', description: 'Data Analysis certification', details: 'This certification validates data analysis and interpretation skills.', file: null, uploaded: false, sent: false, id: 2, color: '#FFABAB' },
        { title: 'AWS Certified', description: 'AWS Cloud Practitioner certification', details: 'This certification verifies knowledge of AWS cloud concepts and services.', file: null, uploaded: false, sent: false, id: 3, color: '#FFC3A0' },
        { title: 'PMP', description: 'Project Management Professional certification', details: 'This certification reflects competency in project management practices.', file: null, uploaded: false, sent: false, id: 4, color: '#D5AAFF' },
        { title: 'ITIL', description: 'IT Infrastructure Library certification', details: 'This certification provides best practices in IT service management.', file: null, uploaded: false, sent: false, id: 5, color: '#85E3FF' },
        { title: 'CCNA', description: 'Cisco Certified Network Associate', details: 'This certification validates skills in networking and Cisco technologies.', file: null, uploaded: false, sent: false, id: 6, color: '#B9FBC0' },
    ];

    const [trainings, setTrainings] = useState(initialTrainings);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState({ title: '', text: '' });

    const handleFileChange = (index, event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
            const newTrainings = [...trainings];
            newTrainings[index].file = file;
            newTrainings[index].uploaded = true; // Mark as uploaded
            setTrainings(newTrainings);
        }
    };

    const handleSendClick = (index) => {
        const newTrainings = [...trainings];
        newTrainings[index].sent = true; // Mark as sent
        setTrainings(newTrainings);

        console.log("pass send");
    };

    const handleDeleteFile = (index) => {
        const newTrainings = [...trainings];
        newTrainings[index].file = null;
        newTrainings[index].uploaded = false; // Mark as not uploaded
        newTrainings[index].sent = false; // Reset sent status
        setTrainings(newTrainings);
        console.log("pass delete");
    };

    const handleRequestPromotion = () => {
        if (trainings.every(training => training.sent)) {
            setModalMessage({ title: 'Promotion Successful!', text: 'Congratulations! You have all the certificates needed for promotion.' });
        } else {
            setModalMessage({ title: 'Promotion Denied!', text: 'You still lack certificates to be promoted.' });
        }
        setIsModalOpen(true); // Open the modal

        console.log(" passs promotion")
    };

    return (
        <div className="employee-training">
            <h2>Các chứng chỉ đào tạo</h2>
            <div className="training-grid">
                {trainings.map((training, index) => (
                    <div key={training.id} className="training-card" style={{ backgroundColor: training.color }}>
                        <h3>{training.title}</h3>
                        <p className="training-description">{training.description}</p>
                        <p className="training-details">{training.details}</p>
                        <input
                            type="file"
                            accept=".pdf,image/*"
                            id={`file-upload-${index}`}
                            onChange={(e) => handleFileChange(index, e)}
                            className="file-upload"
                        />
                        <label htmlFor={`file-upload-${index}`} className="upload-button">
                            <i className="fas fa-upload"></i> Upload File
                        </label>
                        {training.file && (
                            <>
                                <p className="file-name">{training.file.name}</p>
                                {training.file.type.startsWith('image/') && (
                                    <img
                                        src={URL.createObjectURL(training.file)}
                                        alt="File preview"
                                        className="file-preview"
                                    />
                                )}
                            </>
                        )}
                        {training.uploaded && !training.sent ? (
                            <button
                                className="send-button"
                                onClick={() => handleSendClick(index)}
                                style={{ backgroundColor: '#4caf50' }} // Green color for "Send"
                            >
                                Gửi
                            </button>
                        ) : null}
                        {training.sent && (
                            <button className="sent-button" style={{ backgroundColor: '#4caf50' }} disabled>
                                Đã hoàn thành
                            </button>
                        )}
                        <button
                            className="delete-button"
                            onClick={() => handleDeleteFile(index)}
                            style={{ backgroundColor: '#FF5722' }} // Orange for delete button
                        >
                            Xóa
                        </button>
                    </div>
                ))}
            </div>
            <button className="promotion-button" onClick={handleRequestPromotion}>Request Promotion</button>
            <Modal 
                message={modalMessage} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default EmployeeTraining;
