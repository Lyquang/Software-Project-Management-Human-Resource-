import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { API_ROUTES } from '../../../api/apiRoutes';
import { BsTrash } from 'react-icons/bs';

export const DeleteProjectBtn = ({ projectId, projectName, setProjects }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!projectId) {
      toast.error('Project ID is missing');
      return;
    }

    setIsDeleting(true);
    try {
      const token = sessionStorage.getItem('accessToken') || sessionStorage.getItem('token');
      const res = await fetch(API_ROUTES.PROJECT.DELETE(projectId), {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data?.code !== 200 && data?.code !== 0)) {
        throw new Error(data?.message || `Failed to delete (${res.status})`);
      }

      toast.success('Project deleted successfully!');
      
      // Update the projects list by removing the deleted project
      if (setProjects) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      }
      
      setShowConfirm(false);
    } catch (err) {
      toast.error(err.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowConfirm(true);
        }}
        className="btn btn-sm btn-outline-danger position-absolute top-0 end-0 m-2"
        title="Delete project"
        style={{ zIndex: 10 }}
      >
        <BsTrash />
      </button>

      {showConfirm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirm(false);
          }}
        >
          <div
            className="bg-white rounded shadow-lg p-4"
            style={{ maxWidth: '400px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5 className="mb-3">Confirm Delete</h5>
            <p className="text-muted mb-4">
              Are you sure you want to delete project <strong>{projectName || projectId}</strong>?
              This action cannot be undone.
            </p>
            <div className="d-flex gap-2 justify-content-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirm(false);
                }}
                className="btn btn-sm btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="btn btn-sm btn-danger"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
