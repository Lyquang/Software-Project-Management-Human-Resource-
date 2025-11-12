// src/components/TaskList.jsx
import React from 'react';
import TaskCard from './TaskCard';

const TaskList = ({ tasks }) => {
  return (
    <div className="flex flex-col gap-5">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;