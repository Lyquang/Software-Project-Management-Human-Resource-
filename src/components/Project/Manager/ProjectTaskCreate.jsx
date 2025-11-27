// src/components/Project/Manager/ProjectTaskCreate.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_ROUTES } from '../../../api/apiRoutes';
import axiosInstance from '../../../api/axiosInstance';

// Helper to convert datetime-local to ISO string
const toIso = (dtLocal) => {
  if (!dtLocal) return null;
  // dtLocal expected format YYYY-MM-DDTHH:mm
  const d = new Date(dtLocal);
  return d.toISOString();
};

const ProjectTaskCreate = () => {
  const { projectId, id } = useParams();
  const effectiveProjectId = projectId || id; // support both routing styles
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    due: '', // datetime-local
    assigneeCode: '',
  });
  const [files, setFiles] = useState([]); // staged files (not uploaded yet)
  const [creating, setCreating] = useState(false);
  const [assignees, setAssignees] = useState([]);
  const [loadingAssignees, setLoadingAssignees] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  };

  const resetForm = () => {
    setForm({ title: '', description: '', due: '', assigneeCode: '' });
    setFiles([]);
  };

  useEffect(() => {
    const fetchAssignees = async () => {
      if (!effectiveProjectId) return;
      setLoadingAssignees(true);
      try {
        const res = await axiosInstance.get(API_ROUTES.PROJECT.EMPLOYEES(effectiveProjectId));
        const data = res?.data || {};
        if (data?.result && Array.isArray(data.result)) {
          setAssignees(data.result);
        } else {
          setAssignees([]);
        }
      } catch (err) {
        setAssignees([]);
        toast.error(err.message || 'Failed to load employees');
      } finally {
        setLoadingAssignees(false);
      }
    };
    fetchAssignees();
  }, [effectiveProjectId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!effectiveProjectId) {
      toast.error('Missing project id');
      return;
    }
    if (!form.title || !form.assigneeCode || !form.due) {
      toast.error('Please fill required fields');
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      due: toIso(form.due),
      projectId: effectiveProjectId,
      assigneeCode: form.assigneeCode,
    };

    setCreating(true);
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

      // NOTE: File upload placeholder.
      // Backend spec for attaching files to tasks not provided for creation.
      // You can integrate upload here after task exists using returned id.
      // Example (pseudo): POST /tasks/submit with FormData after creation.

      resetForm();
      // Navigate back to tasks list for the project
      // Prefer public route if accessed from /project, else manager route.
      if (projectId) {
        navigate(`/login/manager/project/${effectiveProjectId}/tasks`);
      } else {
        navigate(`/project/${effectiveProjectId}/tasks`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className='w-full max-w-5xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Create Task</h1>
        <p className='text-gray-500 mt-1'>Project ID: {effectiveProjectId || '—'}</p>
      </div>

      <form onSubmit={submit} className='bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100'>
        <h3 className='text-lg font-semibold text-gray-900 border-b border-gray-200 pb-4 mb-6'>Task Information</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5'>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Title<span className='text-red-500'>*</span></label>
            <input
              name='title'
              value={form.title}
              onChange={onChange}
              className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
              placeholder='Enter task title'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Assign to<span className='text-red-500'>*</span></label>
            <select
              name='assigneeCode'
              value={form.assigneeCode}
              onChange={onChange}
              className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
              required
            >
              <option value='' disabled>
                {loadingAssignees ? 'Loading employees...' : 'Select an employee'}
              </option>
              {assignees.map((emp) => (
                <option key={emp.code} value={emp.code}>
                  {emp.name} ({emp.code}){emp.position ? ` — ${emp.position}` : ''}
                </option>
              ))}
              {(!assignees || assignees.length === 0) && !loadingAssignees && (
                <option value='' disabled>No employees found</option>
              )}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>Due Date & Time<span className='text-red-500'>*</span></label>
            <input
              type='datetime-local'
              name='due'
              value={form.due}
              onChange={onChange}
              className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
              required
            />
          </div>
        </div>
        <div className='mt-5'>
          <label className='block text-sm font-medium text-gray-700 mb-1.5'>Description</label>
          <textarea
            name='description'
            rows={6}
            value={form.description}
            onChange={onChange}
            className='w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
            placeholder='Describe the task...'
          />
        </div>

        <div className='mt-8'>
          <h4 className='text-sm font-medium text-gray-700 mb-2'>Upload Files</h4>
          <input
            type='file'
            multiple
            onChange={onFiles}
            className='block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100'
          />
          {files.length > 0 && (
            <ul className='mt-3 text-sm text-gray-600 list-disc list-inside'>
              {files.map((f, i) => (
                <li key={i}>{f.name} ({Math.round(f.size/1024)} KB)</li>
              ))}
            </ul>
          )}
          <p className='mt-2 text-xs text-gray-400'>Files are selected locally; integrate upload after task creation if backend supports it.</p>
        </div>

        <div className='flex gap-3 mt-8'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={creating}
            className='px-5 py-2.5 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 disabled:opacity-60'
          >
            {creating ? 'Creating...' : 'Create Task'}
          </button>
          <button
            type='button'
            onClick={resetForm}
            className='px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50'
            disabled={creating}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectTaskCreate;
