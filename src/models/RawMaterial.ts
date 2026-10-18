import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRawMaterial extends Document {
  name: string;
  sku: string;
  category: string;
  unit: string;
  baseUnit: string;
  totalStockIn: number;
  currentQty: number;
  minStockLevel: number;
  purchasePrice: number;
  supplierId?: string;
  supplierName?: string;
  expiryDate?: string;
  purchaseDate?: string;
  batchNumber?: string;
  status: 'active' | 'low_stock' | 'out_of_stock' | 'expired';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RawMaterialSchema = new Schema<IRawMaterial>(
  {
    name: { type: String, required: true, trim: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    category: { type: String, required: true, index: true },
    unit: { type: String, required: true },
    baseUnit: { type: String, required: true },
    totalStockIn: { type: Number, default: 0 },
    currentQty: { type: Number, default: 0 },
    minStockLevel: { type: Number, default: 5 },
    purchasePrice: { type: Number, required: true },
    supplierId: { type: String, default: '' },
    supplierName: { type: String, default: 'General Market' },
    expiryDate: { type: String },
    purchaseDate: { type: String },
    batchNumber: { type: String },
    status: {
      type: String,
      enum: ['active', 'low_stock', 'out_of_stock', 'expired'],
      default: 'active',
      index: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const RawMaterial: Model<IRawMaterial> =
  mongoose.models.RawMaterial || mongoose.model<IRawMaterial>('RawMaterial', RawMaterialSchema);
