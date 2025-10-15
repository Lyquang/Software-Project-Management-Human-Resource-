// src/components/Information/InputField.jsx
import React from 'react';

const InputField = ({ id, name, type = 'text', value, onChange, placeholder, label, icon }) => {
  // 1. Xóa 'px-4' khỏi chuỗi class cơ sở để tránh xung đột
  const baseClasses = "w-full py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-400";

  // 2. Tạo biến để chứa class padding một cách có điều kiện
  const paddingClasses = icon 
    ? "pl-10 pr-4"  // Nếu có icon: padding trái lớn, padding phải bình thường
    : "px-4";       // Nếu không có icon: padding đều hai bên

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {/* Clone icon để thêm class styling */}
            {React.cloneElement(icon, { className: 'text-gray-400' })}
          </div>
        )}
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          // 3. Kết hợp các class lại với nhau
          className={`${baseClasses} ${paddingClasses}`}
        />
      </div>
    </div>
  );
};

export default InputField;