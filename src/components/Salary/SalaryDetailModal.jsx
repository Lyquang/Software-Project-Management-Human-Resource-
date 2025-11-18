import React from "react";
import { MdClose, MdAttachMoney, MdTrendingDown, MdWork } from "react-icons/md";

const SalaryDetailModal = ({ show, handleClose, record }) => {
  if (!show || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-4xl mx-4 bg-white rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Salary Details</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-100 hover:text-gray-600"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        <div className="p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">Employee Information</h3>
              <p className="mt-2 text-sm text-blue-700">
                <strong>Code:</strong> {record.personnelCode}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Name:</strong> {record.personnelName}
              </p>
              <p className="text-sm text-blue-700">
                <strong>Position:</strong> {record.position || "N/A"}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900">Period</h3>
              <p className="mt-2 text-sm text-green-700">
                <strong>Month/Year:</strong> {record.month}/{record.year}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900">Salary Summary</h3>
              <p className="mt-2 text-sm text-purple-700">
                <strong>Gross:</strong> ${record.grossSalary?.toLocaleString()}
              </p>
              <p className="text-sm text-purple-700">
                <strong>Net:</strong> ${record.netSalary?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Work Hours & Attendance */}
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="flex items-center gap-2 mb-4 font-semibold text-gray-900">
                <MdWork className="text-blue-500" />
                Work Hours & Attendance
              </h3>
              <div className="space-y-2">
                <DetailItem label="Total Work Hours" value={record.totalWorkHours} />
                <DetailItem label="Overtime Hours" value={record.overtimeHours} />
                <DetailItem label="Full Day Work" value={record.fullDayWork} />
                <DetailItem label="Half Day Work" value={record.halfDayWork} />
                <DetailItem label="Absence Days" value={record.absenceDays} />
                <DetailItem label="Late Days" value={record.lateDays} />
                <DetailItem label="Not Enough Hour Days" value={record.notEnoughHourDays} />
              </div>
            </div>

            {/* Allowances & Deductions */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="flex items-center gap-2 mb-4 font-semibold text-gray-900">
                <MdAttachMoney className="text-green-500" />
                Allowances & Deductions
              </h3>
              <div className="space-y-2">
                <DetailItem label="Position Allowance" value={record.positionAllowance} isCurrency />
                <DetailItem label="Overtime Pay" value={record.overtimePay} isCurrency />
                <DetailItem label="Penalty" value={record.penalty} isCurrency />
              </div>
            </div>
          </div>

          {/* Insurance & Tax */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="flex items-center gap-2 mb-4 font-semibold text-gray-900">
              <MdTrendingDown className="text-red-500" />
              Insurance & Tax Deductions
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <DetailItem label="Social Insurance" value={record.socialInsurance} isCurrency />
                <DetailItem label="Health Insurance" value={record.healthInsurance} isCurrency />
                <DetailItem label="Unemployment Insurance" value={record.unemploymentInsurance} isCurrency />
              </div>
              <div className="space-y-2">
                <DetailItem label="Personal Income Tax" value={record.personalIncomeTax} isCurrency />
                <DetailItem label="Total Deductions" value={record.totalDeductions} isCurrency />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-6 py-2 font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, isCurrency = false }) => (
  <div className="flex justify-between">
    <span className="text-sm text-gray-600">{label}:</span>
    <span className={`text-sm font-medium ${
      isCurrency ? (value < 0 ? "text-red-600" : "text-green-600") : "text-gray-900"
    }`}>
      {isCurrency ? `$${value?.toLocaleString()}` : value}
    </span>
  </div>
);

export default SalaryDetailModal;