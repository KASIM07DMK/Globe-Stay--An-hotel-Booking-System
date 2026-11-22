import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Star, ExternalLink, Search } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { hotelsApi } from '../../services/hotelsApi';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

export const ManageHotelsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-hotels', page, search],
    queryFn: async () => {
      return await hotelsApi.searchHotels({
        destination: search || undefined,
        page,
        limit: 10,
      });
    },
  });

  return (
    <AdminLayout
      title="Hotel Property Directory"
      description="Inspect listed properties, view catalog configurations, and manage room associations."
    >
      <div className="bg-[#060D1E]/90 rounded-3xl border border-blue-900/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Controls */}
        <div className="p-5 sm:p-6 border-b border-blue-900/40 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by hotel or city name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-blue-900/60 bg-[#030712] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">
              Total Listed: <strong className="text-blue-400">{data?.total || 0}</strong>
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#030712] border-b border-blue-900/40 text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">ID &amp; Property</th>
                <th className="py-3.5 px-6">Location</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Rating</th>
                <th className="py-3.5 px-6">Base Rate</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/30">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <Skeleton className="h-6 w-full bg-blue-950/40" />
                  </td>
                </tr>
              ) : !data?.items || data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No properties match your query.
                  </td>
                </tr>
              ) : (
                data.items.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-blue-950/20 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={hotel.hero_image}
                          alt={hotel.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-blue-900/40"
                        />
                        <div>
                          <p className="font-bold text-white">{hotel.name}</p>
                          <span className="text-[10px] text-blue-400 font-mono">
                            REF #{hotel.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-medium">
                      {hotel.city}, {hotel.country}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-950/60 border border-blue-800/40 text-blue-300">
                        {hotel.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1 font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{hotel.guest_rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-white font-sans">
                      ${Number(hotel.starting_price).toFixed(0)} / nt
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                        {hotel.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/hotels/${hotel.id}`}
                        target="_blank"
                        className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
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
            <span className="text-xs text-slate-400">
              Page {page} of {data.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.total_pages}
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

export default ManageHotelsPage;
