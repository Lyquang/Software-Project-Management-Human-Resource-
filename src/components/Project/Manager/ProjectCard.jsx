import React, { useState, useEffect } from "react";
import TaskModal from "./TaskModal";
import MemberModal from "./EditMemberModal";
import EditProject from "./EditProject";
import { useNavigate } from 'react-router-dom';
import { DeleteProjectBtn } from "./DeleteProjectBtn";
import "./ProjectCard.scss";
import { IoIosAttach } from "react-icons/io";
import axiosInstance from "../../../api/axiosInstance";
import { API_ROUTES } from "../../../api/apiRoutes";

export const ProjectCard = ({ index, projects, project, setProjects }) => {
  const navigate = useNavigate();
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [currentProjectDetails, setCurrentProjectDetails] = useState(null);
  const [taskCount, setTaskCount] = useState(0);
  const progress = 50;

  const fetchProjectDetails = async (code) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.PROJECT.GET_BY_ID(code));
      if (response.data && (response.data.code === 200 || response.data.code === 0)) {
        setCurrentProjectDetails(response.data.result);
        setCurrentProjectId(code);
        return response.data.result;
      } else {
        console.error("Error fetching project details:", response.data?.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      return null;
    }
  };

  const fetchTaskCount = async (projectId) => {
    try {
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const response = await fetch(`${API_ROUTES.TASK.BY_PROJECT}?projectId=${projectId}`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && (data?.code === 200 || data?.code === 0) && data?.result) {
        setTaskCount(Array.isArray(data.result) ? data.result.length : 0);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleMemberClick = async (project) => {
    if (project?.id) {
      const details = await fetchProjectDetails(project.id);
      if (details) {
        setCurrentProjectDetails({
          ...details,
          id: project.id,
          name: project.name || details.name
        });
      }
    }
    setIsMemberModalOpen(true);
  };

  const openTasksForProject = async (projId) => {
    // Fetch project details as requested, then navigate to tasks route
    await fetchProjectDetails(projId);
    navigate(`/project/${projId}/tasks`);
  };

  useEffect(() => {
    if (project?.id) {
      fetchTaskCount(project.id);
    }
  }, [project?.id]);

  return (
    <div className="col-xxl-4 col-xl-4 col-lg-4 col-md-6 col-sm-6">
      <div className="card" onClick={() => openTasksForProject(project.id)} style={{ cursor: 'pointer', position: 'relative' }}>
        <div className="card-header">
          <p className="company-name fw-bold">{project.name}</p>
        </div>

        <DeleteProjectBtn projectId={project.id} projectName={project.name} setProjects={setProjects} />

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
              onClick={(e) => { e.stopPropagation(); openTasksForProject(project.id); }}
              style={{ cursor: 'pointer' }}
            >
              <span style={{fontSize:'1.5rem'}}><IoIosAttach /></span>
              <span className="info fw-bold">{taskCount} Tasks</span>
            </div>

            <div
              className="col-6 d-flex align-items-center"
              onClick={(e) => { e.stopPropagation(); handleMemberClick(project); }}
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
            {project.daysLeft > 0 && (
              <div className="days-left fw-bold">
                <i className="bi bi-clock-fill me-1 text-muted"></i>{" "}
                {project.daysLeft} days left
              </div>
            )}
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

      {isMemberModalOpen && currentProjectDetails && (
        <MemberModal
          onClose={() => setIsMemberModalOpen(false)}
          projectDetails={currentProjectDetails}
        />
      )}
    </div>
  );
};
