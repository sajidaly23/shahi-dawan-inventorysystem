import React, { useState, useMemo } from 'react';
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
  Sparkles,
  ShoppingBag,
  PlusCircle,
  Filter,
  CheckCheck,
  RefreshCw,
  BellRing,
  Volume2,
  Zap,
} from 'lucide-react';

interface KDSViewProps {
  onNavigateToPos?: () => void;
}

export const KDSView: React.FC<KDSViewProps> = ({ onNavigateToPos }) => {
  const { orders, updateOrderStatus, createOrder, showToast, playAudio, settings } = useDb();
  const [stationFilter, setStationFilter] = useState<string>('All');

  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'cancelled');
  }, [orders]);

  // Filter orders by selected station if applicable
  const filteredOrders = useMemo(() => {
    if (stationFilter === 'All') return activeOrders;
    return activeOrders.filter((order) =>
      order.items.some((item) => {
        if (stationFilter === 'Biryani') return item.name.toLowerCase().includes('biryani') || item.name.toLowerCase().includes('rice');
        if (stationFilter === 'Karahi') return item.name.toLowerCase().includes('karahi') || item.name.toLowerCase().includes('curry') || item.name.toLowerCase().includes('kadhi');
        if (stationFilter === 'Beverages') return item.name.toLowerCase().includes('chai') || item.name.toLowerCase().includes('tea') || item.name.toLowerCase().includes('drink') || item.name.toLowerCase().includes('soda');
        return true;
      })
    );
  }, [activeOrders, stationFilter]);

  const pendingOrders = filteredOrders.filter((o) => o.status === 'pending' || o.status === 'confirmed');
  const preparingOrders = filteredOrders.filter((o) => o.status === 'preparing');
  const readyOrders = filteredOrders.filter((o) => o.status === 'ready');
  const completedOrders = filteredOrders.filter((o) => o.status === 'completed').slice(0, 6);

  const totalActive = pendingOrders.length + preparingOrders.length + readyOrders.length;

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    if (currentStatus === 'pending' || currentStatus === 'confirmed') {
      updateOrderStatus(orderId, 'preparing');
      playAudio('click');
      showToast('info', 'Preparation Started', `Order #${orders.find((o) => o.id === orderId)?.orderNumber} is now on flame.`);
    } else if (currentStatus === 'preparing') {
      updateOrderStatus(orderId, 'ready');
      playAudio('bell');
      showToast('success', 'Order Ready', `Order #${orders.find((o) => o.id === orderId)?.orderNumber} is ready for service pickup!`);
    } else if (currentStatus === 'ready') {
      updateOrderStatus(orderId, 'completed'); // Automatically triggers BOM inventory consumption!
      playAudio('success');
      showToast('success', 'Order Dispatched & BOM Deducted', `Order completed. Recipe raw materials automatically deducted from inventory.`);
    }
  };

  const handleSimulateTicket = () => {
    const demoItems = [
      {
        id: `item-${Date.now()}-1`,
        menuItemId: 'menu-6',
        name: 'Shahi Chicken Biryani',
        quantity: 2,
        unitPrice: 750,
        subtotal: 1500,
        recipeId: 'rec-6',
        notes: 'Extra raita & roasted nuts garnish',
      },
      {
        id: `item-${Date.now()}-2`,
        menuItemId: 'menu-1',
        name: 'Mutton Shinwari Karahi',
        quantity: 1,
        unitPrice: 2200,
        subtotal: 2200,
        recipeId: 'rec-1',
        notes: 'Freshly ground black pepper, mild heat',
      },
      {
        id: `item-${Date.now()}-3`,
        menuItemId: 'menu-5',
        name: 'Royal Karak Chai',
        quantity: 3,
        unitPrice: 150,
        subtotal: 450,
        recipeId: 'rec-5',
        notes: 'Strong brew, separate sugar',
      },
    ];

    createOrder({
      orderType: 'dine_in',
      tableName: 'VIP Lounge 1',
      customerName: 'Royal Diwan Guest',
      items: demoItems,
      subtotal: 4150,
      discount: 150,
      tax: 640,
      serviceCharge: 200,
      grandTotal: 4840,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'cash',
      paidAmount: 0,
      notes: 'Live expedited guest preparation ticket.',
      serverName: 'Hamza Tariq',
    });

    playAudio('bell');
    showToast('success', 'Live Ticket Created', 'Expedited ticket added to Kitchen Display System.');
  };

  return (
    <div className="space-y-4 flex flex-col min-h-[calc(100vh-6.5rem)]">
      {/* Executive Kitchen Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#0f172a]/95 border border-slate-800 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Subtle Decorative Ambient Flare */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-[1.5px] shadow-lg shadow-amber-500/30 shrink-0">
            <div className="w-full h-full bg-[#0a0e1a] rounded-[14px] flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-royal">
                Kitchen Display System (KDS)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Live Station
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live preparation tickets. Advancing tickets to Completed automatically triggers{' '}
              <strong className="text-amber-300 font-semibold">Recipe BOM Raw Material Deductions</strong>.
            </p>
          </div>
        </div>

        {/* Telemetry Strip & Station Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs relative z-10 w-full lg:w-auto justify-start lg:justify-end">
          {/* Active Tickets Pill */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 font-mono flex items-center gap-2 shadow-inner">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-bold">Active:</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold font-mono border border-amber-500/30">
              {totalActive}
            </span>
          </div>

          {/* Average Prep Time */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Avg Prep: <strong className="text-white">12m</strong></span>
          </div>

          {/* Quick Action: Simulate Live Order */}
          <button
            onClick={handleSimulateTicket}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition transform active:scale-95 cursor-pointer"
            title="Create a realistic demo ticket immediately"
          >
            <Zap className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            <span>+ Simulate Ticket</span>
          </button>

          {/* Launch POS Button */}
          {onNavigateToPos && (
            <button
              onClick={onNavigateToPos}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs transition cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>POS Terminal</span>
            </button>
          )}
        </div>
      </div>

      {/* Station Filter Pills */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-thin">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-amber-400" /> Station:
          </span>
          {['All', 'Biryani', 'Karahi', 'Beverages'].map((st) => (
            <button
              key={st}
              onClick={() => setStationFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap text-xs ${
                stationFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st === 'All' ? 'All Kitchen Stations' : `${st} Station`}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 font-mono hidden md:block">
          Kitchen Engine Status: <span className="text-emerald-400 font-bold">● Active Online</span>
        </div>
      </div>

      {/* 4-Column Responsive Commercial KDS Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
        {/* COLUMN 1: NEW TICKETS */}
        <div className="flex flex-col rounded-2xl bg-[#0c1222]/90 border border-slate-800/90 p-3.5 shadow-xl">
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 mb-3.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-300">
                New Tickets
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-200 text-xs font-mono font-bold">
              {pendingOrders.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-18rem)] pr-1">
            {pendingOrders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center space-y-3 my-auto">
                <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto border border-sky-500/20">
                  <CheckCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300">No Pending Tickets</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    All incoming orders have been acknowledged.
                  </p>
                </div>
                <button
                  onClick={handleSimulateTicket}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold border border-slate-700 transition"
                >
                  + Add Test Ticket
                </button>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  onAdvance={() => handleAdvanceStatus(order.id, order.status)}
                  actionLabel="Start Cooking"
                  actionColor="bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold"
                  icon={<Play className="w-4 h-4 fill-slate-950" />}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: COOKING ON FLAME */}
        <div className="flex flex-col rounded-2xl bg-[#0c1222]/90 border border-amber-500/20 p-3.5 shadow-xl">
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 mb-3.5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                Cooking on Flame
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-mono font-bold">
              {preparingOrders.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-18rem)] pr-1">
            {preparingOrders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center space-y-3 my-auto">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300">Station Standing By</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    No tickets actively firing on stoves or grills.
                  </p>
                </div>
              </div>
            ) : (
              preparingOrders.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  onAdvance={() => handleAdvanceStatus(order.id, order.status)}
                  actionLabel="Mark as Ready"
                  actionColor="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold"
                  icon={<Check className="w-4 h-4" />}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: READY FOR SERVICE */}
        <div className="flex flex-col rounded-2xl bg-[#0c1222]/90 border border-emerald-500/20 p-3.5 shadow-xl">
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 mb-3.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                Ready for Service
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-mono font-bold">
              {readyOrders.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-18rem)] pr-1">
            {readyOrders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center space-y-3 my-auto">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300">Pickup Counter Clear</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    No orders waiting for server dispatch.
                  </p>
                </div>
              </div>
            ) : (
              readyOrders.map((order) => (
                <KdsTicketCard
                  key={order.id}
                  order={order}
                  onAdvance={() => handleAdvanceStatus(order.id, order.status)}
                  actionLabel="Serve & Deduct BOM"
                  actionColor="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold"
                  icon={<CheckCircle2 className="w-4 h-4" />}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 4: RECENTLY COMPLETED */}
        <div className="flex flex-col rounded-2xl bg-[#0c1222]/90 border border-slate-800/90 p-3.5 shadow-xl">
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 mb-3.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Recently Completed
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
              {completedOrders.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-18rem)] pr-1">
            {completedOrders.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center space-y-2 my-auto">
                <p className="text-xs font-bold text-slate-400">Archive Waiting</p>
                <p className="text-[11px] text-slate-500">
                  Dispatched tickets with automated BOM deduction appear here.
                </p>
              </div>
            ) : (
              completedOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 transition hover:border-slate-700"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-white text-xs">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      BOM Deducted
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800">
                    <span>
                      {order.tableName || (order.roomNumber ? `Room ${order.roomNumber}` : 'Takeaway')}
                    </span>
                    <span className="font-mono text-emerald-400">Rs. {order.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
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
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60))
  );

  // Urgency indicator
  const isUrgent = elapsedMinutes >= 20;
  const isWarning = elapsedMinutes >= 10 && elapsedMinutes < 20;

  return (
    <div
      className={`rounded-2xl bg-[#0f172a] border p-4 shadow-xl space-y-3 transition-all duration-200 hover:-translate-y-0.5 ${
        isUrgent
          ? 'border-rose-500/50 shadow-rose-950/40 ring-1 ring-rose-500/40'
          : isWarning
          ? 'border-amber-500/40 shadow-amber-950/30'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Ticket Header */}
      <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-mono font-extrabold text-white text-sm tracking-tight">
              #{order.orderNumber}
            </h4>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                order.orderType === 'dine_in'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : order.orderType === 'room_service'
                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                  : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
              }`}
            >
              {order.orderType.replace('_', ' ')}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
            {order.tableName && (
              <span className="text-white font-bold flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded">
                <Table className="w-3 h-3 text-amber-400" /> {order.tableName}
              </span>
            )}
            {order.roomNumber && (
              <span className="text-white font-bold flex items-center gap-1 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/50">
                <Building2 className="w-3 h-3 text-purple-300" /> Room {order.roomNumber}
              </span>
            )}
            {order.customerName && (
              <span className="text-slate-400 truncate max-w-[130px]">
                • {order.customerName}
              </span>
            )}
          </p>
        </div>

        {/* Urgency Timer */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold shrink-0 border ${
            isUrgent
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              : isWarning
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-slate-400'}`} />
          <span>{elapsedMinutes}m</span>
        </div>
      </div>

      {/* Item List with Quantities & Modifiers */}
      <div className="space-y-2 py-1">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between text-xs gap-2">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold font-mono text-[11px] flex items-center justify-center shrink-0 border border-amber-500/30">
                {item.quantity}
              </span>
              <div>
                <span className="font-semibold text-white leading-tight block">
                  {item.name}
                </span>
                {item.notes && (
                  <span className="inline-block text-[10px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-medium mt-0.5">
                    ★ {item.notes}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Special Kitchen Notes */}
      {order.notes && (
        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
          <strong className="text-amber-400">Chef Note:</strong> {order.notes}
        </div>
      )}

      {/* Touch-Friendly Action Button */}
      <button
        onClick={onAdvance}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs shadow-lg transition-all transform active:scale-95 cursor-pointer ${actionColor}`}
      >
        {icon}
        <span>{actionLabel}</span>
      </button>
    </div>
  );
};
