// src/components/TaskDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { BsFileEarmarkText, BsCheck2Circle, BsPencil, BsRobot } from 'react-icons/bs';
import AIReviewModal from './AIReviewModal';
import { useParams } from 'react-router-dom';
import { API_ROUTES } from '../../../api/apiRoutes';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

// --- DỮ LIỆU MOCK ---
// Bạn có thể thay thế phần này bằng lệnh gọi API sử dụng ID từ useParams
const mockTaskData = {
  id: 'UDD-388',
  estimatedHours: 16,
  assignee: 'Quynh Bui Ngoc Diem',
  reporter: 'Product Manager',
  type: 'Develop',
  priority: 'High',
  startDate: '24/09/2025',
  dueDate: '26/09/2025',
  name: 'Implement User Authentication API',
  references: [
    { 
      id: 1, 
      title: 'Comprehensive Analysis Report on Bayer', 
      subtitle: 'HealthCare Pharmaceuticals, Inc.', 
      source: 'Simple_report.pdf' 
    },
    { 
      id: 2, 
      title: 'In-Depth Review of Bayer HealthCare', 
      subtitle: 'Pharmaceuticals, Inc. [BAY 734]', 
      source: 'Simple_report.pdf' 
    },
  ],
  comments: [
    { 
      id: 1, 
      author: 'Tech Lead', 
      role: 'Tech Lead', 
      tag: 'Commented', 
      timestamp: '2025-09-09 11:43', 
      body: 'Please improve error handling in the authentication middleware. Also, add unit test for the JWT validation functions.', 
      special: true 
    },
    { 
      id: 2, 
      author: 'Oan Quin', 
      role: null, 
      tag: null, 
      timestamp: '2025-09-09 11:43', 
      body: 'Done!', 
      special: false 
    },
  ]
};

// --- CÁC COMPONENT CON (ĐỊNH NGHĨA TRONG CÙNG 1 FILE) ---

// Component cho các trường thông tin (ô màu xám)
const InfoField = ({ label, value }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <div className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 font-medium">
      {value}
    </div>
  </div>
);

// Component cho mỗi mục tài liệu tham khảo
const ReferenceItem = ({ number, title, subtitle, source }) => (
  <li className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 py-4">
    <span className="text-gray-500 font-medium hidden sm:block">[{number}]</span>
    <div className="flex-1">
      <h4 className="font-semibold text-gray-800">
        <span className="text-gray-500 font-medium sm:hidden mr-2">[{number}]</span>
        {title}
      </h4>
      <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
    </div>
    <a 
      href="#" 
      className="flex-shrink-0 flex items-center gap-1.5 text-sm text-blue-600 hover:underline font-medium"
    >
      <BsFileEarmarkText className="w-4 h-4" />
      {source}
    </a>
  </li>
);

