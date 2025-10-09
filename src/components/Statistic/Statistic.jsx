import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import './Statistic.css';
import WorkingDaysChart from "./WorkingDaysChart";
import { MagnifyingGlass } from "phosphor-react"; // Import icon

const attendanceData = [
    {
        id: 1,
        date: 'June 26, 2021',
        punchIn: '10:05 AM',
        punchOut: '09:05 PM',
        breakTime: '01:12 Hr',
        halfDay: '✘',
        fullDay: '✔',
        overtime: '01:39 Hr',
        totalProduction: '09:39 Hr',
    },
    // Add more attendance data as needed
];

const columns = [
    { name: '#', selector: row => row.id, sortable: true },
    { name: 'Date', selector: row => row.date, sortable: true },
    { name: 'Punch In Time', selector: row => row.punchIn, sortable: true },
    { name: 'Punch Out Time', selector: row => row.punchOut, sortable: true },
    { name: 'Break Time', selector: row => row.breakTime, sortable: true },
    { name: 'Half Day', selector: row => row.halfDay, sortable: true },
    { name: 'Full Day', selector: row => row.fullDay, sortable: true },
    { name: 'Overtime', selector: row => row.overtime, sortable: true },
    { name: 'Total Production', selector: row => row.totalProduction, sortable: true },
];


const employeesData = [
    {
        id: 'employee1',
        name: 'Nhân viên 1',
        avatar: 'path/to/avatar/employee1.png',
        workingDaysData: [
            { date: 'Tháng 1', workingDays: 0 },
            { date: 'Tháng 2', workingDays: 28 },
            { date: 'Tháng 3', workingDays: 31 },
            { date: 'Tháng 4', workingDays: 30 },
            { date: 'Tháng 5', workingDays: 31 },
            { date: 'Tháng 6', workingDays: 30 },
            { date: 'Tháng 7', workingDays: 31 },
            { date: 'Tháng 8', workingDays: 31 },
            { date: 'Tháng 9', workingDays: 30 },
            { date: 'Tháng 10', workingDays: 31 },
            { date: 'Tháng 11', workingDays: 30 },
            { date: 'Tháng 12', workingDays: 1 },
        ],
    },
    {
        id: 'employee2',
        name: 'Nhân viên 2',
        avatar: 'path/to/avatar/employee2.png',
        workingDaysData: [
            { date: 'Tháng 1', workingDays: 22 },
            { date: 'Tháng 2', workingDays: 20 },
            { date: 'Tháng 3', workingDays: 28 },
            { date: 'Tháng 4', workingDays: 29 },
            { date: 'Tháng 5', workingDays: 31 },
            { date: 'Tháng 6', workingDays: 28 },
            { date: 'Tháng 7', workingDays: 30 },
            { date: 'Tháng 8', workingDays: 31 },
            { date: 'Tháng 9', workingDays: 30 },
            { date: 'Tháng 10', workingDays: 31 },
            { date: 'Tháng 11', workingDays: 30 },
            { date: 'Tháng 12', workingDays: 2 },
        ],
    },
    // Thêm nhiều nhân viên nếu cần
];

const Statistic = () => {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchId, setSearchId] = useState('');

    const handleSearchChange = (event) => {
        setSearchId(event.target.value);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            const employee = employeesData.find(emp => emp.id === searchId);
            setSelectedEmployee(employee || null);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="statistics-container">


            <div className="row">
                {/* Phần chứa nút in báo cáo và đường kẻ */}
                <div className="d-flex justify-content-between align-items-center mb-0 mt-4">
                    <div>
                        <h2 className="mb-0">Thống kê</h2>
                    </div>

                    <div className="button-container d-flex align-items-center">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Nhập ID nhân viên"
                                value={searchId}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                className="search-input"
                            />
                            <MagnifyingGlass size={20} className="search-icon" />
                        </div>
                        <button className="print-button btn btn-success ms-2" onClick={handlePrint}>
                            In Báo Cáo
                        </button>
                    </div>
                </div>
                <hr style={{ width: '100%', border: '1px solid #ddd', margin: '10px 0' }} />

            </div>



            <div className="col-md-12">
                <div className="chart-section">
                    <h1 style={{ textAlign: 'center' }}>Thống Kê Số Ngày Làm Việc</h1>
                    <WorkingDaysChart
                        workingDaysData={selectedEmployee ? selectedEmployee.workingDaysData : []}
                    />
                </div>
            </div>


            {/* Attendance Table Section */}
            <div className="datatable-container">
                <DataTable
                    title="Attendance Data"
                    columns={columns}
                    data={attendanceData}
                    pagination
                    highlightOnHover
                    striped
                    responsive
                />
            </div>

        </div>
    );
};

export default Statistic;
