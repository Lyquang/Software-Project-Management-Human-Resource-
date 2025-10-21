import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_ROUTES } from '../../../api/apiRoutes';
import { toast, ToastContainer } from 'react-toastify';

const mapStatusUi = (s) => {
  const v = (s || '').toUpperCase();
  if (v === 'PENDING' || v === 'TODO') return 'Todo';
  if (v === 'IN_PROGRESS') return 'In Progress';
  if (v === 'REVIEW' || v === 'PENDING_REVIEW') return 'Review';
  if (v === 'DONE' || v === 'COMPLETED') return 'Done';
  return 'Todo';
};
const mapStatusApi = (ui) => {
  const v = (ui || '').toUpperCase();
  if (v === 'TODO') return 'PENDING';
  if (v === 'IN PROGRESS') return 'IN_PROGRESS';
  if (v === 'REVIEW') return 'REVIEW';
  if (v === 'DONE') return 'DONE';
  return 'PENDING';
};

const formatDueYMD = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const toIsoFromYMD = (ymd) => {
  if (!ymd) return null;
  // Keep 00:00Z; adjust if backend needs timezone
  return `${ymd}T00:00:00.000Z`;
};

const TaskEdit = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState({ assigneeCode: '—', projectId: '—' });
  const [form, setForm] = useState({
    title: '',
    dueDate: '',
    statusUi: 'Todo',
    description: '',
  });

  const fetchTask = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const res = await fetch(API_ROUTES.TASK.GET_ONE(id), {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.code !== 200 || !data?.result) {
        throw new Error(data?.message || `Failed (${res.status})`);
      }
      const r = data.result;
      setMeta({
        assigneeCode: r.assignee_code || '—',
        projectId: r.project_id || '—',
      });
      setForm({
        title: r.title || '',
        dueDate: formatDueYMD(r.due),
        statusUi: mapStatusUi(r.status),
        description: r.description || '',
      });
    } catch (e) {
      toast.error(e.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const payload = {
        title: form.title,
        description: form.description,
        status: mapStatusApi(form.statusUi),
        ...(form.dueDate ? { due: toIsoFromYMD(form.dueDate) } : {}),
      };
      const res = await fetch(API_ROUTES.TASK.UPDATE(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.code !== 200) {
        throw new Error(data?.message || `Update failed (${res.status})`);
      }
      toast.success('Task updated');
      nav(`/login/employee/task/${id}`);
    } catch (e2) {
      toast.error(e2.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
        <p className="text-gray-500 mt-1">Update task information</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-4 mb-6">Task Details</h3>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Task ID</label>
                <div className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 font-medium">
                  {id}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assignee Code</label>
                <div className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 font-medium">
                  {meta.assigneeCode}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  name="statusUi"
                  value={form.statusUi}
                  onChange={onChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Review</option>
                  <option>Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Due date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={onChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Project ID</label>
                <div className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 font-medium">
                  {meta.projectId}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                name="description"
                rows={6}
                value={form.description}
                onChange={onChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe the task..."
              />
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={() => nav(-1)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </>
        )}
      </form>

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
};

export default TaskEdit;