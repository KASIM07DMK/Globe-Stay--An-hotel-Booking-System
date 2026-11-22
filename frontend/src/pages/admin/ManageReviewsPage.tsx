import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  Building,
  User,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi, AdminReviewItem } from '../../services/adminApi';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';

export const ManageReviewsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminReviewItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', page, statusFilter],
    queryFn: async () => {
      return await adminApi.getReviews(
        page,
        15,
        statusFilter === 'all' ? undefined : statusFilter
      );
    },
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'APPROVED' | 'REJECTED' | 'PENDING_MODERATION' }) => {
      return await adminApi.moderateReview(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await adminApi.deleteReview(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      setDeleteTarget(null);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>Approved</span>
          </span>
        );
      case 'PENDING_MODERATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/40">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Pending</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950/60 text-red-400 border border-red-800/40">
            <XCircle className="w-3 h-3 text-red-400" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-800/40">
            {status}
          </span>
        );
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const filterTabs = [
    { key: 'all', label: 'All Reviews' },
    { key: 'APPROVED', label: 'Approved' },
    { key: 'PENDING_MODERATION', label: 'Pending Moderation' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <AdminLayout
      title="Guest Review Moderation"
      description="Inspect submitted guest testimonials, manage moderation statuses, and enforce platform guidelines."
    >
      <div className="bg-[#060D1E]/90 rounded-3xl border border-blue-900/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Filter bar */}
        <div className="p-5 sm:p-6 border-b border-blue-900/40 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === tab.key
                    ? 'bg-blue-600 text-white shadow-glow-blue'
                    : 'text-slate-400 hover:bg-blue-950/40 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Total Reviews: <strong className="text-blue-400">{data?.total || 0}</strong>
          </span>
        </div>

        {/* Reviews Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#030712] border-b border-blue-900/40 text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">ID &amp; Property</th>
                <th className="py-3.5 px-6">Guest Author</th>
                <th className="py-3.5 px-6">Rating</th>
                <th className="py-3.5 px-6 max-w-xs">Feedback / Comment</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Submitted Date</th>
                <th className="py-3.5 px-6 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/30">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-6">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-5/6" />
                      <Skeleton className="h-6 w-4/6" />
                    </div>
                  </td>
                </tr>
              ) : !data?.items || data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-blue-950/40 border border-blue-900/40 flex items-center justify-center mx-auto mb-3 text-blue-400">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-white text-sm">No reviews found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {statusFilter === 'all'
                        ? 'No guest reviews have been submitted yet.'
                        : `No reviews matching status '${statusFilter}'.`}
                    </p>
                  </td>
                </tr>
              ) : (
                data.items.map((review) => (
                  <tr key={review.id} className="hover:bg-blue-950/20 transition-colors">
                    <td className="py-4 px-6 font-medium text-white">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-blue-400 shrink-0" />
                        <div>
                          <span className="font-bold">{review.hotel_name}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            Review #{review.id} • Booking #{review.booking_id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-200">{review.user_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {renderStars(review.rating)}
                        <span className="text-[10px] font-bold text-amber-300 font-mono">
                          {review.rating}.0 / 5.0
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <p className="text-slate-300 line-clamp-2 leading-relaxed">
                        {review.comment}
                      </p>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className="py-4 px-6 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {review.created_at ? new Date(review.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        {review.status !== 'APPROVED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 h-8 px-2.5"
                            onClick={() => moderateMutation.mutate({ id: review.id, status: 'APPROVED' })}
                            isLoading={moderateMutation.isPending}
                            title="Approve Review"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            <span>Approve</span>
                          </Button>
                        )}
                        {review.status !== 'REJECTED' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-400 hover:bg-amber-950/40 hover:text-amber-300 h-8 px-2.5"
                            onClick={() => moderateMutation.mutate({ id: review.id, status: 'REJECTED' })}
                            isLoading={moderateMutation.isPending}
                            title="Reject Review"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            <span>Reject</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:bg-red-950/40 hover:text-red-300 h-8 px-2"
                          onClick={() => setDeleteTarget(review)}
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="p-4 border-t border-blue-900/40 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {data.page} of {data.total_pages}
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page >= data.total_pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Guest Review"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/40 flex items-center space-x-3 text-red-300 text-xs font-semibold">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
              <span>
                Are you sure you want to delete review #{deleteTarget.id} by {deleteTarget.user_name}? This action is irreversible.
              </span>
            </div>
            <p className="text-xs text-slate-300 italic p-3 rounded-xl bg-[#030712] border border-blue-900/40">
              &quot;{deleteTarget.comment}&quot;
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-500 text-white"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                isLoading={deleteMutation.isPending}
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default ManageReviewsPage;
