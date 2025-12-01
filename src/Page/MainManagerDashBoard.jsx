import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Users, Folder, BarChart as BarIcon, X } from "lucide-react";
import MainEmployeeDashBoard from "./MainEmployeeDashBoard";

const COLORS = ["#8B5CF6", "#34D399", "#F87171", "#FBBF24", "#9CA3AF"];

// --- thêm cấu hình trạng thái dự án ---
const STATUS_CONFIG = [
  { key: "PLANNED", label: "Planned", color: "#8B5CF6" },
  { key: "DEVELOPED", label: "Developed", color: "#34D399" },
  { key: "IN_PROGRESS", label: "In Progress", color: "#FBBF24" },
  { key: "ON_HOLD", label: "On Hold", color: "#F87171" },
  { key: "CLOSED", label: "Closed", color: "#9CA3AF" },
];

const MainManagerDashBoard = () => {
  const [loading, setLoading] = useState(true);
  const [deptInfo, setDeptInfo] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  // Kanban / tasks state
  const [isKanbanOpen, setIsKanbanOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]); // list of tasks for selected project
  const [loadingTasks, setLoadingTasks] = useState(false);

  const statusMap = {
    PENDING: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
    COMPLETED: "Done",
  };

  const openKanban = async (project) => {
    setSelectedProject(project);
    setIsKanbanOpen(true);
    setLoadingTasks(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `${baseUrl}/tasks/project?projectId=${encodeURIComponent(project.id)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const tasks = res?.data?.result || [];
      setProjectTasks(tasks);
    } catch (err) {
      console.error("Load project tasks:", err);
      setProjectTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  const closeKanban = () => {
    setIsKanbanOpen(false);
    setSelectedProject(null);
    setProjectTasks([]);
  };

  // Drag & drop handlers (simple local state update)
  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const onDropToStatus = (e, newStatusKey) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;
    setProjectTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatusKey } : t))
    );
  };

  const onDragOver = (e) => e.preventDefault();

  const baseUrl = "https://ems-toq5.onrender.com/ems";

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No token");
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        // 1) get my info to obtain departmentId
        const myInfoRes = await axios.get(`${baseUrl}/personnels/myInfo`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const myInfo = myInfoRes?.data?.result;
        if (!myInfo) throw new Error("Failed to load personnel info");
        setDeptInfo(myInfo);

        const deptId = myInfo.departmentId;

        // 2) fetch employees in department
        const employeesRes = await axios.get(
          `${baseUrl}/departments/${deptId}/employees`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const empList = employeesRes?.data?.result?.employees || [];
        setEmployees(empList);

        // 3) fetch projects of department
        // Using query param departmentId (adjust if your backend expects a different route)
        const projectsRes = await axios.get(
          `${baseUrl}/projects/department?deptID=${deptId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const projectsList = projectsRes?.data?.result || [];
        setProjects(projectsList);
      } catch (err) {
        console.error("Manager dashboard load error:", err);
        setError(err?.message || "Load error");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // thay projectStatusData để đảm bảo đủ 5 trạng thái theo STATUS_CONFIG
  const projectCounts = projects.reduce((acc, p) => {
    const k = p.status || "UNKNOWN";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const projectStatusData = STATUS_CONFIG.map((s) => ({
    key: s.key,
    name: s.label,
    value: projectCounts[s.key] || 0,
    color: s.color,
  })).filter((d) => d.value > 0);

  return (
    <div>
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">Manager Dashboard</h1>
          {deptInfo && (
            <p className="text-gray-500 text-sm mt-1">
              Department:{" "}
              <span className="font-semibold text-gray-700">
                {deptInfo.departmentName}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Department info (new) */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Users size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Department
            </p>
            <div className="mt-1 flex items-baseline gap-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {deptInfo?.departmentName || "—"}
              </h2>
              <span className="text-sm text-gray-400">|</span>
              <p className="text-sm text-gray-500">
                ID:{" "}
                <span className="font-medium text-gray-700">
                  {deptInfo?.departmentId ?? "—"}
                </span>
              </p>
            </div>
            {deptInfo?.description && (
              <p className="text-xs text-gray-400 mt-2">
                {deptInfo.description}
              </p>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
              <Users size={18} className="text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Employees</p>
                <p className="font-bold">{employees.length}</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
              <Folder size={18} className="text-purple-600" />
              <div>
                <p className="text-xs text-gray-500">Projects</p>
                <p className="font-bold">{projects.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Employees card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">Team Members</h3>
            <span className="text-sm text-gray-500">
              {employees.length} people
            </span>
          </div>

          <div className="space-y-3 max-h-64 overflow-auto pr-2">
            {employees.length === 0 ? (
              <p className="text-gray-400 text-sm">No team members found.</p>
            ) : (
              employees.map((e) => (
                <div
                  key={e.code}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={e.avatar || "/avatar-placeholder.png"}
                    alt={e.name}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {e.name}
                        </p>
                        <p className="text-xs text-gray-500">{e.position}</p>
                      </div>
                      <div className="text-xs text-gray-400">{e.code}</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{e.email}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Middle column: Projects list */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">Projects</h3>
            <span className="text-sm text-gray-500">{projects.length}</span>
          </div>

          <div className="space-y-3 max-h-64 overflow-auto pr-2">
            {projects.length === 0 ? (
              <p className="text-gray-400 text-sm">No projects found.</p>
            ) : (
              projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => openKanban(p)}
                  className="cursor-pointer flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") openKanban(p);
                  }}
                >
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.departmentName}</p>
                  </div>
                  <div className="text-sm font-medium">
                    {(() => {
                      const conf =
                        STATUS_CONFIG.find((s) => s.key === p.status) || {
                          label: p.status || "UNKNOWN",
                          color: "#9CA3AF",
                        };
                      return (
                        <span
                          className="px-2 py-1 rounded-full text-xs"
                          style={{
                            backgroundColor: conf.color,
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        >
                          {conf.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Project status chart */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">Project Status</h3>
            <BarIcon size={18} className="text-gray-400" />
          </div>

          <div className="h-56 w-full">
            {projectStatusData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm">No status data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={4}
                    stroke="none"
                    label
                  >
                    {projectStatusData.map((entry, idx) => (
                      <Cell key={`c-${idx}`} fill={entry.color || COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-4 w-full text-sm text-gray-600">
            <p className="font-medium text-gray-700">Summary</p>
            <div className="mt-2 space-y-1">
              {projectStatusData.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span>{s.name}</span>
                  </div>
                  <div className="font-semibold">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Kanban modal */}
      {isKanbanOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={closeKanban}
          />
          <div className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-bold text-lg">
                  Tasks — {selectedProject?.name}
                </h3>
                <p className="text-sm text-gray-500">{selectedProject?.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-40 h-24">
                  {/* pie chart summary */}
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          const counts = projectTasks.reduce((acc, t) => {
                            const k = statusMap[t.status] || "To Do";
                            acc[k] = (acc[k] || 0) + 1;
                            return acc;
                          }, {});
                          return Object.entries(counts).map(([name, value]) => ({
                            name,
                            value,
                          }));
                        })()}
                        dataKey="value"
                        innerRadius={18}
                        outerRadius={28}
                        paddingAngle={2}
                      >
                        {projectTasks.map((_, i) => (
                          <Cell
                            key={`cell-${i}`}
                            fill={COLORS[i % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <button
                  onClick={closeKanban}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-4">
              {loadingTasks ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["To Do", "In Progress", "Done"].map((col) => {
                    const colTasks = projectTasks.filter(
                      (t) => statusMap[t.status] === col || (col === "To Do" && !statusMap[t.status])
                    );
                    return (
                      <div
                        key={col}
                        onDrop={(e) =>
                          onDropToStatus(
                            e,
                            // map column back to status key (use a simple mapping)
                            col === "To Do"
                              ? "PENDING"
                              : col === "In Progress"
                              ? "IN_PROGRESS"
                              : "DONE"
                          )
                        }
                        onDragOver={onDragOver}
                        className="bg-gray-50 rounded-lg p-3 min-h-[200px] flex flex-col"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{col}</h4>
                          <span className="text-xs text-gray-500">
                            {colTasks.length}
                          </span>
                        </div>
                        <div className="space-y-2 flex-1 overflow-auto pr-2">
                          {colTasks.length === 0 ? (
                            <div className="text-xs text-gray-400">
                              No tasks
                            </div>
                          ) : (
                            colTasks.map((t) => (
                              <div
                                key={t.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, t.id)}
                                className="bg-white p-2 rounded-md shadow-sm border border-gray-100 cursor-grab"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm">
                                      {t.title}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {t.description}
                                    </p>
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {t.assigneeCode || "—"}
                                  </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                                  <div>
                                    Due:{" "}
                                    {t.due ? new Date(t.due).toLocaleDateString() : "—"}
                                  </div>
                                  <div className="font-medium">
                                    {statusMap[t.status] || "To Do"}
                                  </div>
                                </div>
                              </div>
                            ))
                  )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

    <div>
            <div>
              <MainEmployeeDashBoard />
            </div>
    </div>
    </div>
  );
};

export default MainManagerDashBoard;
