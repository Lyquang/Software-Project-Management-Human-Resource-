import React, { useState, useEffect } from 'react';
import EditProject from './EditProject';
export const CreateProjectBtn = ({setProjects,}) => {

  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =useState(false);
  const handleCreateProjectClick = () => {
    setIsCreateProjectModalOpen(true);
  };

  const closeCreateProjectModal = () => {
    setIsCreateProjectModalOpen(false);
  };
  return (
    <div className="action-buttons">
      <button
        onClick={handleCreateProjectClick}
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
      >
        Add New Project
      </button>
            {isCreateProjectModalOpen && (
                    <EditProject
                        onClose={() => setIsCreateProjectModalOpen(false)}
                        onSave={(newProject) => {
                            setProjects((prevProjects) => [...prevProjects, newProject]);
                            setIsCreateProjectModalOpen(false);
                        }}
                        // employees={employees}
                    />
                )}
    </div>

  );
};
