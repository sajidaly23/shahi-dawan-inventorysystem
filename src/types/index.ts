export type UnitDimension = 'mass' | 'volume' | 'count';

export type UnitType =
  | 'KG'
  | 'Gram'
  | 'Liter'
  | 'ML'
  | 'Piece'
  | 'Dozen'
  | 'Pack'
  | 'Box'
  | 'Bottle'
  | 'Plate'
  | 'Portion'
  | 'Cup'
  | 'Other';

export type RawMaterialCategory =
  | 'Meat & Poultry'
  | 'Seafood'
  | 'Grains & Pulses'
  | 'Oils & Fats'
  | 'Spices & Seasonings'
  | 'Dairy & Eggs'
  | 'Fresh Vegetables'
  | 'Fruits'
  | 'Beverages & Syrups'
  | 'Flour & Bakery'
  | 'Packaging & Consumables'
  | 'Sauces & Condiments'
  | 'Tea & Coffee'
  | 'Prepared Ingredients'
  | 'Frozen Items'
  | 'Other';

export interface RawMaterial {
  id: string;
  name: string;
  sku: string;
  category: RawMaterialCategory;
  unit: UnitType;           // Display purchase unit (e.g. KG, Liter, Piece)
  baseUnit: UnitType;       // Canonical storage base unit (e.g. Gram, ML, Piece)
  totalStockIn: number;     // Cumulative total received stock (in baseUnit) — NEVER decremented by consumption/waste
  currentQty: number;       // Currently available quantity (in baseUnit) — decremented by consumption/waste
  minStockLevel: number;    // In display unit
  purchasePrice: number;    // Price per display unit (e.g. Rs. 800 per KG)
  supplierId: string;
  supplierName: string;
  expiryDate?: string;
  purchaseDate?: string;
  batchNumber?: string;
  status: 'active' | 'low_stock' | 'out_of_stock' | 'expired';
  notes?: string;
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  productsSupplied: string[];
  totalPurchases: number;
  outstandingBalance: number;
  status: 'active' | 'inactive';
  rating?: number;
  createdAt: string;
}

export interface PurchaseItem {
  rawMaterialId: string;
  rawMaterialName: string;
  quantity: number;        // in purchase unit
  unit: UnitType;
  unitCost: number;        // cost per purchase unit
  totalCost: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  paymentMethod: 'cash' | 'bank_transfer' | 'credit' | 'cheque';
  paidAmount: number;
  notes?: string;
  receivedBy: string;
  createdAt: string;
}

export interface RecipeIngredient {
  rawMaterialId: string;
  rawMaterialName: string;
  quantity: number;        // Quantity in selected unit (e.g., 250)
  unit: UnitType;          // Unit used in recipe (e.g., 'Gram')
  baseUnitQty: number;     // Normalized quantity in canonical base unit
  calculatedCost: number;  // Real-time calculated cost based on latest ingredient price
}

export type RecipePortionSize = 'Half' | 'Full' | 'Single' | 'Double' | 'Family' | 'Custom';

export interface Recipe {
  id: string;
  menuItemId: string;
  menuItemName: string;
  code?: string;            // Recipe SKU / Code
  category?: string;
  portionSize?: RecipePortionSize;
  version: number;
  yieldServings: number;    // Default 1 serving
  outputQuantity?: number;
  outputUnit?: string;
  preparationTime?: number; // In minutes
  ingredients: RecipeIngredient[];
  totalFoodCost: number;    // Sum of all ingredient costs for 1 serving
  sellingPrice: number;     // Linked Menu Item selling price
  grossMarginRs: number;    // Selling Price - Food Cost
  foodCostPercentage: number; // (Food Cost / Selling Price) * 100
  profitMarginPercentage?: number;
  notes?: string;
  description?: string;
  preparationInstructions?: string;
  isActive?: boolean;
  updatedAt: string;
}

export type MenuCategory =
  | 'Biryani'
  | 'Karahi'
  | 'BBQ'
  | 'Handi & Curries'
  | 'Burgers'
  | 'Pizza'
  | 'Fries & Appetizers'
  | 'Drinks'
  | 'Tea & Coffee'
  | 'Desserts';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  image: string;
  sellingPrice: number;
  recipeId?: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  status: 'active' | 'unavailable' | 'seasonal';
  foodCost?: number;
  grossMargin?: number;
  foodCostPercentage?: number;
  code?: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
  recipeId?: string;
  ingredientsConsumed?: {
    rawMaterialId: string;
    rawMaterialName: string;
    quantity: number;
    unit: UnitType;
    cost: number;
  }[];
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery' | 'room_service';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export interface RestaurantOrder {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  tableId?: string;
  tableName?: string;
  roomGuestId?: string;
  roomNumber?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
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
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  serverName: string;
  inventoryDeducted: boolean; // Flag to prevent duplicate deductions
  roomChargeFolioId?: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface RestaurantTable {
  id: string;
  tableNumber: string;
  name: string;
  zone: 'Main Dining Hall' | 'Rooftop Terrace' | 'Family VIP Area' | 'Garden Lounge';
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  currentOrderTotal?: number;
  activeGuestsCount?: number;
  occupiedSince?: string;
  reservationInfo?: {
    guestName: string;
    guestPhone: string;
    reservationTime: string;
    partySize: number;
  };
}

