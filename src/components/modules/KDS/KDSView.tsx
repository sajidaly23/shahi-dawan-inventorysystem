import React, { useMemo } from 'react';
import { useDb } from '../../../context/DbContext';
import { RestaurantOrder, OrderStatus } from '../../../types';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  Flame,
  UtensilsCrossed,
  Table,
  Building2,
} from 'lucide-react';

export const KDSView: React.FC = () => {
  const { orders, updateOrderStatus, settings, playAudio } = useDb();

  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'cancelled');
  }, [orders]);

  const pendingOrders = activeOrders.filter((o) => o.status === 'pending' || o.status === 'confirmed');
  const preparingOrders = activeOrders.filter((o) => o.status === 'preparing');
  const readyOrders = activeOrders.filter((o) => o.status === 'ready');
  const completedOrders = activeOrders.filter((o) => o.status === 'completed').slice(0, 5);

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    if (currentStatus === 'pending' || currentStatus === 'confirmed') {
      updateOrderStatus(orderId, 'preparing');
    } else if (currentStatus === 'preparing') {
      updateOrderStatus(orderId, 'ready');
    } else if (currentStatus === 'ready') {
      updateOrderStatus(orderId, 'completed'); // Automatically triggers BOM inventory consumption!
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ChefHat className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight font-royal">
              Kitchen Display System (KDS)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live preparation tickets. Marking orders as <strong>Completed automatically triggers Recipe BOM ingredient deductions</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-mono flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Active Tickets: {pendingOrders.length + preparingOrders.length + readyOrders.length}</span>
          </div>
        </div>
      </div>

      {/* KDS Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* COLUMN 1: PENDING / CONFIRMED */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                New Tickets ({pendingOrders.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {pendingOrders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center text-xs text-slate-500">
                No new pending tickets
              </div>
            ) : (
              pendingOrders.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  onAdvance={() => handleAdvanceStatus(order.id, order.status)}
                  actionLabel="Start Cooking"
                  actionColor="bg-sky-500 hover:bg-sky-400 text-slate-950"
                  icon={<Play className="w-3.5 h-3.5" />}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: PREPARING / ON FIRE */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Cooking on Flame ({preparingOrders.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {preparingOrders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center text-xs text-slate-500">
                No tickets currently in preparation
              </div>
            ) : (
              preparingOrders.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  onAdvance={() => handleAdvanceStatus(order.id, order.status)}
                  actionLabel="Mark as Ready"
                  actionColor="bg-amber-500 hover:bg-amber-400 text-slate-950"
                  icon={<Check className="w-3.5 h-3.5" />}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: READY FOR DISPATCH */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Ready for Service ({readyOrders.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {readyOrders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-center text-xs text-slate-500">
                No orders waiting for pickup
              </div>
            ) : (
              readyOrders.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  onAdvance={() => handleAdvanceStatus(order.id, order.status)}
                  actionLabel="Serve & Deduct BOM"
                  actionColor="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 4: RECENTLY COMPLETED */}
        <div className="flex flex-col space-y-3 hidden xl:flex">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recently Completed ({completedOrders.length})
              </h3>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {completedOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 opacity-75 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-white">{order.orderNumber}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-emerald-500/20 text-emerald-300">
                    BOM Deducted
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface KdsTicketCardProps {
  order: RestaurantOrder;
  onAdvance: () => void;
  actionLabel: string;
  actionColor: string;
  icon: React.ReactNode;
}

const KdsTicketCard: React.FC<KdsTicketCardProps> = ({
  order,
  onAdvance,
  actionLabel,
  actionColor,
  icon,
}) => {
  const elapsedMinutes = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
  );

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-mono font-extrabold text-white text-sm tracking-tight">
              #{order.orderNumber}
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-800 text-amber-300 border border-slate-700">
              {order.orderType.replace('_', ' ')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
            {order.tableName && (
              <span className="text-white font-semibold flex items-center gap-1">
                <Table className="w-3 h-3 text-amber-400" /> {order.tableName}
              </span>
            )}
            {order.roomNumber && (
              <span className="text-white font-semibold flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-400" /> Room {order.roomNumber}
              </span>
            )}
            <span>• {order.customerName}</span>
          </p>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{elapsedMinutes}m ago</span>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-1.5 py-1">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between text-xs">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                {item.quantity}
              </span>
              <div>
                <span className="font-semibold text-white">{item.name}</span>
                {item.notes && (
                  <span className="block text-[10px] text-amber-400 italic">*{item.notes}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Special Kitchen Notes */}
      {order.notes && (
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200">
          <strong>Order Remark:</strong> {order.notes}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={onAdvance}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold shadow-md transition transform active:scale-95 ${actionColor}`}
      >
        {icon}
        <span>{actionLabel}</span>
      </button>
    </div>
  );
};
