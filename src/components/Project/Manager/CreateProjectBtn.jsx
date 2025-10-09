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
      <button onClick={handleCreateProjectClick} className="btn btn-primary">
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
