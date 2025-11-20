
import React, { useState, useEffect } from "react";
import { CreateProjectBtn } from "./CreateProjectBtn";
import { ProjectCard } from "./ProjectCard";
import Loading from "../../Loading/Loading";
import { API_ROUTES } from "../../../api/apiRoutes";
import axiosInstance from "../../../api/axiosInstance";

const ManagerProject = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]); // Thêm để tránh lỗi setTasks
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const deptId = 1; // hard-coded as requested
      const res = await axiosInstance.get(API_ROUTES.PROJECT.BY_DEPARTMENT(deptId));
      const data = res.data;
      if (data?.code === 200 && Array.isArray(data.result)) {
        const mapped = data.result.map(p => ({
          id: p.id,
          name: p.name,
          company: p.department_name,
          project_description: p.description,
          status: p.status,
          members: p.participants || 0,
          maxParticipants: p.max_participants || 0,
          tasks: 0,
          attachments: 0,
          duration: "—",
          comments: 0,
          daysLeft: 0,
          progress: 0,
          icon: "default-icon",
        }));
        setProjects(mapped);
      } else {
        console.error("Fetch department projects failed", data?.message);
        setProjects([]);
      }
    } catch (e) {
      console.error("Error fetching department projects", e);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchProjects();
    };
    init();
  }, []);

  return (
    <div className="manager-projects bg-light">
      <div className="header d-flex align-items-center justify-content-between">
        <h2>Quản lý dự án</h2>
        <div className="d-flex align-items-center gap-2">
          <button onClick={fetchProjects} className="btn btn-outline-secondary">Refresh</button>
          {/* CreateProjectBtn kept; you said stop creating projects but we leave button for potential future use */}
          <CreateProjectBtn setProjects={setProjects} />
        </div>
      </div>

      {isLoading ? (
        <div><Loading/></div>
      ) : projects.length === 0 ? (
        <div className="bg-white border rounded p-4 text-muted">No projects found for department 1.</div>
      ) : (
        <div className="row g-3 gy-5 py-3 row-deck">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              index={index}
              projects={projects}
              project={project}
              setProjects={setProjects}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerProject;


{
  /* <div className="row g-3 gy-5 py-3 row-deck">
                {projects.map((project, index) => (
                    <div key={index} className="col-xxl-4 col-xl-4 col-lg-4 col-md-6 col-sm-6">
                        <div className="card">
                            <div className="card-header">
                                <p className="company-name">{project.name}</p>
                            </div>
                            <DeleteProjectBtn projectId={project.id} setProjects={setProjects} />

                            <div className="card-body">
                                <div className="avatars">
                                    {Array(project.members).fill('').map((_, i) => (
                                        <img key={i} src="https://randomuser.me/api/portraits/men/9.jpg" alt="Avatar" className="avatar" />
                                    ))}
                                </div>
                                <div className="row g-2 pt-4">
                                    <div
                                        className="col-6 d-flex align-items-center"
                                        onClick={() => {
                                            setSelectedProject(project);
                                            console.log('Selected Project:', selectedProject); // In ra thông tin của dự án đã chọn
                                            console.log('Selected Tasks:', tasks); // In ra thông tin của dự án đã chọn


                                        }}

                                    >
                                        <span className="logo">📎</span>
                                        <span className="info">{project.tasks} Nhiệm vụ</span>
                                    </div>
                                    <div
                                        className="col-6 d-flex align-items-center"
                                        onClick={() => handleMemberClick(project)}
                                    >
                                        <span className="logo">👥</span>
                                        <span className="info">
                                            {project.members} Thành viên
                                        </span>
                                    </div>

                                </div>
                                <hr />
                                <div className="project-description-section">
                                    <span className="description-text">Mô tả:   </span>
                                    <p className="project-description">{project.project_description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div> */
}

{
  /* {selectedProject && (
                <TaskModal
                    projectId={selectedProject.id} // Truyền id của dự án
                    project={selectedProject}     // Truyền thông tin dự án
                    onClose={() => setSelectedProject(null)}
                />
            )} */
}

{
  /* 
                    {isMemberModalOpen && (
                        <MemberModal
                            members={currentMembers}
                            employees={employees}
                            onClose={() => setIsMemberModalOpen(false)}
                            onSave={handleSaveMembers}
                            currentProjectId={currentProjectId}
                        />
                    )} */
}

{
  /* {isMemberModalOpen && (
                <MemberModal
                    onClose={() => setIsMemberModalOpen(false)}
                    onSave={handleSaveMembers}
                    projectDetails={currentProjectDetails}
                />
            )} */
}

{
  /* {isCreateProjectModalOpen && (
                <EditProject
                    onClose={() => setIsCreateProjectModalOpen(false)}
                    onSave={(newProject) => {
                        setProjects((prevProjects) => [...prevProjects, newProject]);
                        setIsCreateProjectModalOpen(false);
                    }}
                    // employees={employees}
                />
            )} */
}
