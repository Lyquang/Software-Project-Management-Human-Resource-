// src/components/TaskCard.jsx
import React from 'react';
import { BsChevronDown, BsClock, BsCalendar } from 'react-icons/bs';
import { PriorityTag, StatusTag } from './Tags';
import { Link } from 'react-router-dom';

const TaskCard = ({ task }) => {
  const { id, title, description, loggedTime, dueDate, priority, status } = task;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100">
      {/* Phần Header của Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex items-center gap-3">
          <button className="text-gray-400 hover:text-gray-600">
            <BsChevronDown className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="flex items-center gap-3 mt-3 sm:mt-0 self-start sm:self-center">
          <PriorityTag priority={priority} />
          <StatusTag status={status} />
        </div>
      </div>

      {/* Phần Nội dung (thụt vào) */}
      <div className="pl-0 sm:pl-8">
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        
        {/* Thông tin thời gian */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-sm text-gray-500 mb-5">
          <span className="flex items-center gap-1.5">
            <BsClock />
            {loggedTime}
          </span>
          <span className="flex items-center gap-1.5">
            <BsCalendar />
            Due: {dueDate}
          </span>
        </div>

        {/* Các nút hành động */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to={`/login/employee/task/${id}`}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            View Details
          </Link>
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
            Review
          </button>
          <Link
            to={`/login/employee/task/${id}/edit`}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;