import { useState } from 'react';
import type React from 'react';
import { useAuthStore } from '@/store/authStore';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import {
  useBlockedCarriers,
  useBlockedCarrierCount,
  useBlockCarrier,
  useUnblockCarrier,
  type BlockedCarrier,
} from '../hooks/useBlockedCarriers';

export const BlockedCarriersList = () => {
  const user = useAuthStore((state) => state.user);
  const [newCarrierId, setNewCarrierId] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [page, setPage] = useState(0);

  const { data: blockedCarriers, isLoading, error } = useBlockedCarriers(user?.id || '', page);
  const { data: count } = useBlockedCarrierCount(user?.id || '');
  const blockMutation = useBlockCarrier();
  const unblockMutation = useUnblockCarrier();

  if (!user?.id) return <ErrorBanner message="You must be signed in to view blocked carriers" />;

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarrierId.trim()) return;

    blockMutation.mutate(
      {
        shipperId: user.id,
        carrierId: newCarrierId,
        reason: blockReason || undefined,
      },
      {
        onSuccess: () => {
          setNewCarrierId('');
          setBlockReason('');
        },
      }
    );
  };

  const handleUnblock = (carrierId: string) => {
    if (window.confirm('Unblock this carrier?')) {
      unblockMutation.mutate({ shipperId: user.id, carrierId });
    }
  };

  if (isLoading) return <p className="text-sm text-gray-400">Loading blocked carriers…</p>;

  if (error) return <ErrorBanner message="Failed to load blocked carriers" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blocked Carriers</h2>
        {count !== undefined && (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            {count} carrier{count !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Block Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Block a Carrier</h3>
        <form onSubmit={handleBlock} className="space-y-4">
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
              Reason (optional)
            </label>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="e.g., Poor service quality, Late deliveries"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={!newCarrierId.trim() || blockMutation.isPending}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400"
          >
            {blockMutation.isPending ? 'Blocking...' : 'Block Carrier'}
          </button>
        </form>
      </div>

      {/* Blocked Carriers List */}
      {blockedCarriers && blockedCarriers.content && blockedCarriers.content.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Carrier ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Blocked On
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {blockedCarriers.content.map((blocked: BlockedCarrier) => (
                <tr key={blocked.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {blocked.carrierId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {blocked.reason || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(blocked.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleUnblock(blocked.carrierId)}
                      disabled={unblockMutation.isPending}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400"
                    >
                      Unblock
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
              Page {page + 1} of {Math.ceil((blockedCarriers.totalElements || 0) / 20)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!blockedCarriers.hasNext}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
          <p>No blocked carriers yet.</p>
          <p className="text-sm mt-1">Block carriers who do not meet your service requirements.</p>
        </div>
      )}
    </div>
  );
};
