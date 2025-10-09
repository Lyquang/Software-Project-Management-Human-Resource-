
import React, { useState } from 'react'
import { Star, Files, Plus, User, Medal } from 'phosphor-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap'; // Nhập Modal từ react-bootstrap
import AdminCertificateModal from './AdminCertificateModal.js'
import './AdminTraining.scss'
import ConfirmationPopup from './ComfirmationPopup.js';

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />


function getPositionColor(position) {
    switch (position) {
        case "Mobile Developer":
            return "#FFD700"; // Vàng
        case "QA/QC Engineer":
            return "#ADD8E6"; // Xanh nhạt
        case "UI/UX Designer":
            return "#DDA0DD"; // Tím nhạt
        case "Quality Assurance":
            return "#98FB98"; // Xanh lá nhạt
        case "Employee":
            return "#87CEFA"; // Xanh dương nhạt
        case "Software Engineer":
            return "#fc88dd"
        default:
            return "#d3d3d3"; // Xám nhạt cho các chức vụ không xác định
    }
}

const EmployeeCard = ({ employee, onProfileClick, index }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [actionType, setActionType] = useState(''); // "approve" hoặc "reject" để xác định hành động

    const handleApprove = () => {
        setActionType('approve');
        setShowPopup(true);
    };

    const handleReject = () => {
        setActionType('reject');
        setShowPopup(true);
    };

    const handleConfirm = () => {
        setShowPopup(false);
        if (actionType === 'approve') {
            // Thực hiện logic cho duyệt
            console.log("Duyệt:", employee);
        } else if (actionType === 'reject') {
            // Thực hiện logic cho từ chối
            console.log("Từ chối:", employee);
        }
    };

    const handleCancel = () => {
        setShowPopup(false);
    };

    return (
        <div className="col" style={{ animationDelay: `${index * 0.2}s` }}>
            <div
                className="card"
                style={{
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                }}
            >
                <div className='row no-gutters employee-list-row' style={{ height: '100%' }}>
                    <div className='col-3'>
                        <div className='card-body flex-column' style={{ height: '100%' }}>
                            <div className="align-items-center" style={{ flexGrow: 1, height: '100%' }}>
                                <img
                                    src={employee.avatar}
                                    className='card-img rounded-circle mt-3'
                                    alt='Avatar'
                                    style={{
                                        objectFit: 'cover',
                                        height: '100px',
                                        width: '100px',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='col-9'>
                        <div className='card-body d-flex flex-column' style={{ height: '100%' }}>
                            <div className='d-flex align-items-center' style={{ flex: '1' }}>
                                <h5 className='card-title mb-0'>
                                    {employee.firstName} {employee.lastName}
                                </h5>
                            </div>

                            <div className='d-flex align-items-center mt-2' style={{ flex: '1' }}>
                                <h6 className='card-subtitle mb-0'>
                                    <span
                                        style={{
                                            backgroundColor: getPositionColor(employee.position),
                                            color: 'white',
                                            borderRadius: '4px',
                                            padding: '2px 8px',
                                        }}
                                    >
                                        {employee.position}
                                    </span>
                                </h6>
                            </div>

                            <hr className='my-2' style={{ flex: '0 0 1px', width: '100%' }} />

                            <div className='d-flex' style={{ flex: '2' }}>
                                <p className='card-text'>{employee.job}</p>
                            </div>

                            <div className='d-flex justify-content-between mt-auto' style={{ flex: '1' }}>
                                <button className='btn btn-success me-1' onClick={onProfileClick}>
                                    <Medal size={16} className="me-1" /> {/* Biểu tượng Certificate */}
                                    Chứng chỉ
                                </button>
                                <div>
                                    <button className="btn btn-primary me-1" onClick={handleApprove}>Duyệt</button>
                                    <button className="btn btn-danger" onClick={handleReject}>Từ chối</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showPopup && (
                <ConfirmationPopup onConfirm={handleConfirm} onCancel={handleCancel} />
            )}
        </div>
    );
};



const AdminTraining = ({ x }) => {
    console.log('x ở trang employee, x = ', x)
    x = x + 1;
    console.log('x ở trang employee lần 2, x = ', x)
    const [employees, setEmployees] = useState([
        {
            id: 1,
            lastName: 'Doe',
            firstName: 'John',
            department: 'Development',
            position: 'Software Engineer',
            job: 'Phát triển ứng dụng và hệ thống phần mềm.',
            dateOfHire: '2020-01-15',
            baseSalary: '1000 USD',
            projectsCount: 4,
            role: 'Employee',
            currentProject: 'Project A',
            phoneNumber: '0123456789',
            gender: 'Male',
            email: 'john.doe@example.com',
            address: '123 Main St',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            tasks: 10,
            stars: 5,
        },
        {
            id: 2,
            lastName: 'Doe',
            firstName: 'John',
            department: 'Development',
            position: 'Mobile Developer',
            job: 'Phát triển ứng dụng và hệ thống phần mềm.',
            dateOfHire: '2020-01-15',
            baseSalary: '1000 USD',
            projectsCount: 5,
            role: 'Employee',
            currentProject: 'Project A',
            phoneNumber: '0123456789',
            gender: 'Male',
            email: 'john.doe@example.com',
            address: '123 Main St',
            avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
            tasks: 10,
            stars: 5,
        },
        {
            id: 3,
            lastName: 'Doe',
            firstName: 'John',
            department: 'Development',
            position: 'UI/UX Designer',
            job: 'Phát triển ứng dụng và hệ thống phần mềm.',
            dateOfHire: '2020-01-15',
            baseSalary: '1000 USD',
            projectsCount: 5,
            role: 'Employee',
            currentProject: 'Project A',
            phoneNumber: '0123456789',
            gender: 'Male',
            email: 'john.doe@example.com',
            address: '123 Main St',
            avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
            tasks: 10,
            stars: 5,
        }, {
            id: 4,
            lastName: 'Doe',
            firstName: 'John',
            department: 'Development',
            position: 'Quality Assurance',
            job: 'Phát triển ứng dụng và hệ thống phần mềm.',
            dateOfHire: '2020-01-15',
            baseSalary: '1000 USD',
            projectsCount: 5,
            role: 'Employee',
            currentProject: 'Project A',
            phoneNumber: '0123456789',
            gender: 'Male',
            email: 'john.doe@example.com',
            address: '123 Main St',
            avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
            tasks: 10,
            stars: 5,
        },
        {
            id: 5,
            lastName: 'Doe',
            firstName: 'John',
            department: 'Development',
            position: 'Employee',
            job: 'Phát triển ứng dụng và hệ thống phần mềm.',
            dateOfHire: '2020-01-15',
            baseSalary: '1000 USD',
            projectsCount: 5,
            role: 'Employee',
            currentProject: 'Project A',
            phoneNumber: '0123456789',
            gender: 'Male',
            email: 'john.doe@example.com',
            address: '123 Main St',
            avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
            tasks: 10,
            stars: 5,
        }, {
            id: 6,
            lastName: 'Doe',
            firstName: 'John',
            department: 'Development',
            position: 'Employee',
            job: 'Phát triển ứng dụng và hệ thống phần mềm.',
            dateOfHire: '2020-01-15',
            baseSalary: '1000 USD',
            projectsCount: 5,
            role: 'Employee',
            currentProject: 'Project A',
            phoneNumber: '0123456789',
            gender: 'Male',
            email: 'john.doe@example.com',
            address: '123 Main St',
            avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
            tasks: 10,
            stars: 5,
        }, {
            id: 7,
            lastName: 'Doe',
            firstName: 'John',
            department: 'Development',
            position: 'Employee',
            job: 'Phát triển ứng dụng và hệ thống phần mềm.',
            dateOfHire: '2020-01-15',
            baseSalary: '1000 USD',
            projectsCount: 5,
            role: 'Employee',
            currentProject: 'Project A',
            phoneNumber: '0123456789',
            gender: 'Male',
            email: 'john.doe@example.com',
            address: '123 Main St',
            avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
            tasks: 10,
            stars: 5,
        },
        {
            id: 8,
            lastName: 'Doe',
            firstName: 'John',
            department: 'Development',
            position: 'Employee',
            job: 'Phát triển ứng dụng và hệ thống phần mềm.',
            dateOfHire: '2020-01-15',
            baseSalary: '1000 USD',
            projectsCount: 5,
            role: 'Employee',
            currentProject: 'Project A',
            phoneNumber: '0123456789',
            gender: 'Male',
            email: 'john.doe@example.com',
            address: '123 Main St',
            avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
            tasks: 10,
            stars: 5,
        },
        {
            id: 9,
            lastName: 'Doe',
            firstName: 'John',
            department: 'Development',
            position: 'Employee',
            job: 'Phát triển ứng dụng và hệ thống phần mềm.',
            dateOfHire: '2020-01-15',
            baseSalary: '1000 USD',
            projectsCount: 5,
            role: 'Employee',
            currentProject: 'Project A',
            phoneNumber: '0123456789',
            gender: 'Male',
            email: 'john.doe@example.com',
            address: '123 Main St',
            avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
            tasks: 10,
            stars: 5,
        },
        {
            id: 10,
            lastName: 'Doe',
            firstName: 'John',
            department: 'Development',
            position: 'Employee',
            job: 'Phát triển ứng dụng và hệ thống phần mềm.',
            dateOfHire: '2020-01-15',
            baseSalary: '1000 USD',
            projectsCount: 5,
            role: 'Employee',
            currentProject: 'Project A',
            phoneNumber: '0123456789',
            gender: 'Male',
            email: 'john.doe@example.com',
            address: '123 Main St',
            avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
            tasks: 10,
            stars: 5,
        },




        // Các nhân viên khác
    ]);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedEmployee(null);
    };

    const handleSave = (updatedEmployee) => {
        setEmployees(employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
        handleModalClose();
    };

    const handleAddEmployee = (newEmployee) => {
        setEmployees((prevEmployees) => [...prevEmployees, newEmployee]);
        setShowAddModal(false);
    };

    const handleAddModalShow = () => {
        setShowAddModal(true);
    };

    const handleProfileClick = (employee) => {
        setSelectedEmployee(employee);
        setShowModal(true);
    };

    return (
        <div>
            <div className='d-flex justify-content-between align-items-center mb-0'>
                <h2 className='mb-0'>Đào tạo và phát triển</h2>


                {/* <button className='btn btn-success' onClick={handleAddModalShow}>
                    <Plus size={16} className="me-1" /> 

                    Thêm nhân viên
                </button>
             */}
            </div>


            <hr style={{ width: '100%', border: '1px solid #ddd', margin: '10px 0' }} />

            <div className="row g-3 row-cols-1 row-cols-sm-1 row-cols-md-1 row-cols-lg-2 row-cols-xl-2 row-cols-xxl-2 row-deck pt-4">
                {employees.map((employee, index) => (
                    <EmployeeCard
                        key={employee.id}
                        employee={employee}
                        onProfileClick={() => handleProfileClick(employee)}
                        index={index} // Thêm index tại đây

                    />
                ))}

                {selectedEmployee && (
                    <AdminCertificateModal
                        show={showModal}
                        handleClose={handleModalClose}
                        employee={selectedEmployee}
                        handleSave={handleSave}
                    />
                )}
            </div>

            {/*
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered className="custom-modal modal-lg">
                <Modal.Header closeButton>
                    <Modal.Title>Thêm Nhân Viên Mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddEmployee onAddEmployee={handleAddEmployee} />
                </Modal.Body>
            </Modal> */}




        </div>
    );
};

export default AdminTraining;