// Component cho mỗi thẻ bình luận
const CommentCard = ({ comment }) => {
  const { author, role, tag, timestamp, body, special } = comment;
  
  const cardClasses = special 
    ? 'bg-blue-50 border-blue-200' 
    : 'bg-white border-gray-200';
  
  return (
    <div className={`border rounded-lg ${cardClasses}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b border-inherit">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-800">{author}</span>
          {role && (
            <span className="text-xs font-medium text-gray-500">({role})</span>
          )}
          {tag && (
            <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {tag}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 mt-1 sm:mt-0 flex-shrink-0">
          {timestamp}
        </span>
      </div>
      <div className="p-4 text-sm text-gray-700 whitespace-pre-line">
        {body}
      </div>
    </div>
  );
};

// Component cho các nút hành động cuối trang
const ActionButtons = () => (
  <div className="flex items-center gap-4 mt-8">
    <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 shadow-sm">
      <BsPencil className="w-4 h-4" />
      Edit
    </button>
  </div>
);

// Helper
const formatDue = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const allowedStatuses = ['CANCELED', 'CLOSE', 'COMPLETED', 'IN_PROGRESS', 'OVERDUE', 'PENDING'];

// --- COMPONENT TRANG CHÍNH ---

const TaskDetailsPage = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusValue, setStatusValue] = useState(allowedStatuses[allowedStatuses.length - 1]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [guide, setGuide] = useState(null);
  const [guideLoading, setGuideLoading] = useState(false);

  // Parse từ API -> state, giữ lại comments/references mock
  const fetchTask = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
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
      const normalizedStatus = (r.status || '').toUpperCase();
      const nextStatusValue = allowedStatuses.includes(normalizedStatus)
        ? normalizedStatus
        : allowedStatuses[allowedStatuses.length - 1];
      
      // Fetch assignee info from assigneeCode
      let assigneeName = r.assigneeCode || '—';
      if (r.assigneeCode) {
        try {
          const assigneeRes = await fetch(API_ROUTES.EMPLOYEES.GET_BY_CODE(r.assigneeCode), {
            headers: {
              Accept: 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          const assigneeData = await assigneeRes.json().catch(() => ({}));
          if (assigneeRes.ok && (assigneeData?.code === 200 || assigneeData?.code === 0) && assigneeData?.result) {
            assigneeName = assigneeData.result.employee_name || assigneeData.result.employee_code || r.assigneeCode;
          }
        } catch (e) {
          console.error('Failed to fetch assignee:', e);
        }
      }

      setTask({
        id: r.id,
        estimatedHours: mockTaskData.estimatedHours ?? '—',
        assignee: assigneeName,
        assigneeCode: r.assigneeCode,
        reporter: mockTaskData.reporter ?? '—',
        type: mockTaskData.type ?? '—',
        priority: mockTaskData.priority ?? '—',
        startDate: mockTaskData.startDate ?? '—',
        dueDate: formatDue(r.due),
        name: r.title || '—',
        title: r.title || '—',
        description: r.description || '—',
        references: mockTaskData.references || [],
        comments: mockTaskData.comments || [],
        status: normalizedStatus || '—',
        projectId: r.project_id || '—',
        attachments: [], // initialize attachments list
      });
      setStatusValue(nextStatusValue);
    } catch (e) {
      toast.error(e.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const fetchGuide = async () => {
    if (!id) return;
    setGuideLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const res = await fetch(API_ROUTES.TASK.GET_GUIDE(id), {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.code !== 200 || !data?.result) {
        throw new Error(data?.message || `Failed (${res.status})`);
      }
      setGuide(data.result);
    } catch (e) {
      console.warn('Guide fetch failed:', e.message);
    } finally {
      setGuideLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
    fetchGuide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Derive uploaderCode from stored user info or token
  const getUploaderCode = () => {
    try {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return (
          parsed?.code ||
          parsed?.personnelCode ||
          parsed?.empCode ||
          parsed?.employeeCode ||
          ''
        );
      }
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        return (
          decoded?.code ||
          decoded?.personnelCode ||
          decoded?.empCode ||
          decoded?.sub ||
          ''
        );
      }
    } catch (e) {
      return '';
    }
    return '';
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!task?.id) {
      toast.error('Task not loaded yet');
      return;
    }
    setUploading(true);
    setUploadError('');
    try {
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(API_ROUTES.TASK.UPLOAD_FILE(task.id), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data?.code !== 0 && data?.code !== 200)) {
        throw new Error(data?.message || `Upload failed (${res.status})`);
      }
      const fileMeta = data.result;
      
      // Optimistically update the UI with the new file
      setTask(prev => {
        if (!prev) return null;
        // Create a new list with the new file added
        const newAttachments = [...(prev.attachments || []), fileMeta];
        return { ...prev, attachments: newAttachments };
      });

      toast.success(`Uploaded: ${fileMeta.fileName || file.name}`);
      
      // Clear the file input so the same file can be re-uploaded if needed
      e.target.value = '';

      // Open the modal with the new review data if it exists
      if (fileMeta.aiReviewResponse) {
        setSelectedReview(fileMeta.aiReviewResponse);
        setReviewModalOpen(true);
      }
    } catch (err) {
      const msg = err.message || 'Upload failed';
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const fetchAttachments = async (taskId) => {
    if (!taskId) return;
    setAttachmentsLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const res = await fetch(API_ROUTES.TASK.GET_FILES(taskId), {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      const isOk = res.ok && (data?.code === 0 || data?.code === 200);
      const list = Array.isArray(data?.result) ? data.result : Array.isArray(data) ? data : [];
      if (!isOk) throw new Error(data?.message || `Failed to load attachments (${res.status})`);
      setTask((prev) => ({
        ...(prev || {}),
        attachments: list,
      }));
    } catch (err) {
      console.warn('Attachments fetch failed:', err.message);
    } finally {
      setAttachmentsLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!task?.id) {
      toast.error('Task not loaded yet');
      return;
    }
    const normalized = (statusValue || '').toUpperCase();
    if (!allowedStatuses.includes(normalized)) {
      toast.error('Invalid status value');
      return;
    }
    if ((task?.status || '').toUpperCase() === normalized) {
      toast.info('Status is already up to date');
      return;
    }
    setStatusUpdating(true);
    try {
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const res = await fetch(API_ROUTES.TASK.UPDATE_STATUS(task.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: normalized }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data?.code !== 200 && data?.code !== 0)) {
        throw new Error(data?.message || `Failed (${res.status})`);
      }
      setTask((prev) => (prev ? { ...prev, status: normalized } : prev));
      toast.success('Task status updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Fetch attachments whenever task id changes (after initial task load)
  useEffect(() => {
    if (task?.id) {
      fetchAttachments(task.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  // Hiển thị dùng state task (giữ phần Comments/Reference)
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">View Details</h1>
        <p className="text-gray-500 mt-1">Log your work progress and submit deliverables</p>
      </div>
      
      {/* Thẻ Chi tiết Task */}
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-4 mb-6">
          Task Details
        </h3>
        
        {loading && <div>Loading...</div>}

        {!loading && (
          <>
            {/* Lưới thông tin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <InfoField label="Task ID" value={task?.id ?? '—'} />
              <InfoField label="Estimated Hour (h)" value={task?.estimatedHours ?? '—'} />
              <InfoField label="Assignee" value={task?.assignee ?? '—'} />
              <InfoField label="Reporter" value={task?.reporter ?? '—'} />
              <InfoField label="Type" value={task?.type ?? '—'} />
              <InfoField label="Priority" value={task?.priority ?? '—'} />
              <InfoField label="Start Date" value={task?.startDate ?? '—'} />
              <InfoField label="Due date" value={task?.dueDate ?? '—'} />
            </div>
            
            {/* Trường full-width */}
            <div className="mt-5">
              <InfoField label="Name of task" value={task?.name ?? '—'} />
            </div>

            {/* Status Update */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="flex items-center gap-3">
                <select
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {allowedStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={updateStatus}
                  disabled={statusUpdating}
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold disabled:opacity-60"
                >
                  {statusUpdating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Current: {task?.status || '—'}</p>
            </div>
            
            {/* Mô tả */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 min-h-[120px] whitespace-pre-line">
                {task?.description ?? '—'}
              </div>
            </div>
            
            {/* Task Guide */}
            {guideLoading && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600">Loading guide...</p>
              </div>
            )}
            {!guideLoading && guide && (
              <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-indigo-900 mb-3">📘 Task Guide</h4>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{guide.guide}</p>
                
                {guide.steps && guide.steps.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-indigo-800 mb-2">Steps:</h5>
                    <ol className="space-y-2 list-decimal list-inside">
                      {guide.steps.map((step, idx) => (
                        <li key={idx} className="text-sm text-gray-700 leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {guide.notes && guide.notes.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h5>
                    <ul className="space-y-1 list-disc list-inside">
                      {guide.notes.map((note, idx) => (
                        <li key={idx} className="text-xs text-gray-700 leading-relaxed">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* File Attachments Upload */}
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Attachments</h4>
              <div className="flex flex-col gap-3">
                <div>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  {uploading && (
                    <p className="text-xs text-blue-600 mt-1">Uploading...</p>
                  )}
                  {uploadError && (
                    <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                  )}
                  {attachmentsLoading && !uploading && (
                    <p className="text-xs text-gray-600 mt-1">Loading attachments...</p>
                  )}
                </div>
                <ul className="space-y-2">
                  {(task?.attachments || []).map((f) => (
                    <li
                      key={f.fileId || f.fileUrl || f.fileName}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <BsFileEarmarkText className="text-blue-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">
                          {f.fileName || f.fileUrl || 'Unnamed file'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {f.aiReviewResponse && (
                          <button
                            onClick={() => {
                              setSelectedReview(f.aiReviewResponse);
                              setReviewModalOpen(true);
                            }}
                            className="text-xs font-medium text-purple-600 hover:underline flex items-center gap-1"
                          >
                            <BsRobot />
                            AI Review
                          </button>
                        )}
                        {f.fileUrl && (
                          <a
                            href={f.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-blue-600 hover:underline"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                  {!task?.attachments?.length && (
                    <li className="text-xs text-gray-500">No attachments yet.</li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
      
      <AIReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        reviewData={selectedReview}
      />
    </div>
  );
};

export default TaskDetailsPage;