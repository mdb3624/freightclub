// @ts-nocheck
import { useState } from 'react';
// @ts-nocheck
import { useAuthStore } from '@/store/authStore';
// @ts-nocheck
import {
// @ts-nocheck
  useAssignedLoads,
// @ts-nocheck
  useAcceptAssignment,
// @ts-nocheck
  useRevokeAssignment,
// @ts-nocheck
} from '../hooks/useLoadAssignment';
// @ts-nocheck

// @ts-nocheck
export const AssignedLoads = () => {
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(0);

  const { data: assignments, isLoading, error } = useAssignedLoads(user?.id || '', page);
  const acceptMutation = useAcceptAssignment();
  const revokeMutation = useRevokeAssignment();

  if (!user?.id) {
  }

  const handleAccept = (loadId: string) => {
    acceptMutation.mutate({ loadId, carrierId: user.id });
  };

  const handleRevoke = (loadId: string) => {
    if (window.confirm('Revoke this load assignment?')) {
      revokeMutation.mutate(loadId);
    }
  };

  if (isLoading) {
  }

  if (error) {
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Assigned Loads</h2>
        <p className="text-gray-600 mt-2">
          Loads assigned to you by shippers. Accept to commit to the load.
        </p>
      </div>

      {assignments && assignments.content && assignments.content.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Load ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Shipper ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Assigned At
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {assignments.content.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {assignment.loadId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {assignment.assignedByShipperId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(assignment.assignedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {assignment.acceptedByCarrier ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Accepted
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {!assignment.acceptedByCarrier && (
                      <button
                        onClick={() => handleAccept(assignment.loadId)}
                        disabled={acceptMutation.isPending}
                        className="text-green-600 hover:text-green-800 text-sm font-medium disabled:text-gray-400"
                      >
                        Accept
                      </button>
                    )}
                    <button
                      onClick={() => handleRevoke(assignment.loadId)}
                      disabled={revokeMutation.isPending}
                      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:text-gray-400"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page + 1} of {Math.ceil((assignments.totalElements || 0) / 20)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!assignments.hasNext}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
          <p>No loads assigned to you yet.</p>
          <p className="text-sm mt-1">Shippers will assign loads here when they need your services.</p>
        </div>
      )}
    </div>
  );
};
