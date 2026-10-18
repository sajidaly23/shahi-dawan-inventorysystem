import mongoose, { Schema, Document, Model } from 'mongoose';
import { OrderStatus, OrderType } from '../types';

export interface IOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  recipeId?: string;
  notes?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  orderType: OrderType;
  tableId?: string;
  tableName?: string;
  roomGuestId?: string;
  roomNumber?: string;
  customerName?: string;
  customerPhone?: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: 'paid' | 'unpaid' | 'charged_to_room';
  paymentMethod: 'cash' | 'card' | 'online' | 'room_charge' | 'split';
  paidAmount: number;
  notes?: string;
  serverName: string;
  inventoryDeducted: boolean;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    recipeId: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    orderType: {
      type: String,
      enum: ['dine_in', 'takeaway', 'delivery', 'room_service'],
      default: 'dine_in',
    },
    tableId: { type: String },
    tableName: { type: String },
    roomGuestId: { type: String },
    roomNumber: { type: String },
    customerName: { type: String, default: 'Guest' },
    customerPhone: { type: String },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid', 'charged_to_room'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', 'room_charge', 'split'],
      default: 'cash',
    },
    paidAmount: { type: Number, default: 0 },
    notes: { type: String },
    serverName: { type: String, default: 'Staff' },
    inventoryDeducted: { type: Boolean, default: false, index: true },
    confirmedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
