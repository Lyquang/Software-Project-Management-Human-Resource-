// src/components/Tags.jsx
import React from 'react';

// Component cho Priority Tag (HIGH, MEDIUM, LOW)
export const PriorityTag = ({ priority }) => {
  let colorClasses = '';

  switch (priority) {
    case 'HIGH':
      colorClasses = 'bg-red-100 text-red-700';
      break;
    case 'MEDIUM':
      colorClasses = 'bg-yellow-100 text-yellow-700';
      break;
    case 'LOW':
      colorClasses = 'bg-green-100 text-green-700';
      break;
    default:
      colorClasses = 'bg-gray-100 text-gray-700';
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${colorClasses}`}
    >
      {priority}
    </span>
  );
};

// Component cho Status Tag (In Progress, Todo, Review)
export const StatusTag = ({ status }) => {
  let colorClasses = '';

  switch (status) {
    case 'In Progress':
      colorClasses = 'bg-blue-100 text-blue-700';
      break;
    case 'Todo':
      colorClasses = 'bg-gray-200 text-gray-800';
      break;
    case 'Review':
      colorClasses = 'bg-purple-100 text-purple-700';
      break;
    default:
      colorClasses = 'bg-gray-100 text-gray-700';
  }

  return (
    <span
      className={`px-3 py-1 rounded-md text-xs font-semibold ${colorClasses}`}
    >
      {status}
    </span>
  );
};