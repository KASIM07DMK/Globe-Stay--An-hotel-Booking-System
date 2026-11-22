import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  DollarSign,
  Search,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { adminApi, AdminPaymentItem } from '../../services/adminApi';

export const ManagePaymentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentItem | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundSuccessMsg, setRefundSuccessMsg] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', page, statusFilter],
    queryFn: async () => {
      const statusParam = statusFilter === 'all' ? undefined : statusFilter;
      return await adminApi.getPayments(page, 15, statusParam);
    },
  });

  const refundMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      return await adminApi.refundPayment(paymentId);
    },
    onSuccess: (res) => {
      setRefundSuccessMsg(res.message);
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      setTimeout(() => {
        setIsRefundModalOpen(false);
        setSelectedPayment(null);
        setRefundSuccessMsg('');
      }, 1500);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Captured</span>
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/60 text-purple-300 border border-purple-800/40">
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            <span>Refunded</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-950/60 text-red-400 border border-red-800/40">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Declined</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/60 text-amber-400 border border-amber-800/40">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{status}</span>
          </span>
        );
    }
  };

  const totalCaptured = data?.items
    ?.filter((p) => p.status === 'COMPLETED')
    .reduce((acc, p) => acc + p.amount, 0) || 0;

  const totalRefunded = data?.items
    ?.filter((p) => p.status === 'REFUNDED')
    .reduce((acc, p) => acc + p.amount, 0) || 0;

  return (
    <AdminLayout
      title="Payment Gateway &amp; Settlements"
      description="Inspect gateway transactions, verify idempotency tokens, and trigger administrative refunds."
    >
      <div className="space-y-6">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#060D1E]/90 border border-blue-900/50 shadow-sm">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-slate-400">Total Processed Vol.</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white font-mono">
              ${totalCaptured.toFixed(2)} <span className="text-xs text-slate-400 font-sans">USD</span>
            </p>
            <span className="text-[10px] text-emerald-400 font-medium">Verified Sandbox Settlements</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#060D1E]/90 border border-blue-900/50 shadow-sm">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-slate-400">Refunds Disbursed</span>
              <RotateCcw className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white font-mono">
              ${totalRefunded.toFixed(2)} <span className="text-xs text-slate-400 font-sans">USD</span>
            </p>
            <span className="text-[10px] text-purple-300 font-medium">Reconciled to Cardholders</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#060D1E]/90 border border-blue-900/50 shadow-sm">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-slate-400">Gateway Status</span>
              <ShieldCheck className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Operational 100%</span>
            </p>
            <span className="text-[10px] text-slate-400">HMAC-SHA256 Webhook Active</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-3 flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'COMPLETED', label: 'Captured' },
              { id: 'REFUNDED', label: 'Refunded' },
              { id: 'FAILED', label: 'Failed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-glow-blue'
                    : 'text-slate-400 hover:bg-blue-950/40 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-3xl border border-blue-900/50 bg-[#060D1E]/90 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl bg-blue-950/40" />
              ))}
            </div>
          ) : !data?.items || data.items.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-blue-400 mx-auto" />
              <h4 className="text-base font-bold text-white">No Transactions Found</h4>
              <p className="text-xs text-slate-400">No payment transaction records match the selected filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-blue-900/50 bg-[#020617] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">ID &amp; Booking</th>
                    <th className="py-4 px-6">Gateway Reference</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/30">
                  {data.items.map((payment) => (
                    <tr key={payment.id} className="hover:bg-blue-950/20 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-blue-400">#{payment.id}</span>
                        {payment.booking_reference && (
                          <span className="block text-[11px] text-slate-400 font-mono">
                            Ref: {payment.booking_reference}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-slate-300 block truncate max-w-[200px]" title={payment.provider_reference || ''}>
                          {payment.provider_reference || 'N/A'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          Idemp: {payment.idempotency_key.substring(0, 18)}...
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-white font-mono text-sm">
                          ${payment.amount.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">{payment.currency}</span>
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(payment.status)}</td>
                      <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                        {payment.created_at ? new Date(payment.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {payment.status === 'COMPLETED' ? (
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsRefundModalOpen(true);
                            }}
                          >
                            Refund
                          </Button>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Reconciled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data && data.total_pages > 1 && (
            <div className="p-4 border-t border-blue-900/40 flex justify-between items-center text-xs">
              <span className="text-slate-400">
                Page {page} of {data.total_pages} ({data.total} total transactions)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="border-blue-900/60 bg-[#030712] text-slate-300"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-blue-900/60 bg-[#030712] text-slate-300"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Refund Confirmation Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => {
          setIsRefundModalOpen(false);
          setSelectedPayment(null);
        }}
        title="Issue Administrative Refund"
        description="Reimburse settled funds directly to the customer's card."
      >
        {selectedPayment && (
          <div className="space-y-4 pt-2">
            {refundSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{refundSuccessMsg}</span>
              </div>
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-xs text-amber-200 flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Issuing a refund will return ${selectedPayment.amount.toFixed(2)} {selectedPayment.currency} to the customer and automatically release the associated reservation rooms back to public inventory.
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#030712] border border-blue-950 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment ID:</span>
                    <span className="font-mono text-white">#{selectedPayment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Booking Reference:</span>
                    <span className="font-mono text-blue-400">{selectedPayment.booking_reference}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-1 border-t border-blue-900/30">
                    <span>Refund Amount:</span>
                    <span className="text-emerald-400 font-mono text-sm">${selectedPayment.amount.toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setIsRefundModalOpen(false)}
                    className="border-blue-900/60 bg-[#060D1E] text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    isLoading={refundMutation.isPending}
                    onClick={() => refundMutation.mutate(selectedPayment.id)}
                  >
                    Confirm Refund
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default ManagePaymentsPage;
