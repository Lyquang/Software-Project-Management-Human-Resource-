import React from "react";

// eslint-disable-next-line no-unused-vars
const KPICard = ({ icon: Icon, label, value, color }) => (
  <div className="p-6 bg-white border-l-4 rounded-lg shadow" style={{ borderLeftColor: color }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <Icon size={32} color={color} className="opacity-20" />
    </div>
  </div>
);

export default KPICard;