import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

export const ManageUsersPage: React.FC = () => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, roleFilter],
    queryFn: async () => {
      return await adminApi.getUsers(
        page,
        20,
        roleFilter === 'all' ? undefined : roleFilter
      );
    },
  });

  return (
    <AdminLayout
      title="User Accounts &amp; Permissions"
      description="Inspect registered members, view roles, and audit access security."
    >
      <div className="bg-[#060D1E]/90 rounded-3xl border border-blue-900/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Filter bar */}
        <div className="p-5 sm:p-6 border-b border-blue-900/40 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-2">
            {['all', 'customer', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => {
                  setRoleFilter(role);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                  roleFilter === role
                    ? 'bg-blue-600 text-white shadow-glow-blue'
                    : 'text-slate-400 hover:bg-blue-950/40 hover:text-white'
                }`}
              >
                {role === 'all' ? 'All Roles' : `${role}s`}
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-slate-400">
            Total Users: <strong className="text-blue-400">{data?.total || 0}</strong>
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#030712] border-b border-blue-900/40 text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">ID &amp; Member</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Account Status</th>
                <th className="py-3.5 px-6">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/30">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Skeleton className="h-6 w-full bg-blue-950/40" />
                  </td>
                </tr>
              ) : !data?.items || data.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    No users found matching this filter criteria.
                  </td>
                </tr>
              ) : (
                data.items.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-950/20 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.full_name}</p>
                          <span className="text-[10px] text-blue-400 font-mono">
                            UID #{user.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-medium">{user.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-700/60 shadow-glow-blue'
                            : 'bg-slate-900 border border-slate-800 text-slate-300'
                        }`}
                      >
                        {user.role === 'admin' && <Shield className="w-3 h-3 text-blue-400" />}
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user.is_active ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-red-400 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-medium">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total > data.limit && (
          <div className="p-4 border-t border-blue-900/40 flex justify-between items-center bg-[#030712]">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-blue-900/60 bg-[#060D1E] text-slate-300"
            >
              Previous
            </Button>
            <span className="text-xs text-slate-400">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={data.items.length < data.limit}
              onClick={() => setPage((p) => p + 1)}
              className="border-blue-900/60 bg-[#060D1E] text-slate-300"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageUsersPage;
