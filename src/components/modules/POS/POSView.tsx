'use client';

import React, { useState, useMemo } from 'react';
import { useDb } from '../../../context/DbContext';
import {
  MenuItem,
  MenuCategory,
  OrderType,
  RestaurantOrder,
  RestaurantTable,
  FolioItem,
} from '../../../types';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  Table,
  Building2,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign,
  ChevronRight,
  Eye,
  Boxes,
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { PrintReceiptModal } from '../../common/PrintReceiptModal';

const MENU_CATEGORIES: Array<MenuCategory | 'All'> = [
  'All',
  'Biryani',
  'Karahi',
  'Handi & Curries',
  'BBQ',
  'Burgers',
  'Pizza',
  'Fries & Appetizers',
  'Drinks',
  'Tea & Coffee',
  'Desserts',
];

export const POSView: React.FC = () => {
  const {
    menuItems,
    recipesMap,
    rawMaterialsMap,
    tables,
    rooms,
    guests,
    hotelBills,
    validateOrderInventory,
    createOrder,
    settings,
    currentUser,
    playAudio,
  } = useDb();

  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<
    Array<{
      menuItem: MenuItem;
      quantity: number;
      notes?: string;
    }>
  >([]);

  // Order Details State
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedTableId, setSelectedTableId] = useState<string>(
    tables.find((t) => t.status === 'available')?.id || tables[0]?.id || ''
  );
  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string>(
    hotelBills.find((b) => b.status === 'open')?.roomNumber || '204'
  );
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState('');

  // Payment Checkout Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConsumptionPreviewOpen, setIsConsumptionPreviewOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<RestaurantOrder['paymentMethod']>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);

  // Receipt Modal State
  const [completedOrderForReceipt, setCompletedOrderForReceipt] = useState<RestaurantOrder | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && item.isAvailable && item.status === 'active';
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.menuItem.sellingPrice * item.quantity, 0);
  }, [cart]);

  // Tax is excluded from POS — hotel charges are settled at folio checkout
  const taxAmount = 0;

  const grandTotal = Math.max(0, cartSubtotal - discountAmount);
  const changeDue = Math.max(0, cashTendered - grandTotal);

  // Real-time Stock Pre-check for current cart
  const stockValidation = useMemo(() => {
    if (cart.length === 0) return { isValid: true, requirements: [], insufficientItems: [], totalEstimatedCost: 0 };
    return validateOrderInventory(
      cart.map((c) => ({ menuItemId: c.menuItem.id, quantity: c.quantity }))
    );
  }, [cart, validateOrderInventory]);

  // Add Item to Cart
  const handleAddToCart = (item: MenuItem) => {
    playAudio('click');
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  // Adjust Cart Quantity
  const handleUpdateQuantity = (menuItemId: string, delta: number) => {
    playAudio('click');
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.menuItem.id === menuItemId) {
            const nextQty = c.quantity + delta;
            return nextQty > 0 ? { ...c, quantity: nextQty } : null;
          }
          return c;
        })
        .filter(Boolean) as Array<{ menuItem: MenuItem; quantity: number; notes?: string }>;
    });
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setOrderNotes('');
  };

  // Open Payment Modal
  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    if (!settings.allowNegativeInventory && !stockValidation.isValid) {
      alert(`Cannot proceed: Insufficient stock for ${stockValidation.insufficientItems.map((i) => i.rawMaterialName).join(', ')}.`);
      return;
    }
    setCashTendered(grandTotal);
    if (orderType === 'room_service') {
      setPaymentMethod('room_charge');
    } else {
      setPaymentMethod('cash');
    }
    setIsPaymentModalOpen(true);
  };

  // Complete Order
  const handleConfirmOrder = () => {
    const selectedTable = tables.find((t) => t.id === selectedTableId);
    const activeBill = hotelBills.find((b) => b.roomNumber === selectedRoomNumber && b.status === 'open');

    const orderItems = cart.map((c) => ({
      id: `oi-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItemId: c.menuItem.id,
      name: c.menuItem.name,
      quantity: c.quantity,
      unitPrice: c.menuItem.sellingPrice,
      subtotal: c.menuItem.sellingPrice * c.quantity,
      notes: c.notes,
      recipeId: c.menuItem.recipeId,
    }));

    const newOrder = createOrder({
      orderType,
      tableId: orderType === 'dine_in' ? selectedTableId : undefined,
      tableName: orderType === 'dine_in' ? selectedTable?.name : undefined,
      roomNumber: orderType === 'room_service' ? selectedRoomNumber : undefined,
      roomGuestId: orderType === 'room_service' ? activeBill?.guestId : undefined,
      customerName:
        orderType === 'room_service'
          ? activeBill?.guestName || 'Hotel Resident'
          : customerName || (orderType === 'dine_in' ? `${selectedTable?.name} Guest` : 'Walk-in Customer'),
      customerPhone: orderType === 'room_service' ? activeBill?.guestPhone : customerPhone,
      items: orderItems,
      subtotal: cartSubtotal,
      discount: discountAmount,
      tax: taxAmount,
      serviceCharge: 0,
      grandTotal,
      status: 'confirmed',
      paymentStatus: paymentMethod === 'room_charge' ? 'charged_to_room' : 'paid',
      paymentMethod,
      paidAmount: paymentMethod === 'room_charge' ? 0 : grandTotal,
      notes: orderNotes,
      serverName: currentUser.name,
    });

    setIsPaymentModalOpen(false);
    setIsConsumptionPreviewOpen(false);
    setCart([]);
    setDiscountAmount(0);
    setOrderNotes('');

    // Open receipt modal
    setCompletedOrderForReceipt(newOrder);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-4 overflow-hidden">
      {/* LEFT / CENTER: MENU & PRODUCT CATALOG (65%) */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Search & Category Pills */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/90 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search menu items, biryani, karahi, steaks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              <strong className="text-white">{filteredMenuItems.length}</strong> Dishes
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Cards Grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
          {filteredMenuItems.map((dish) => {
            const hasRecipe = !!dish.recipeId;
            return (
              <div
                key={dish.id}
                onClick={() => handleAddToCart(dish)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/60 p-3 shadow-lg hover:shadow-amber-500/10 cursor-pointer transition-all duration-200 transform hover:-translate-y-1"
              >
                {/* Dish Image */}
                <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2.5 bg-slate-900">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  {hasRecipe && (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-950/80 text-amber-300 backdrop-blur-md border border-amber-500/40">
                      BOM Linked
                    </span>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-950/90 text-white font-mono">
                    {dish.preparationTime} min
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white tracking-tight line-clamp-1 group-hover:text-amber-400 transition">
                    {dish.name}
                  </h4>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-extrabold text-amber-400 font-mono">
                      {settings.currencySymbol} {dish.sellingPrice.toLocaleString()}
                    </span>
                    <button className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE: POS ORDER CART & ORDER BILLING (35%) */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shrink-0">
        {/* Order Type Tabs */}
        <div className="p-3 border-b border-slate-800 bg-slate-850 space-y-2.5">
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold">
            <button
              onClick={() => setOrderType('dine_in')}
              className={`py-1.5 rounded-lg transition ${
                orderType === 'dine_in' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dine-In
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`py-1.5 rounded-lg transition ${
                orderType === 'takeaway' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Takeaway
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              className={`py-1.5 rounded-lg transition ${
                orderType === 'delivery' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Delivery
            </button>
            <button
              onClick={() => setOrderType('room_service')}
              className={`py-1.5 rounded-lg transition ${
                orderType === 'room_service' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Room Serv.
            </button>
          </div>

          {/* Type-Specific Selector */}
          {orderType === 'dine_in' && (
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              >
                {tables.map((tbl) => (
                  <option key={tbl.id} value={tbl.id}>
                    {tbl.name} ({tbl.zone}) — {tbl.status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {orderType === 'room_service' && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={selectedRoomNumber}
                onChange={(e) => setSelectedRoomNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
              >
                {hotelBills
                  .filter((b) => b.status === 'open')
                  .map((bill) => (
                    <option key={bill.id} value={bill.roomNumber}>
                      Room {bill.roomNumber} ({bill.guestName})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Stock Validation Pre-check Warning Banner */}
        {!stockValidation.isValid && (
          <div className="p-3 bg-rose-500/15 border-b border-rose-500/30 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
            <div className="flex-1 text-[11px] text-rose-200 leading-tight">
              <strong className="block font-bold text-rose-300">Insufficient BOM Stock:</strong>
              {stockValidation.insufficientItems.map((item) => (
                <span key={item.rawMaterialId} className="block text-[10px] text-rose-300/90 mt-0.5">
                  • {item.rawMaterialName}: Need {item.requiredFormatted}, have {item.availableFormatted}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2 divide-y divide-slate-800/60">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <ShoppingBag className="w-8 h-8 stroke-1 text-slate-600" />
              <p className="text-xs">Cart is currently empty.</p>
              <p className="text-[11px] text-slate-600">Select dishes from the menu to build an order.</p>
            </div>
          ) : (
            cart.map((cartItem) => (
              <div key={cartItem.menuItem.id} className="pt-2 flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-white truncate">{cartItem.menuItem.name}</h5>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {settings.currencySymbol} {cartItem.menuItem.sellingPrice} × {cartItem.quantity} ={' '}
                    <strong className="text-white">
                      {settings.currencySymbol} {cartItem.menuItem.sellingPrice * cartItem.quantity}
                    </strong>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleUpdateQuantity(cartItem.menuItem.id, -1)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-mono font-bold text-xs text-white">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(cartItem.menuItem.id, 1)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* BOM Consumption Preview Button */}
        {cart.length > 0 && (
          <div className="px-4 py-2 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setIsConsumptionPreviewOpen(true)}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold transition"
            >
              <Boxes className="w-4 h-4" />
              <span>Preview BOM Consumption ({stockValidation.requirements.length} Ingredients)</span>
            </button>
            <span className="text-[10px] font-mono text-slate-400">
              Est. Food Cost: {settings.currencySymbol} {stockValidation.totalEstimatedCost.toLocaleString()}
            </span>
          </div>
        )}

        {/* Cart Bottom Summary & Checkout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 space-y-3 shrink-0">
          <div className="space-y-1.5 text-xs">
            {discountAmount > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono text-white font-semibold">
                  {settings.currencySymbol} {cartSubtotal.toLocaleString()}
                </span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount:</span>
                <span className="font-mono font-semibold">
                  -{settings.currencySymbol} {discountAmount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-amber-400 pt-1.5 border-t border-slate-800">
              <span>Total:</span>
              <span className="font-mono">
                {settings.currencySymbol} {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleClearCart}
              disabled={cart.length === 0}
              className="py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold disabled:opacity-40 transition"
            >
              Clear Cart
            </button>
            <button
              onClick={handleOpenPayment}
              disabled={cart.length === 0}
              className="py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-950 disabled:opacity-40 transition flex items-center justify-center gap-1.5"
            >
              <span>Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CONSUMPTION PREVIEW MODAL */}
      <Modal
        isOpen={isConsumptionPreviewOpen}
        onClose={() => setIsConsumptionPreviewOpen(false)}
        title="Recipe BOM Raw Material Consumption Preview"
        subtitle="Exact ingredient deduction when this order is fulfilled"
        maxWidth="2xl"
        icon={<Boxes className="w-5 h-5 text-amber-400" />}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Order Summary</span>
              <strong className="text-white text-sm">
                {cart.map((c) => `${c.quantity}x ${c.menuItem.name}`).join(' + ')}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Est. Food Cost</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {settings.currencySymbol} {stockValidation.totalEstimatedCost.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-300 font-bold border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Raw Material Ingredient</th>
                  <th className="py-2.5 px-3 text-right">Required</th>
                  <th className="py-2.5 px-3 text-right">Available Stock</th>
                  <th className="py-2.5 px-3 text-right">Projected Remaining</th>
                  <th className="py-2.5 px-3 text-center">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stockValidation.requirements.map((req) => (
                  <tr key={req.rawMaterialId} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-white block">{req.rawMaterialName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">SKU: {req.sku}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                      {req.requiredFormatted}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      {req.availableFormatted}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {req.remainingFormatted}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          req.isSufficient
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {req.isSufficient ? 'In Stock' : 'Deficit'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsConsumptionPreviewOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Close Preview
            </button>
            <button
              type="button"
              onClick={() => {
                setIsConsumptionPreviewOpen(false);
                handleOpenPayment();
              }}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </Modal>

      {/* PAYMENT MODAL */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Complete POS Order & Payment"
        subtitle={`Order Total: ${settings.currencySymbol} ${grandTotal.toLocaleString()}`}
        maxWidth="md"
        icon={<CreditCard className="w-5 h-5 text-amber-400" />}
      >
        <div className="space-y-5">
          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center gap-2 p-3 rounded-xl border transition ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500/20 border-amber-500/40 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>Cash Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center gap-2 p-3 rounded-xl border transition ${
                  paymentMethod === 'card'
                    ? 'bg-amber-500/20 border-amber-500/40 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                className={`flex items-center gap-2 p-3 rounded-xl border transition ${
                  paymentMethod === 'online'
                    ? 'bg-amber-500/20 border-amber-500/40 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4 text-purple-400" />
                <span>JazzCash / EasyPaisa</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('room_charge')}
                className={`flex items-center gap-2 p-3 rounded-xl border transition ${
                  paymentMethod === 'room_charge'
                    ? 'bg-amber-500/20 border-amber-500/40 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Charge to Hotel Room</span>
              </button>
            </div>
          </div>

          {/* Cash Tendered Input */}
          {paymentMethod === 'cash' && (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold uppercase">Cash Tendered:</span>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                  className="w-32 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-sm font-mono text-white text-right focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-700">
                <span className="text-slate-400">Change Return:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {settings.currencySymbol} {changeDue.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Room Charge Notice */}
          {paymentMethod === 'room_charge' && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
              <span className="font-bold text-amber-300 block uppercase">
                Integrated Room Folio Billing
              </span>
              <p className="text-slate-300 leading-relaxed">
                This dining order of <strong>{settings.currencySymbol} {grandTotal.toLocaleString()}</strong> will be charged directly to Room {selectedRoomNumber}. It will appear on the guest's consolidated checkout invoice.
              </p>
            </div>
          )}

          {/* Confirm Payment Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmOrder}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition"
            >
              Confirm Order & Generate Receipt
            </button>
          </div>
        </div>
      </Modal>

      {/* PRINT RECEIPT MODAL */}
      <PrintReceiptModal
        order={completedOrderForReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};
