
import React, { useState, useEffect } from "react";
import { CreateProjectBtn } from "./CreateProjectBtn";
import { ProjectCard } from "./ProjectCard";
import axios from "axios";
import Loading from "../../Loading/Loading";

const ManagerProject = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]); // Thêm để tránh lỗi setTasks
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectsAndTasks = async () => {
      setIsLoading(true);
      try {
        const [projectResponse, taskResponse] = await Promise.all([
          axios.get("http://localhost:8080/ems/projects/all"),
          axios.get("http://localhost:8080/ems/tasks/all"),
        ]);

        if (projectResponse.data.code === 1000) {
          const fetchedProjects = projectResponse.data.result.map((project) => ({
            id: project.projectId,
            name: project.projectName,
            company: project.departmentName,
            attachments: project.attachments || 0,
            members: project.participants || 0,
            project_description: project.projectDescription,
            duration: project.duration || "N/A",
            comments: project.comments || 0,
            daysLeft: project.daysLeft || 0,
            progress: project.progress || 0,
            icon: project.icon || "default-icon",
            tasks: project.numberOfTasks || 0,
          }));
          setProjects(fetchedProjects);
        } else {
          console.error("Error fetching projects:", projectResponse.data.message);
        }

        if (taskResponse.data.code === 1000) {
          setTasks(taskResponse.data.result || []);
        } else {
          console.error("Error fetching tasks:", taskResponse.data.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectsAndTasks();
  }, []);

  return (
    <div className="manager-projects bg-light">
      <div className="header d-flex align-items-center justify-content-between">
        <h2>Quản lý dự án</h2>
        <CreateProjectBtn setProjects={setProjects} />
      </div>

      {isLoading ? (
        <div><Loading/></div>
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
