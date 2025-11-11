// src/components/TaskManagementPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { BsFillGridFill, BsArrowRepeat, BsClockHistory, BsCheckCircleFill } from 'react-icons/bs';
import StatCard from './StatCard';
import TaskList from './TaskList';
import { API_ROUTES } from '../../../api/apiRoutes';
import { toast } from 'react-toastify';

const mapStatusUi = (s) => {
  const v = (s || '').toUpperCase();
  if (v === 'PENDING' || v === 'TODO') return 'Todo';
  if (v === 'IN_PROGRESS') return 'In Progress';
  if (v === 'REVIEW' || v === 'PENDING_REVIEW') return 'Review';
  if (v === 'DONE' || v === 'COMPLETED') return 'Done';
  return 'Todo';
};

const formatDue = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return '—';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const normalizeTask = (t) => ({
  id: t.id,
  title: t.title || 'Untitled task',
  description: t.description || '',
  loggedTime: '—',
  dueDate: formatDue(t.due),
  priority: 'MEDIUM',
  status: mapStatusUi(t.status),
});

const getEmpCode = () => {
  try {
    const raw = sessionStorage.getItem('user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.code || u?.result?.code || null;
  } catch {
    return null;
  }
};

const TaskManagementPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyTasks = async () => {
    const code = getEmpCode();
    if (!code) {
      toast.error('Missing user code');
      return;
    }
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const url = `${API_ROUTES.TASK.EMPLOYEE}?code=${encodeURIComponent(code)}`;
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.code !== 200) {
        throw new Error(data?.message || `Failed (${res.status})`);
      }
      const list = Array.isArray(data.result) ? data.result : [];
      setTasks(list.map(normalizeTask));
    } catch (e) {
      toast.error(e.message || 'Load tasks failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const stats = useMemo(() => {
    const c = { todo: 0, inProgress: 0, review: 0, done: 0 };
    tasks.forEach(t => {
      if (t.status === 'Todo') c.todo++;
      else if (t.status === 'In Progress') c.inProgress++;
      else if (t.status === 'Review') c.review++;
      else if (t.status === 'Done') c.done++;
    });
    return [
      { title: 'Todo', count: c.todo, icon: <BsFillGridFill />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
      { title: 'In Progress', count: c.inProgress, icon: <BsArrowRepeat />, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      { title: 'Pending review', count: c.review, icon: <BsClockHistory />, color: 'text-purple-600', bgColor: 'bg-purple-100' },
      { title: 'Done', count: c.done, icon: <BsCheckCircleFill />, color: 'text-green-600', bgColor: 'bg-green-100' },
    ];
  }, [tasks]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-500 mt-1">Manage, evaluate and track all tasks</p>
        </div>
        <button
          onClick={fetchMyTasks}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition duration-200"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <StatCard
            key={s.title}
            title={s.title}
            count={s.count}
            icon={s.icon}
            color={s.color}
            bgColor={s.bgColor}
            size="sm"
          />
        ))}
      </div>

      <TaskList tasks={tasks} />
    </div>
  );
};

export default TaskManagementPage;