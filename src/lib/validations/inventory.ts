import { z } from 'zod';

export const rawMaterialSchema = z.object({
  name: z.string().min(2, 'Item name is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Display unit is required'),
  baseUnit: z.string().min(1, 'Base unit is required'),
  currentQty: z.number().min(0, 'Quantity cannot be negative').default(0),
  minStockLevel: z.number().min(0, 'Minimum stock level must be 0 or higher').default(5),
  purchasePrice: z.number().min(0, 'Purchase price must be positive'),
  supplierId: z.string().optional().default(''),
  supplierName: z.string().optional().default('General Market'),
  notes: z.string().optional(),
});

export const stockInSchema = z.object({
  rawMaterialId: z.string().min(1, 'Raw material is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitCost: z.number().positive('Unit cost must be greater than 0'),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  invoiceNumber: z.string().optional(),
  batchNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const stockOutSchema = z.object({
  rawMaterialId: z.string().min(1, 'Raw material is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  reason: z.enum([
    'Order Consumption',
    'CONSUMPTION',
    'Waste',
    'WASTE',
    'Adjustment',
    'ADJUSTMENT',
    'Return',
    'RETURN',
  ]),
  notes: z.string().optional(),
  referenceId: z.string().optional(),
});

export const recipeSchema = z.object({
  menuItemName: z.string().min(2, 'Dish name is required'),
  code: z.string().min(2, 'Recipe code is required'),
  category: z.string().min(1, 'Category is required'),
  portionSize: z.string().default('Single'),
  sellingPrice: z.number().positive('Selling price must be greater than 0'),
  ingredients: z
    .array(
      z.object({
        rawMaterialId: z.string().min(1),
        rawMaterialName: z.string(),
        quantity: z.number().positive(),
        unit: z.string(),
        baseUnitQty: z.number().optional(),
        calculatedCost: z.number().optional(),
      })
    )
    .min(1, 'At least one ingredient is required in the recipe'),
  notes: z.string().optional(),
});

export const orderCreateSchema = z.object({
  orderType: z.enum(['dine_in', 'takeaway', 'delivery', 'room_service']),
  tableName: z.string().optional(),
  tableId: z.string().optional(),
  roomNumber: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string(),
        name: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
        subtotal: z.number().positive(),
        recipeId: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .min(1, 'At least one item is required'),
  subtotal: z.number(),
  discount: z.number().default(0),
  tax: z.number().default(0),
  serviceCharge: z.number().default(0),
  grandTotal: z.number(),
  paymentMethod: z.enum(['cash', 'card', 'online', 'room_charge', 'split']).default('cash'),
  notes: z.string().optional(),
});
