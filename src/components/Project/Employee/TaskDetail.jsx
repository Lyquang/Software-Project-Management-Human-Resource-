// src/components/TaskDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { BsFileEarmarkText, BsCheck2Circle, BsPencil } from 'react-icons/bs';
import { useParams } from 'react-router-dom';
import { API_ROUTES } from '../../../api/apiRoutes';
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
    <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200 shadow-sm">
      <BsCheck2Circle className="w-4 h-4" />
      Review
    </button>
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

// --- COMPONENT TRANG CHÍNH ---

const TaskDetailsPage = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);

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
      setTask({
        id: r.id,
        estimatedHours: mockTaskData.estimatedHours ?? '—',
        assignee: r.assignee_code || '—',
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
        status: r.status || '—',
        projectId: r.project_id || '—',
      });
    } catch (e) {
      toast.error(e.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
            
            {/* Mô tả */}
            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-800 min-h-[120px] whitespace-pre-line">
                {task?.description ?? '—'}
              </div>
            </div>
            
            {/* Tài liệu tham khảo */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Reference</h4>
              <ul className="divide-y divide-gray-200 border-t border-gray-200">
                {(task?.references || []).map(ref => (
                  <ReferenceItem
                    key={ref.id}
                    number={ref.id}
                    title={ref.title}
                    subtitle={ref.subtitle}
                    source={ref.source}
                  />
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
      
      {/* Khu vực Bình luận */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Comments & Reviews
        </h3>
        
        {/* Danh sách bình luận */}
        <div className="space-y-4 mb-6">
          {(task?.comments || mockTaskData.comments).map(comment => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
        
        {/* Form thêm bình luận */}
        <div>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            rows="4"
            placeholder="Add a comment..."
          ></textarea>
          <button className="mt-3 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition duration-200">
            Add comment
          </button>
        </div>
      </div>
      
      {/* Nút hành động */}
      <ActionButtons />
    </div>
  );
};

export default TaskDetailsPage;