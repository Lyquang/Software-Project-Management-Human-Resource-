import React, { useState, useEffect } from "react";
import axios from "axios";
import { NotePencil } from "phosphor-react";
import AdminSalaryModal from "./AdminSalaryModal";
import AdjustRateModal from "./AdjustRateModal";
import { MdEdit } from "react-icons/md";
import "./AdminSalary.scss";
import Loading from "../Loading/Loading";

const AdminSalary = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showAdjustRateModal, setShowAdjustRateModal] = useState(false);
  const [rates, setRates] = useState({
    fullShiftRate: 200,
    halfShiftRate: 100,
  });

  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [Salary, setSalary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch salary data from API
  useEffect(() => {
    const fetchSalaryData = async () => {
      setError("");
      try {
        const response = await axios.get(
          "http://localhost:8080/api/salary/all"
        );
        const data = response.data?.result || [];
        setSalary(data);
      } catch (err) {
        setError("Error fetching salary data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalaryData();
  }, []);

  const handleModalOpen = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  const handleSave = (updatedRecord) => {
    setSalary((prevSalary) =>
      prevSalary.map((record) =>
        record.id === updatedRecord.id ? updatedRecord : record
      )
    );
  };

  const handleAdjustRateModalClose = () => {
    setShowAdjustRateModal(false);
  };

  const handleRateSave = async (updatedRates) => {
    try {
      setRates(updatedRates);
      setShowAdjustRateModal(false);
    } catch (error) {
      console.error("Failed to update rates:", error);
    }
  };

  const filteredSalary = Salary.filter((record) => {
    const monthMatch = filterMonth
      ? record.month === parseInt(filterMonth)
      : true;
    const yearMatch = filterYear ? record.year === parseInt(filterYear) : true;
    return monthMatch && yearMatch;
  });

  if (loading) {
    return ( <Loading /> );
  }

  return (
    <div className="container-fluid">
      <h3 className="title">Salary Board</h3>

      {/* Filters for Month and Year */}
      <div className="filters">
        <label htmlFor="month">Month:</label>
        <select
          id="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="">All</option>
          {[...Array(12).keys()].map((m) => (
            <option key={m + 1} value={m + 1}>
              {m + 1}
            </option>
          ))}
        </select>

        <label htmlFor="year">Year:</label>
        <select
          id="year"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">ALl</option>
          {[...new Set(Salary.map((r) => r.year))].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <button
          className="btn-adjust-rate"
          onClick={() => setShowAdjustRateModal(true)}
        >
          Modify Salary Rate
        </button>
      </div>

      {/* Error and Loading */}
      {loading && <p>Loading data...</p>}
      {error && <p className="error">{error}</p>}

      {/* Salary Table */}
      <div className="salary-table">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Month</th>
              <th>Year</th>
              <th>Full Work days</th>
              <th>Half Work days</th>
              <th>Absent days</th>
              <th>Bonus</th>
              <th>Penaty</th>
              <th>Real Salary</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {filteredSalary.map((record, index) => (
              <tr key={index}>
                <td>{record.employeeCode}</td>
                <td>{`  ${record.lastName} ${record.firstName} `}</td>
                <td>{record.month}</td>
                <td>{record.year}</td>
                <td>{record.fullWork}</td>
                <td>{record.halfWork}</td>
                <td>{record.absence}</td>
                <td className="text-success fw-bold">{record.bonus}Đ</td>
                <td className="text-danger fw-bold">{record.penalty}Đ</td>
                <td className="text-primary fw-bold">{record.realPay}Đ</td>
                <td>
                  <button style={{margin:"none", padding:"none", }} onClick={() => handleModalOpen(record)}>
                    <MdEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminSalaryModal
        show={showModal}
        handleClose={handleModalClose}
        record={selectedRecord}
        handleSave={handleSave}
      />
      <AdjustRateModal
        show={showAdjustRateModal}
        handleClose={handleAdjustRateModalClose}
        rates={rates}
        handleSave={handleRateSave}
      />
    </div>
  );
};

export default AdminSalary;
