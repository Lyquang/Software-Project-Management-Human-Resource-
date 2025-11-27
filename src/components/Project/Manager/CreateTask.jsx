// src/components/Project/Manager/CreateTask.jsx
import React, { useState } from 'react';
import { API_ROUTES } from '../../../api/apiRoutes';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateTask = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDateTime: '', // HTML input datetime-local
    projectId: '',
    assigneeCode: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const toIso = (dtLocal) => {
    if (!dtLocal) return '';
    // dtLocal format: YYYY-MM-DDTHH:mm
    const d = new Date(dtLocal);
    const iso = d.toISOString(); // backend sample shows +07:00; ISO Z should be fine
    return iso;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.projectId || !form.assigneeCode || !form.dueDateTime) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    const payload = {
      title: form.title,
      description: form.description,
      due: toIso(form.dueDateTime),
      projectId: form.projectId,
      assigneeCode: form.assigneeCode,
    };

    try {
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const res = await fetch(API_ROUTES.TASK.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data && data.code !== 200 && data.code !== 0)) {
        throw new Error(data?.message || `Create failed (${res.status})`);
      }
      toast.success('Task created successfully');
      // reset form
      setForm({ title: '', description: '', dueDateTime: '', projectId: '', assigneeCode: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Task</h1>
        <p className="text-gray-500 mt-1">Create a new task for an employee</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title<span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              rows={5}
              value={form.description}
              onChange={onChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due (date & time)<span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                name="dueDateTime"
                value={form.dueDateTime}
                onChange={onChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Project ID<span className="text-red-500">*</span></label>
              <input
                name="projectId"
                value={form.projectId}
                onChange={onChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Project ID"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Assignee Code<span className="text-red-500">*</span></label>
            <input
              name="assigneeCode"
              value={form.assigneeCode}
              onChange={onChange}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Employee code (e.g., BT23092588)"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={() => setForm({ title: '', description: '', dueDateTime: '', projectId: '', assigneeCode: '' })}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
};

export default CreateTask;
