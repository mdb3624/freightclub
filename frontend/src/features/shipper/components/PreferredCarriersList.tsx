// @ts-nocheck
import { useState } from 'react';
// @ts-nocheck
import { useAuthStore } from '@/store/authStore';
// @ts-nocheck
import {
// @ts-nocheck
  usePreferredCarriers,
// @ts-nocheck
  usePreferredCarrierCount,
// @ts-nocheck
  useAddPreferredCarrier,
// @ts-nocheck
  useRemovePreferredCarrier,
// @ts-nocheck
} from '../hooks/usePreferredCarriers';
// @ts-nocheck

// @ts-nocheck
export const PreferredCarriersList = () => {
  const user = useAuthStore((state) => state.user);
  const [newCarrierId, setNewCarrierId] = useState('');
  const [newCarrierNotes, setNewCarrierNotes] = useState('');
  const [page, setPage] = useState(0);

  const { data: carriers, isLoading, error } = usePreferredCarriers(
    user?.id || '',
    page
  );
  const { data: count } = usePreferredCarrierCount(user?.id || '');
  const addMutation = useAddPreferredCarrier(user?.id || '');
  const removeMutation = useRemovePreferredCarrier(user?.id || '');

  if (!user?.id) {
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarrierId.trim()) return;

    addMutation.mutate(
      {
        carrierId: newCarrierId,
        notes: newCarrierNotes || undefined,
      },
      {
        onSuccess: () => {
          setNewCarrierId('');
          setNewCarrierNotes('');
        },
      }
    );
  };

  const handleRemove = (carrierId: string) => {
    if (window.confirm('Remove this carrier from your preferred list?')) {
      removeMutation.mutate(carrierId);
    }
  };

  if (isLoading) {
  }

  if (error) {
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Preferred Carriers</h2>
        {count !== undefined && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {count} carrier{count !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Add Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Add a Preferred Carrier</h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carrier ID or Email
            </label>
            <input
              type="text"
              value={newCarrierId}
              onChange={(e) => setNewCarrierId(e.target.value)}
              placeholder="Enter carrier ID or email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={newCarrierNotes}
              onChange={(e) => setNewCarrierNotes(e.target.value)}
              placeholder="e.g., Negotiated 10% discount"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={!newCarrierId.trim() || addMutation.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {addMutation.isPending ? 'Adding...' : 'Add to Preferred List'}
          </button>
        </form>
      </div>

      {/* Carriers List */}
      {carriers && carriers.content && carriers.content.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Carrier ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Added
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {carriers.content.map((carrier) => (
                <tr key={carrier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {carrier.carrierId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {carrier.notes || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(carrier.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemove(carrier.carrierId)}
                      disabled={removeMutation.isPending}
                      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:text-gray-400"
                    >
                      Remove
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
              Page {page + 1} of {Math.ceil((carriers.totalElements || 0) / 20)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!carriers.hasNext}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
          <p>No preferred carriers added yet.</p>
          <p className="text-sm mt-1">Add your first preferred carrier above.</p>
        </div>
      )}
    </div>
  );
};
