import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { API_ROUTES } from '../../../api/apiRoutes';
import { AiOutlineClose, AiOutlineDelete, AiOutlinePlus } from 'react-icons/ai';

const ProjectTeamManagement = ({ projectId, isOpen, onClose }) => {
  const [deptEmployees, setDeptEmployees] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [departmentId, setDepartmentId] = useState('');

  const fetchProjectDepartmentId = async () => {
    if (!projectId) return '';
    const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
    const res = await fetch(API_ROUTES.PROJECT.GET_BY_ID(projectId), {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to get project info');
    }
    const result = data?.result;
    let project = result;
    if (Array.isArray(result)) {
      project = result[0] || {};
    }
    const deptId =
      project?.departmentId ||
      project?.department_id ||
      project?.department?.id ||
      '';
    if (!deptId) {
      throw new Error('Project does not have a department assigned');
    }
    setDepartmentId(deptId);
    return deptId;
  };

  // Fetch department employees belonging to the project's department
  const fetchDepartmentEmployees = async (deptId) => {
    if (!deptId) return;
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const res = await fetch(API_ROUTES.DEPARTMENT.GET_EMPLOYEES(deptId), {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to load employees');
      }
      let employees = [];
      if (Array.isArray(data?.result)) {
        employees = data.result;
      } else if (Array.isArray(data?.result?.employees)) {
        employees = data.result.employees;
      }
      setDeptEmployees(employees);
    } catch (err) {
      toast.error(err.message || 'Failed to load department employees');
      setDeptEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current project members
  const fetchProjectMembers = async () => {
    if (!projectId) return;
    try {
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const res = await fetch(API_ROUTES.PROJECT.EMPLOYEES(projectId), {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to load project members');
      }
      setProjectMembers(Array.isArray(data?.result) ? data.result : []);
    } catch (err) {
      console.warn('Failed to load project members:', err.message);
      setProjectMembers([]);
    }
  };

  useEffect(() => {
    if (isOpen && projectId) {
      (async () => {
        try {
          const deptId = await fetchProjectDepartmentId();
          await fetchDepartmentEmployees(deptId);
        } catch (err) {
          toast.error(err.message || 'Failed to prepare team data');
        }
        await fetchProjectMembers();
      })();
    }
  }, [isOpen, projectId]);

  const handleAssign = async () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }
    setAssigning(true);
    try {
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const res = await fetch(
        API_ROUTES.PROJECT.ASSIGN(projectId, selectedEmployee),
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data?.code !== 0 && data?.code !== 200)) {
        throw new Error(data?.message || `Assign failed (${res.status})`);
      }
      toast.success('Employee assigned successfully');
      setSelectedEmployee('');
      await fetchProjectMembers();
    } catch (err) {
      toast.error(err.message || 'Failed to assign employee');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (employeeCode) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;
    setRemoving(true);
    try {
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const res = await fetch(API_ROUTES.PROJECT.REMOVE(projectId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ employeeCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data?.code !== 0 && data?.code !== 200)) {
        throw new Error(data?.message || `Remove failed (${res.status})`);
      }
      toast.success('Employee removed successfully');
      await fetchProjectMembers();
    } catch (err) {
      toast.error(err.message || 'Failed to remove employee');
    } finally {
      setRemoving(false);
    }
  };

  if (!isOpen) return null;

  const availableEmployees = deptEmployees.filter(
    (emp) => !projectMembers.some((m) => m.code === emp.code)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Manage Team</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Add Employee Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Employee</h3>
            <div className="flex gap-3">
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                disabled={availableEmployees.length === 0}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  {deptEmployees.length === 0 ? 'No employees available' : 'Select an employee'}
                </option>
                {availableEmployees.map((emp) => (
                  <option key={emp.code} value={emp.code}>
                    {emp.name} ({emp.code})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssign}
                disabled={!selectedEmployee || assigning}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
              >
                <AiOutlinePlus size={16} />
                {assigning ? 'Adding...' : 'Add'}
              </button>
            </div>
            {availableEmployees.length === 0 && !loading && (
              <p className="text-xs text-gray-500 mt-2">All department employees are already in the project.</p>
            )}
          </div>

          {/* Current Members Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Team Members ({projectMembers.length})
            </h3>
            <div className="space-y-2">
              {projectMembers.length === 0 ? (
                <p className="text-sm text-gray-500">No team members yet.</p>
              ) : (
                projectMembers.map((member) => (
                  <div
                    key={member.code}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {member.avatar && (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500">{member.code}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(member.code)}
                      disabled={removing}
                      className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded transition flex-shrink-0"
                      title="Remove"
                    >
                      <AiOutlineDelete size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTeamManagement;