export type RoomType =
  | 'Standard Double'
  | 'Deluxe Room'
  | 'Executive Suite'
  | 'Royal Presidential Suite'
  | 'Family Penthouse';

export type RoomStatus =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'cleaning'
  | 'maintenance';

export interface Room {
  id: string;
  roomNumber: string;
  type: RoomType;
  floor: number;
  capacity: number;
  pricePerNight: number;
  status: RoomStatus;
  amenities: string[];
  currentGuestId?: string;
  currentReservationId?: string;
  notes?: string;
}

export interface Guest {
  id: string;
  fullName: string;
  cnicPassport: string;
  phone: string;
  email: string;
  address: string;
  vipStatus: boolean;
  totalVisits: number;
  activeReservationId?: string;
  currentRoomNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  reservationNumber: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  roomId: string;
  roomNumber: string;
  roomType: RoomType;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  pricePerNight: number;
  totalRoomCharges: number;
  advanceDeposit: number;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  actualCheckIn?: string;
  actualCheckOut?: string;
  notes?: string;
  createdAt: string;
}

export interface FolioItem {
  id: string;
  date: string;
  type: 'room_charge' | 'restaurant_order' | 'laundry' | 'room_service' | 'spa' | 'tax' | 'service_fee' | 'other';
  description: string;
  referenceId?: string; // Order # or Receipt #
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  recordedBy: string;
}

export interface HotelBill {
  id: string;
  reservationId: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  roomNumber: string;
  roomType: RoomType;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  items: FolioItem[];
  roomChargesSubtotal: number;
  restaurantChargesSubtotal: number;
  otherChargesSubtotal: number;
  subtotal: number;
  taxes: number;
  discount: number;
  grandTotal: number;
  advancePaid: number;
  balanceDue: number;
  status: 'open' | 'settled' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'online' | 'company_invoice';
  settledAt?: string;
  settledBy?: string;
  notes?: string;
}

export type InventoryTransactionType =
  | 'Stock In'
  | 'STOCK IN'
  | 'Order Consumption'
  | 'SALE_CONSUMPTION'
  | 'CONSUMPTION'
  | 'Waste'
  | 'WASTE'
  | 'Adjustment'
  | 'ADJUSTMENT'
  | 'Return'
  | 'RETURN'
  | 'Transfer'
  | 'TRANSFER';

export interface StockLedgerEntry {
  id: string;
  date: string;
  rawMaterialId: string;
  itemName: string;
  sku: string;
  type: InventoryTransactionType;
  quantity: number;        // in display unit
  unit: UnitType;          // display unit
  baseQtyChange: number;   // delta in base canonical unit (+ or -)
  previousBalance: number; // in display unit
  newBalance: number;      // in display unit
  referenceId: string;     // e.g. "PO-2026-001", "ORD-1042", "WST-004", "ADJ-019"
  user: string;
  notes?: string;
  costImpact?: number;     // Financial value of this movement
}

export type WasteReason =
  | 'expired'
  | 'damaged'
  | 'burned'
  | 'spilled'
  | 'kitchen_waste'
  | 'customer_return'
  | 'other';

export interface WasteRecord {
  id: string;
  recordNumber: string;
  date: string;
  rawMaterialId: string;
  rawMaterialName: string;
  sku: string;
  quantity: number;        // in recorded unit
  unit: UnitType;
  baseQtyDeducted: number; // in base canonical unit
  unitCost: number;        // cost per recorded unit
  totalCostLoss: number;   // calculated loss in Rs.
  reason: WasteReason;
  recordedBy: string;
  notes?: string;
}

export type UserRole =
  | 'admin'
  | 'manager'
  | 'inventory_manager'
  | 'cashier'
  | 'waiter'
  | 'kitchen'
  | 'receptionist';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar: string;
  title: string;
  department: 'Executive' | 'Operations' | 'Inventory & Store' | 'F&B Service' | 'Kitchen' | 'Front Desk';
  permissions: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  module:
    | 'Inventory'
    | 'Purchases'
    | 'Recipes'
    | 'Menu'
    | 'POS Orders'
    | 'Tables'
    | 'Hotel PMS'
    | 'Billing'
    | 'Waste'
    | 'System';
  recordId: string;
  details: string;
  prevValue?: string;
  newValue?: string;
}

export interface SystemSettings {
  businessName: string;
  tagline: string;
  currency: string;
  currencySymbol: string;
  allowNegativeInventory: boolean;
  defaultTaxRate: number;         // e.g. 5 or 16%
  defaultServiceCharge: number;   // e.g. 0%
  enableSoundFx: boolean;
  theme: 'light' | 'dark' | 'system';
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  ntnNumber: string;
  lowStockThresholdNotification: boolean;
}
