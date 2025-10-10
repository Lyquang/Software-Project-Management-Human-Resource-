import React, { useState } from "react";
import axios from "axios";
import TaskModal from "./TaskModal";
import MemberModal from "./EditMemberModal";
import EditProject from "./EditProject";
// import { DeleteProjectBtn } from "./DeleteProjectBtn";
import "./ProjectCard.scss";
import { IoIosAttach } from "react-icons/io";

export const ProjectCard = ({ index, projects, project, setProjects }) => {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [currentProjectDetails, setCurrentProjectDetails] = useState(null);
  const [tasks, setTasks] = useState([]);
  const progress = 50;

  const fetchProjectDetails = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/ems/projects?id=${id}`
      );
      if (response.data && response.data.code === 1000) {
        setCurrentProjectDetails(response.data.result);
        setCurrentProjectId(id);
      } else {
        console.error("Error fetching project details:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const handleMemberClick = (project) => {
    if (project?.id) {
      fetchProjectDetails(project.id);
    }
    setIsMemberModalOpen(true);
  };

  const handleSaveMembers = () => {
    // Implement logic to save members if needed
    setIsMemberModalOpen(false);
  };

  return (
    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-6 col-sm-6">
      <div className="card">
        <div className="card-header">
          <p className="company-name fw-bold">{project.name}</p>
        </div>

        {/* <DeleteProjectBtn projectId={project.id} setProjects={setProjects} /> */}

        <div className="card-body">
          <div className="project-description-section">
            <span>{project.company} </span>
          </div>
          <div className="project-description-section text-muted    ">
            <p> {project.project_description}</p>
          </div>
          <div className="row g-2">
            <div
              className="col-6 d-flex align-items-center"
              onClick={() => {
                setSelectedProject(project);
              }}
            >
              <span style={{fontSize:'1.5rem'}}><IoIosAttach /></span>
              <span className="info fw-bold">{project.tasks} Tasks</span>
            </div>

            <div
              className="col-6 d-flex align-items-center"
              onClick={() => handleMemberClick(project)}
            >
              <span className="logo">👥</span>
              <span className="info fw-bold">{project.members} Members</span>
            </div>
          </div>

          <hr />
          <div className="progress" style={{ width: "100%" }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              {progress}%
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3 bottom-bar">
            <div className="avatars">
              {Array(project.members)
                .fill("")
                .map((_, i) => (
                  <img
                    key={i}
                    src="https://randomuser.me/api/portraits/men/9.jpg"
                    alt="Avatar"
                    className="avatar"
                  />
                ))}
            </div>
            <div className="days-left fw-bold">
              <i className="bi bi-clock-fill me-1 text-muted"></i>{" "}
              {/* Nếu dùng Bootstrap Icons */}
              {project.daysLeft} days left
            </div>
          </div>
        </div>
      </div>

      {selectedProject && (
        <TaskModal
          projectId={selectedProject.id}
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {isMemberModalOpen && (
        <MemberModal
          onClose={() => setIsMemberModalOpen(false)}
          onSave={handleSaveMembers}
          projectDetails={currentProjectDetails}
        />
      )}
    </div>
  );
};
