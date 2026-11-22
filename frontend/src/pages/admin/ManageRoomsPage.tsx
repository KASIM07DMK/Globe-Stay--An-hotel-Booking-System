import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bed,
  Search,
  RefreshCw,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Building,
  Users,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi, AdminRoomType } from '../../services/adminApi';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const ManageRoomsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<AdminRoomType | null>(null);
  const [newCapacity, setNewCapacity] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [reconcileResult, setReconcileResult] = useState<string | null>(null);

  const { data: rooms, isLoading } = useQuery<AdminRoomType[]>({
    queryKey: ['admin-rooms'],
    queryFn: async () => {
      return await adminApi.getRooms();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, capacity, price }: { id: number; capacity: number; price: number }) => {
      return await adminApi.updateRoomInventory(id, {
        total_inventory_count: capacity,
        base_price: price,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      setSelectedRoom(null);
    },
  });

  const reconcileMutation = useMutation({
    mutationFn: async () => {
      return await adminApi.reconcileHolds();
    },
    onSuccess: (res) => {
      setReconcileResult(res.message);
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      setTimeout(() => setReconcileResult(null), 4000);
    },
  });

  const handleOpenEdit = (room: AdminRoomType) => {
    setSelectedRoom(room);
    setNewCapacity(room.total_inventory_count);
    setNewPrice(Number(room.base_price));
  };

  const handleSaveEdit = () => {
    if (!selectedRoom) return;
    updateMutation.mutate({
      id: selectedRoom.id,
      capacity: newCapacity,
      price: newPrice,
    });
  };

  const filteredRooms = (rooms || []).filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.hotel_name && r.hotel_name.toLowerCase().includes(q))
    );
  });

  const totalCapacity = (rooms || []).reduce((acc, r) => acc + r.total_inventory_count, 0);
  const totalActiveHolds = (rooms || []).reduce((acc, r) => acc + r.active_holds, 0);
  const totalActiveBookings = (rooms || []).reduce((acc, r) => acc + r.active_bookings, 0);

  return (
    <AdminLayout
      title="Room Types &amp; Inventory Management"
      description="Phase 6: Live transactional room inventory matrix, anti-overbooking capacity control, and expired hold reconciler."
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-[#060D1E]/90 border border-blue-900/50 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Suite Types
          </span>
          <p className="text-2xl font-black text-white mt-1">{rooms?.length || 0}</p>
        </div>

        <div className="rounded-3xl bg-[#060D1E]/90 border border-blue-900/50 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Capacity (Rooms)
          </span>
          <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300 mt-1">
            {totalCapacity}
          </p>
        </div>

        <div className="rounded-3xl bg-[#060D1E]/90 border border-blue-900/50 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Inventory Holds
          </span>
          <p className="text-2xl font-black text-amber-400 mt-1">{totalActiveHolds}</p>
        </div>

        <div className="rounded-3xl bg-[#060D1E]/90 border border-blue-900/50 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Confirmed Booked Rooms
          </span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{totalActiveBookings}</p>
        </div>
      </div>

      {reconcileResult && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{reconcileResult}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-[#060D1E]/90 rounded-3xl border border-blue-900/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Controls Header */}
        <div className="p-5 sm:p-6 border-b border-blue-900/40 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by hotel or room name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-blue-900/60 bg-[#030712] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => reconcileMutation.mutate()}
              isLoading={reconcileMutation.isPending}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="border-blue-900/60 bg-[#030712] text-blue-300 hover:text-white"
            >
              Reconcile Expired Holds
            </Button>
          </div>
        </div>

        {/* Inventory Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#030712] border-b border-blue-900/40 text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Room Type &amp; Property</th>
                <th className="py-3.5 px-6">Bed &amp; Guests</th>
                <th className="py-3.5 px-6">Nightly Base Rate</th>
                <th className="py-3.5 px-6">Total Capacity</th>
                <th className="py-3.5 px-6">Active Holds</th>
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
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No room types found matching your query.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-blue-950/20 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                          <Bed className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{room.name}</p>
                          <span className="text-[10px] text-blue-400 font-medium">
                            {room.hotel_name || `Hotel #${room.hotel_id}`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      <p className="font-semibold text-white">{room.bed_configuration}</p>
                      <span className="text-[10px] text-slate-400">
                        Max {room.maximum_occupancy} Guests
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-white font-sans">
                      ${Number(room.base_price).toFixed(2)}{' '}
                      <span className="text-[10px] text-slate-400 uppercase font-normal">
                        {room.currency}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-950/60 border border-blue-800/40 text-blue-300">
                        {room.total_inventory_count} Units
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {room.active_holds > 0 ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-400 border border-amber-800/40">
                          <span>{room.active_holds} On Hold</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">0 Holds</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          room.status === 'active'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                            : 'bg-red-950/60 text-red-400 border border-red-800/50'
                        }`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenEdit(room)}
                        className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-bold"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Room Capacity Modal */}
      <Modal
        isOpen={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
        title={`Adjust Inventory: ${selectedRoom?.name || ''}`}
        description={`Configure total available room units and base pricing for ${selectedRoom?.hotel_name || ''}`}
      >
        {selectedRoom && (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#030712] border border-blue-950 text-xs space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Bed Configuration:</span>
                <span className="font-semibold text-white">{selectedRoom.bed_configuration}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Current Active Holds:</span>
                <span className="font-semibold text-amber-400">{selectedRoom.active_holds} Units</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Total Room Capacity (Units)
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={newCapacity}
                onChange={(e) => setNewCapacity(parseInt(e.target.value, 10) || 1)}
                className="w-full rounded-xl border border-blue-900/60 bg-[#030712] p-3 text-white text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Updating this updates baseline daily availability for all future reservations.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Nightly Base Rate ({selectedRoom.currency})
              </label>
              <input
                type="number"
                min={1}
                step={5}
                value={newPrice}
                onChange={(e) => setNewPrice(parseFloat(e.target.value) || 1)}
                className="w-full rounded-xl border border-blue-900/60 bg-[#030712] p-3 text-white text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setSelectedRoom(null)}
                className="border-blue-900/60 bg-[#060D1E] text-slate-300"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={updateMutation.isPending}
                onClick={handleSaveEdit}
              >
                Save Inventory Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default ManageRoomsPage;
