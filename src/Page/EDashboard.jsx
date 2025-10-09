
import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const EDashboard = () => {
  const { personnel } = useOutletContext();

  useEffect(() => {
    console.log("Dashboard personnel >>>", personnel);
  }, [personnel]);

  return (
    <div className="container-fluid py-4">
      <div className="bg-primary bg-opacity-10 rounded p-4 mb-4 shadow-sm row align-items-center">
        <div className="col-md-8 text-md-left text-center">
          <h1 className="display-4 text-primary">
            Hello {personnel ? personnel.lastName + " " + personnel.firstName : "User"} <span role="img" aria-label="wave">👋</span>
          </h1>
        </div>
        <div className="col-md-4 text-md-right text-center">
          <h1 className="display-5 text-secondary">Welcome</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
          <div className="card bg-info text-white text-center p-3 h-100 shadow-sm">
            <div className="card-body font-weight-bold">Nhân viên</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
          <div className="card bg-warning text-dark text-center p-3 h-100 shadow-sm">
            <div className="card-body font-weight-bold">Chấm công</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
          <div className="card bg-pink text-white text-center p-3 h-100 shadow-sm" style={{ backgroundColor: "#ffd4ef" }}>
            <div className="card-body font-weight-bold">Tiền lương và phúc lợi</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
          <div className="card bg-success text-white text-center p-3 h-100 shadow-sm" style={{ backgroundColor: "#d9f7cc" }}>
            <div className="card-body font-weight-bold">Phòng ban</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
          <div className="card bg-cyan text-white text-center p-3 h-100 shadow-sm" style={{ backgroundColor: "#cff1ff" }}>
            <div className="card-body font-weight-bold">Dự án</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
          <div className="card bg-light text-dark text-center p-3 h-100 shadow-sm" style={{ backgroundColor: "#fff9cc" }}>
            <div className="card-body font-weight-bold">Đào tạo và phát triển</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
          <div className="card bg-danger text-white text-center p-3 h-100 shadow-sm" style={{ backgroundColor: "#ffd9d9" }}>
            <div className="card-body font-weight-bold">Thống kê</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EDashboard;
