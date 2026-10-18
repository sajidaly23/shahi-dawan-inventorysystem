import mongoose, { Schema, Document, Model } from 'mongoose';
import { InventoryTransactionType } from '../types';

export interface IStockTransaction extends Document {
  date: Date;
  rawMaterialId: string;
  itemName: string;
  sku: string;
  type: InventoryTransactionType;
  quantity: number;
  unit: string;
  baseQtyChange: number;
  previousBalance: number;
  newBalance: number;
  referenceId: string;
  user: string;
  notes?: string;
  costImpact?: number;
  createdAt: Date;
  updatedAt: Date;
}

const StockTransactionSchema = new Schema<IStockTransaction>(
  {
    date: { type: Date, default: Date.now, index: true },
    rawMaterialId: { type: String, required: true, index: true },
    itemName: { type: String, required: true },
    sku: { type: String, required: true },
    type: { type: String, required: true, index: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    baseQtyChange: { type: Number, required: true },
    previousBalance: { type: Number, required: true },
    newBalance: { type: Number, required: true },
    referenceId: { type: String, required: true, index: true },
    user: { type: String, required: true },
    notes: { type: String },
    costImpact: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const StockTransaction: Model<IStockTransaction> =
  mongoose.models.StockTransaction ||
  mongoose.model<IStockTransaction>('StockTransaction', StockTransactionSchema);
