import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  RawMaterial,
  Supplier,
  PurchaseInvoice,
  MenuItem,
  Recipe,
  RestaurantOrder,
  RestaurantTable,
  Room,
  Guest,
  Reservation,
  HotelBill,
  FolioItem,
  StockLedgerEntry,
  WasteRecord,
  UserProfile,
  SystemSettings,
  AuditLog,
  OrderStatus,
  TableStatus,
  RoomStatus,
  UnitType,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_SUPPLIERS,
  INITIAL_RAW_MATERIALS,
  INITIAL_RECIPES,
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_ROOMS,
  INITIAL_GUESTS,
  INITIAL_RESERVATIONS,
  INITIAL_HOTEL_BILLS,
  INITIAL_ORDERS,
  INITIAL_PURCHASES,
  INITIAL_STOCK_LEDGER,
  INITIAL_WASTE_RECORDS,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';
import {
  toBaseUnitQuantity,
  fromBaseUnitQuantity,
  smartFormatBaseQuantity,
  formatQuantityWithUnit,
  UNIT_DEFINITIONS,
} from '../utils/unitConverter';
import {
  calculateRecipeCost,
  validateOrderStock,
  calculateOrderDeductions,
  StockValidationResult,
} from '../utils/recipeEngine';

const STORAGE_KEY = 'SHAHI_DIWAN_ERP_V3';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

interface DbContextType {
  // State Entities
  settings: SystemSettings;
  currentUser: UserProfile;
  users: UserProfile[];
  rawMaterials: RawMaterial[];
  suppliers: Supplier[];
  purchases: PurchaseInvoice[];
  recipes: Recipe[];
  menuItems: MenuItem[];
  orders: RestaurantOrder[];
  tables: RestaurantTable[];
  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
  hotelBills: HotelBill[];
  stockLedger: StockLedgerEntry[];
  wasteRecords: WasteRecord[];
  auditLogs: AuditLog[];
  toasts: ToastMessage[];

  // Helper Lookup Maps (Fast O(1) Access)
  rawMaterialsMap: Map<string, RawMaterial>;
  recipesMap: Map<string, Recipe>;
  menuItemsMap: Map<string, MenuItem>;
  suppliersMap: Map<string, Supplier>;
  tablesMap: Map<string, RestaurantTable>;
  roomsMap: Map<string, Room>;
  guestsMap: Map<string, Guest>;
  reservationsMap: Map<string, Reservation>;

  // User & System Actions
  setCurrentUser: (user: UserProfile) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  showToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  resetAllData: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonString: string) => boolean;
  playAudio: (type: 'success' | 'warning' | 'bell' | 'click') => void;

  // Raw Material Actions
  addRawMaterial: (material: Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'totalStockIn'>) => void;
  updateRawMaterial: (id: string, updates: Partial<RawMaterial>) => void;
  adjustStock: (id: string, newDisplayQty: number, reason: string) => void;
  deleteRawMaterial: (id: string) => void;

  // Purchases / Stock In Actions
  createPurchaseInvoice: (invoice: Omit<PurchaseInvoice, 'id' | 'createdAt'>) => void;

  // Recipe Actions
  saveRecipe: (recipeData: Omit<Recipe, 'id' | 'updatedAt' | 'totalFoodCost' | 'grossMarginRs' | 'foodCostPercentage'> & { id?: string }) => Recipe;
  deleteRecipe: (id: string) => void;
  duplicateRecipe: (id: string) => void;

  // Menu Items Actions
  saveMenuItem: (itemData: Omit<MenuItem, 'id'> & { id?: string }) => void;
  toggleMenuItemAvailability: (id: string) => void;
  deleteMenuItem: (id: string) => void;

  // POS / Order Actions
  validateOrderInventory: (items: Array<{ menuItemId: string; quantity: number }>) => StockValidationResult;
  createOrder: (orderData: Omit<RestaurantOrder, 'id' | 'orderNumber' | 'createdAt' | 'inventoryDeducted'>) => RestaurantOrder;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  payOrder: (orderId: string, paymentMethod: RestaurantOrder['paymentMethod'], paidAmount: number) => void;

  // Waste Actions
  recordWaste: (wasteData: Omit<WasteRecord, 'id' | 'recordNumber' | 'baseQtyDeducted' | 'totalCostLoss'>) => void;

  // Table Actions
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  reserveTable: (tableId: string, reservationInfo: RestaurantTable['reservationInfo']) => void;

  // Hotel PMS Actions
  createReservation: (resData: Omit<Reservation, 'id' | 'reservationNumber' | 'createdAt' | 'status'>) => Reservation;
  checkInReservation: (reservationId: string) => void;
  checkOutReservation: (reservationId: string, paymentMethod?: HotelBill['paymentMethod']) => void;
  addFolioCharge: (folioId: string, charge: Omit<FolioItem, 'id' | 'recordedBy'>) => void;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  saveGuest: (guestData: Omit<Guest, 'id' | 'createdAt' | 'totalVisits'> & { id?: string }) => Guest;

  // Suppliers Actions
  saveSupplier: (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'totalPurchases' | 'outstandingBalance'> & { id?: string }) => void;
}

const DbContext = createContext<DbContextType | null>(null);

export const DbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State Loading from LocalStorage or Seed Data
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [users] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);

  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rawMaterials`);
    return saved ? JSON.parse(saved) : INITIAL_RAW_MATERIALS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_suppliers`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_purchases`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_PURCHASES;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_recipes`);
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_menuItems`);
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<RestaurantOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_ORDERS;
  });

  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tables`);
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rooms`);
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [guests, setGuests] = useState<Guest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_guests`);
    return saved ? JSON.parse(saved) : INITIAL_GUESTS;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_reservations`);
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  });

  const [hotelBills, setHotelBills] = useState<HotelBill[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_hotelBills`);
    return saved ? JSON.parse(saved) : INITIAL_HOTEL_BILLS;
  });

  const [stockLedger, setStockLedger] = useState<StockLedgerEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_stockLedger`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_STOCK_LEDGER;
  });

  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_wasteRecords`);
    return saved ? JSON.parse(saved) : INITIAL_WASTE_RECORDS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auditLogs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 2. Persist to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rawMaterials`, JSON.stringify(rawMaterials));
  }, [rawMaterials]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_purchases`, JSON.stringify(purchases));
  }, [purchases]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_recipes`, JSON.stringify(recipes));
  }, [recipes]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_menuItems`, JSON.stringify(menuItems));
  }, [menuItems]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tables`, JSON.stringify(tables));
  }, [tables]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rooms`, JSON.stringify(rooms));
  }, [rooms]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_guests`, JSON.stringify(guests));
  }, [guests]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_reservations`, JSON.stringify(reservations));
  }, [reservations]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_hotelBills`, JSON.stringify(hotelBills));
  }, [hotelBills]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_stockLedger`, JSON.stringify(stockLedger));
  }, [stockLedger]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_wasteRecords`, JSON.stringify(wasteRecords));
  }, [wasteRecords]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Lookup Maps
  const rawMaterialsMap = useMemo(() => new Map(rawMaterials.map((r) => [r.id, r])), [rawMaterials]);
  const recipesMap = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);
  const menuItemsMap = useMemo(() => new Map(menuItems.map((m) => [m.id, m])), [menuItems]);
  const suppliersMap = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);
  const tablesMap = useMemo(() => new Map(tables.map((t) => [t.id, t])), [tables]);
  const roomsMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);
  const guestsMap = useMemo(() => new Map(guests.map((g) => [g.id, g])), [guests]);
  const reservationsMap = useMemo(() => new Map(reservations.map((res) => [res.id, res])), [reservations]);

  // Toast System
  const showToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Web Audio Synth FX
  const playAudio = useCallback((type: 'success' | 'warning' | 'bell' | 'click') => {
    if (!settings.enableSoundFx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'bell') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'warning') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(250, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch {
      // Ignore audio failure
    }
  }, [settings.enableSoundFx]);

  // Logging Helper
  const logAudit = useCallback(
    (action: string, module: AuditLog['module'], recordId: string, details: string, prevValue?: string, newValue?: string) => {
      const entry: AuditLog = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: currentUser.name,
        role: currentUser.role,
        action,
        module,
        recordId,
        details,
        prevValue,
        newValue,
      };
      setAuditLogs((prev) => [entry, ...prev]);
    },
    [currentUser]
  );

  // Update Settings
  const updateSettings = useCallback(
    (newSettings: Partial<SystemSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        return updated;
      });
      showToast('success', 'Settings Saved', 'System configurations have been updated.');
      logAudit('Settings Updated', 'System', 'sys-settings', 'Updated system preferences & parameters.');
    },
    [logAudit, showToast]
  );

  // Reset Data to Initial Seeds
  const resetAllData = useCallback(() => {
    setSettings(INITIAL_SETTINGS);
    setRawMaterials(INITIAL_RAW_MATERIALS);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchases(INITIAL_PURCHASES);
    setRecipes(INITIAL_RECIPES);
    setMenuItems(INITIAL_MENU_ITEMS);
    setOrders(INITIAL_ORDERS);
    setTables(INITIAL_TABLES);
    setRooms(INITIAL_ROOMS);
    setGuests(INITIAL_GUESTS);
    setReservations(INITIAL_RESERVATIONS);
    setHotelBills(INITIAL_HOTEL_BILLS);
    setStockLedger(INITIAL_STOCK_LEDGER);
    setWasteRecords(INITIAL_WASTE_RECORDS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    showToast('info', 'Database Reset', 'System data restored to initial demo state.');
  }, [showToast]);

  // Export JSON
  const exportDatabaseJSON = useCallback(() => {
    const data = {
      settings,
      rawMaterials,
      suppliers,
      purchases,
      recipes,
      menuItems,
      orders,
      tables,
      rooms,
      guests,
      reservations,
      hotelBills,
      stockLedger,
      wasteRecords,
      auditLogs,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }, [
    settings,
    rawMaterials,
    suppliers,
    purchases,
    recipes,
    menuItems,
    orders,
    tables,
    rooms,
    guests,
    reservations,
    hotelBills,
    stockLedger,
    wasteRecords,
    auditLogs,
  ]);

  // Import JSON
  const importDatabaseJSON = useCallback(
    (jsonString: string): boolean => {
      try {
        const data = JSON.parse(jsonString);
        if (data.rawMaterials && data.recipes && data.menuItems) {
          if (data.settings) setSettings(data.settings);
          setRawMaterials(data.rawMaterials);
          if (data.suppliers) setSuppliers(data.suppliers);
          if (data.purchases) setPurchases(data.purchases);
          setRecipes(data.recipes);
          setMenuItems(data.menuItems);
          if (data.orders) setOrders(data.orders);
          if (data.tables) setTables(data.tables);
          if (data.rooms) setRooms(data.rooms);
          if (data.guests) setGuests(data.guests);
          if (data.reservations) setReservations(data.reservations);
          if (data.hotelBills) setHotelBills(data.hotelBills);
          if (data.stockLedger) setStockLedger(data.stockLedger);
          if (data.wasteRecords) setWasteRecords(data.wasteRecords);
          if (data.auditLogs) setAuditLogs(data.auditLogs);
          showToast('success', 'Database Imported', 'All data successfully restored from backup.');
          return true;
        }
        showToast('error', 'Import Failed', 'Invalid JSON backup file structure.');
        return false;
      } catch (e) {
        showToast('error', 'Import Error', 'Failed to parse JSON file.');
        return false;
      }
    },
    [showToast]
  );

  // Recalculate Raw Material Status
  const evaluateStockStatus = (currentQty: number, minStock: number, unit: UnitType): RawMaterial['status'] => {
    const displayQty = fromBaseUnitQuantity(currentQty, unit);
    if (displayQty <= 0) return 'out_of_stock';
    if (displayQty <= minStock) return 'low_stock';
    return 'active';
  };

  // 1. Raw Materials Actions
  const addRawMaterial = useCallback(
    (materialData: Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'totalStockIn'>) => {
      const id = `rm-${Date.now()}`;
      const now = new Date().toISOString();
      const baseQty = toBaseUnitQuantity(materialData.currentQty, materialData.unit);
      const status = evaluateStockStatus(baseQty, materialData.minStockLevel, materialData.unit);

      const newMaterial: RawMaterial = {
        ...materialData,
        id,
        totalStockIn: baseQty,   // initial received quantity
        currentQty: baseQty,
        status,
        createdAt: now,
        updatedAt: now,
      };

      setRawMaterials((prev) => [newMaterial, ...prev]);

      // Stock Ledger initial entry
      const ledgerEntry: StockLedgerEntry = {
        id: `led-${Date.now()}`,
        date: now,
        rawMaterialId: id,
        itemName: newMaterial.name,
        sku: newMaterial.sku,
        type: 'Stock In',
        quantity: materialData.currentQty,
        unit: newMaterial.unit,
        baseQtyChange: baseQty,
        previousBalance: 0,
        newBalance: materialData.currentQty,
        referenceId: `INIT-${newMaterial.sku}`,
        user: currentUser.name,
        notes: 'Initial inventory stock registration',
        costImpact: materialData.currentQty * materialData.purchasePrice,
      };
      setStockLedger((prev) => [ledgerEntry, ...prev]);

      logAudit(
        'Raw Material Created',
        'Inventory',
        id,
        `Created raw material "${newMaterial.name}" with initial stock ${materialData.currentQty} ${newMaterial.unit}.`
      );
      showToast('success', 'Item Added', `"${newMaterial.name}" added to inventory.`);
      playAudio('success');
    },
    [currentUser, logAudit, showToast, playAudio]
  );

  const updateRawMaterial = useCallback(
    (id: string, updates: Partial<RawMaterial>) => {
      setRawMaterials((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
          if (updates.minStockLevel !== undefined || updates.currentQty !== undefined) {
            updated.status = evaluateStockStatus(updated.currentQty, updated.minStockLevel, updated.unit);
          }
          return updated;
        })
      );
      logAudit('Raw Material Updated', 'Inventory', id, `Updated details for raw material ID: ${id}`);
      showToast('success', 'Updated', 'Raw material details updated.');
    },
    [logAudit, showToast]
  );

  const adjustStock = useCallback(
    (id: string, newDisplayQty: number, reason: string) => {
      const material = rawMaterialsMap.get(id);
      if (!material) return;

      const previousDisplayBalance = fromBaseUnitQuantity(material.currentQty, material.unit);
      const newBaseQty = toBaseUnitQuantity(newDisplayQty, material.unit);
      const baseChange = newBaseQty - material.currentQty;
      const displayChange = Math.round((newDisplayQty - previousDisplayBalance) * 1000) / 1000;
      const now = new Date().toISOString();
      const status = evaluateStockStatus(newBaseQty, material.minStockLevel, material.unit);

      setRawMaterials((prev) =>
        prev.map((item) => (item.id === id ? { ...item, currentQty: newBaseQty, status, updatedAt: now } : item))
      );

      const ledgerEntry: StockLedgerEntry = {
        id: `led-${Date.now()}`,
        date: now,
        rawMaterialId: id,
        itemName: material.name,
        sku: material.sku,
        type: 'Adjustment',
        quantity: Math.abs(displayChange),
        unit: material.unit,
        baseQtyChange: baseChange,
        previousBalance: previousDisplayBalance,
        newBalance: newDisplayQty,
        referenceId: `ADJ-${Date.now().toString().slice(-6)}`,
        user: `${currentUser.name} (${currentUser.title})`,
        notes: reason || 'Manual inventory stock count adjustment',
        costImpact: displayChange * material.purchasePrice,
      };

      setStockLedger((prev) => [ledgerEntry, ...prev]);
      logAudit(
        'Inventory Stock Adjusted',
        'Inventory',
        id,
        `Adjusted ${material.name} from ${previousDisplayBalance} ${material.unit} to ${newDisplayQty} ${material.unit}. Reason: ${reason}`,
        `${previousDisplayBalance} ${material.unit}`,
        `${newDisplayQty} ${material.unit}`
      );
      showToast(
        'info',
        'Stock Adjusted',
        `${material.name} stock updated to ${newDisplayQty} ${material.unit}. Ledger record created.`
      );
      playAudio('success');
    },
    [rawMaterialsMap, currentUser, logAudit, showToast, playAudio]
  );

  const deleteRawMaterial = useCallback(
    (id: string) => {
      const material = rawMaterialsMap.get(id);
      if (!material) return;
      setRawMaterials((prev) => prev.filter((m) => m.id !== id));
      logAudit('Raw Material Deleted', 'Inventory', id, `Deleted raw material "${material.name}" (${material.sku}).`);
      showToast('warning', 'Item Deleted', `"${material.name}" has been removed from inventory.`);
    },
    [rawMaterialsMap, logAudit, showToast]
  );

  // 2. Stock In / Purchases Actions
  const createPurchaseInvoice = useCallback(
    (invoiceData: Omit<PurchaseInvoice, 'id' | 'createdAt'>) => {
      const id = `po-${Date.now()}`;
      const now = new Date().toISOString();
      const invoiceNumber = invoiceData.invoiceNumber || `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

      const newInvoice: PurchaseInvoice = {
        ...invoiceData,
        id,
        invoiceNumber,
        createdAt: now,
      };

      const ledgerEntries: StockLedgerEntry[] = [];

      // Update each raw material
      setRawMaterials((prev) =>
        prev.map((material) => {
          const purchasedItem = invoiceData.items.find((i) => i.rawMaterialId === material.id);
          if (!purchasedItem) return material;

          const purchasedBaseQty = toBaseUnitQuantity(purchasedItem.quantity, purchasedItem.unit);
          const previousDisplayBal = fromBaseUnitQuantity(material.currentQty, material.unit);
          const newBaseQty = material.currentQty + purchasedBaseQty;
          const newDisplayBal = fromBaseUnitQuantity(newBaseQty, material.unit);
          const newStatus = evaluateStockStatus(newBaseQty, material.minStockLevel, material.unit);

          // Build ledger entry
          ledgerEntries.push({
            id: `led-${Date.now()}-${material.id}`,
            date: now,
            rawMaterialId: material.id,
            itemName: material.name,
            sku: material.sku,
            type: 'Stock In',
            quantity: purchasedItem.quantity,
            unit: purchasedItem.unit,
            baseQtyChange: purchasedBaseQty,
            previousBalance: previousDisplayBal,
            newBalance: newDisplayBal,
            referenceId: invoiceNumber,
            user: `${currentUser.name} (Stock Receiving)`,
            notes: `Purchase from ${invoiceData.supplierName}. Batch: ${purchasedItem.batchNumber || 'N/A'}. Unit Cost: Rs. ${purchasedItem.unitCost}`,
            costImpact: purchasedItem.totalCost,
          });

          return {
            ...material,
            totalStockIn: (material.totalStockIn ?? 0) + purchasedBaseQty,  // cumulative received
            currentQty: newBaseQty,
            purchasePrice: purchasedItem.unitCost, // Update latest purchase cost
            batchNumber: purchasedItem.batchNumber || material.batchNumber,
            expiryDate: purchasedItem.expiryDate || material.expiryDate,
            status: newStatus,
            updatedAt: now,
          };
        })
      );

      // Append ledger entries
      setStockLedger((prev) => [...ledgerEntries, ...prev]);

      // Add invoice
      setPurchases((prev) => [newInvoice, ...prev]);

      // Update Supplier balance & total purchases
      setSuppliers((prev) =>
        prev.map((sup) => {
          if (sup.id !== invoiceData.supplierId) return sup;
          const unpaid = invoiceData.grandTotal - invoiceData.paidAmount;
          return {
            ...sup,
            totalPurchases: sup.totalPurchases + invoiceData.grandTotal,
            outstandingBalance: sup.outstandingBalance + unpaid,
          };
        })
      );

      logAudit(
        'Stock In / Purchase Received',
        'Purchases',
        invoiceNumber,
        `Received purchase invoice ${invoiceNumber} from ${invoiceData.supplierName}. Total: Rs. ${invoiceData.grandTotal}. ${invoiceData.items.length} items stocked in.`
      );
      showToast('success', 'Stock Received', `Invoice ${invoiceNumber} successfully received & inventory updated.`);
      playAudio('success');
    },
    [currentUser, logAudit, showToast, playAudio]
  );

  // 3. Recipes Actions
  const saveRecipe = useCallback(
    (recipeData: Omit<Recipe, 'id' | 'updatedAt' | 'totalFoodCost' | 'grossMarginRs' | 'foodCostPercentage'> & { id?: string }): Recipe => {
      const id = recipeData.id || `rec-${Date.now()}`;
      const now = new Date().toISOString();

      // Dynamic food cost calculation using latest raw materials prices and yield
      const yieldServings = recipeData.yieldServings || 1;
      const costBreakdown = calculateRecipeCost(
        recipeData.ingredients,
        rawMaterialsMap,
        recipeData.sellingPrice,
        yieldServings
      );

      const ingredientsWithCalculations = costBreakdown.ingredients.map((c) => ({
        rawMaterialId: c.rawMaterialId,
        rawMaterialName: c.rawMaterialName,
        quantity: c.quantity,
        unit: c.unit,
        baseUnitQty: c.baseUnitQty,
        calculatedCost: c.totalCost,
      }));

      const savedRecipe: Recipe = {
        ...recipeData,
        id,
        menuItemId: recipeData.menuItemId,
        menuItemName: recipeData.menuItemName,
        code: recipeData.code || `BOM-${Date.now().toString().slice(-4)}`,
        category: recipeData.category,
        portionSize: recipeData.portionSize || 'Single',
        version: recipeData.version || 1,
        yieldServings,
        outputQuantity: recipeData.outputQuantity || 1,
        outputUnit: recipeData.outputUnit || 'Portion',
        preparationTime: recipeData.preparationTime || 15,
        ingredients: ingredientsWithCalculations,
        totalFoodCost: costBreakdown.totalFoodCost,
        sellingPrice: recipeData.sellingPrice,
        grossMarginRs: costBreakdown.grossMarginRs,
        foodCostPercentage: costBreakdown.foodCostPercentage,
        profitMarginPercentage: costBreakdown.grossMarginPercentage,
        notes: recipeData.notes,
        description: recipeData.description,
        preparationInstructions: recipeData.preparationInstructions,
        isActive: recipeData.isActive ?? true,
        updatedAt: now,
      };

      setRecipes((prev) => {
        const index = prev.findIndex((r) => r.id === id);
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = savedRecipe;
          return copy;
        }
        return [savedRecipe, ...prev];
      });

      // Update linked menu item food cost & margin (per serving)
      if (recipeData.menuItemId) {
        setMenuItems((prev) =>
          prev.map((item) =>
            item.id === recipeData.menuItemId
              ? {
                  ...item,
                  recipeId: id,
                  sellingPrice: recipeData.sellingPrice || item.sellingPrice,
                  foodCost: costBreakdown.foodCostPerServing,
                  grossMargin: costBreakdown.grossMarginRs,
                  foodCostPercentage: costBreakdown.foodCostPercentage,
                  isAvailable: true,
                  status: 'active',
                }
              : item
          )
        );
      }

      logAudit(
        'Recipe Saved / Updated',
        'Recipes',
        id,
        `Recipe for "${recipeData.menuItemName}" saved. Food Cost: Rs. ${costBreakdown.totalFoodCost} (${costBreakdown.foodCostPercentage}%).`
      );
      showToast('success', 'Recipe Saved', `BOM Recipe for "${recipeData.menuItemName}" updated.`);
      return savedRecipe;
    },
    [rawMaterialsMap, logAudit, showToast]
  );

  const deleteRecipe = useCallback(
    (id: string) => {
      const rec = recipesMap.get(id);
      if (!rec) return;
      setRecipes((prev) => prev.filter((r) => r.id !== id));
      // Unlink from menu item and deactivate it
      setMenuItems((prev) =>
        prev.map((m) =>
          m.recipeId === id
            ? { ...m, recipeId: undefined, isAvailable: false, status: 'unavailable' }
            : m
        )
      );
      logAudit('Recipe Deleted', 'Recipes', id, `Deleted recipe for "${rec.menuItemName}".`);
      showToast('warning', 'Recipe Removed', `Recipe for "${rec.menuItemName}" removed.`);
    },
    [recipesMap, logAudit, showToast]
  );

  const duplicateRecipe = useCallback(
    (id: string) => {
      const source = recipesMap.get(id);
      if (!source) return;
      const newId = `rec-${Date.now()}`;
      const cloned: Recipe = {
        ...source,
        id: newId,
        menuItemName: `${source.menuItemName} (Copy)`,
        version: source.version + 1,
        updatedAt: new Date().toISOString(),
      };
      setRecipes((prev) => [cloned, ...prev]);
      showToast('success', 'Recipe Duplicated', `Created duplicate recipe for ${cloned.menuItemName}.`);
    },
    [recipesMap, showToast]
  );

  // 4. Menu Items Actions
  const saveMenuItem = useCallback(
    (itemData: Omit<MenuItem, 'id'> & { id?: string }) => {
      const id = itemData.id || `menu-${Date.now()}`;
      let foodCost = itemData.foodCost;
      let grossMargin = itemData.grossMargin;
      let foodCostPercentage = itemData.foodCostPercentage;

      // Link recipe cost if recipe exists
      if (itemData.recipeId && recipesMap.has(itemData.recipeId)) {
        const recipe = recipesMap.get(itemData.recipeId)!;
        foodCost = recipe.totalFoodCost;
        grossMargin = itemData.sellingPrice - recipe.totalFoodCost;
        foodCostPercentage =
          itemData.sellingPrice > 0 ? Math.round((foodCost / itemData.sellingPrice) * 1000) / 10 : 0;
      }

      const item: MenuItem = {
        ...itemData,
        id,
        foodCost,
        grossMargin,
        foodCostPercentage,
      };

      setMenuItems((prev) => {
        const index = prev.findIndex((m) => m.id === id);
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = item;
          return copy;
        }
        return [item, ...prev];
      });

      logAudit('Menu Item Saved', 'Menu', id, `Saved dish "${item.name}" at Rs. ${item.sellingPrice}.`);
      showToast('success', 'Menu Item Saved', `"${item.name}" saved to restaurant menu.`);
    },
    [recipesMap, logAudit, showToast]
  );

  const toggleMenuItemAvailability = useCallback(
    (id: string) => {
      setMenuItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const nextVal = !item.isAvailable;
          logAudit(
            'Menu Availability Changed',
            'Menu',
            id,
            `Toggled "${item.name}" availability to ${nextVal ? 'Available' : 'Unavailable'}.`
          );
          return { ...item, isAvailable: nextVal, status: nextVal ? 'active' : 'unavailable' };
        })
      );
    },
    [logAudit]
  );

  const deleteMenuItem = useCallback(
    (id: string) => {
      const item = menuItemsMap.get(id);
      if (!item) return;
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
      logAudit('Menu Item Deleted', 'Menu', id, `Deleted menu item "${item.name}".`);
      showToast('warning', 'Menu Item Deleted', `"${item.name}" removed from menu.`);
    },
    [menuItemsMap, logAudit, showToast]
  );

  // 5. POS Stock Validation
  const validateOrderInventory = useCallback(
    (items: Array<{ menuItemId: string; quantity: number }>): StockValidationResult => {
      return validateOrderStock(items, menuItemsMap, recipesMap, rawMaterialsMap);
    },
    [menuItemsMap, recipesMap, rawMaterialsMap]
  );

  // 6. POS Order Creation & Lifecycle
  const createOrder = useCallback(
    (orderData: Omit<RestaurantOrder, 'id' | 'orderNumber' | 'createdAt' | 'inventoryDeducted'>): RestaurantOrder => {
      const id = `ord-${Date.now()}`;
      const now = new Date().toISOString();
      const orderNumber = `ORD-${Date.now().toString().slice(-4)}`;

      // 1. Stock Validation Check
      if (!settings.allowNegativeInventory) {
        const validation = validateOrderStock(
          orderData.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
          menuItemsMap,
          recipesMap,
          rawMaterialsMap
        );

        if (!validation.isValid) {
          const firstMissing = validation.insufficientItems[0];
          const errorMsg = `Insufficient stock: ${firstMissing.rawMaterialName}. Required: ${firstMissing.requiredFormatted}, Available: ${firstMissing.availableFormatted}.`;
          showToast('error', 'Stock Shortage', errorMsg);
          playAudio('warning');
          throw new Error(errorMsg);
        }
      }

      // Attach recipe snapshots to order items
      const enrichedItems = orderData.items.map((item) => {
        const menuItem = menuItemsMap.get(item.menuItemId);
        return {
          ...item,
          recipeId: item.recipeId || menuItem?.recipeId,
        };
      });

      // Perform automatic recipe stock deduction if order is confirmed upon creation
      let inventoryDeducted = false;
      const ledgerEntries: StockLedgerEntry[] = [];

      if (orderData.status === 'confirmed' || (orderData as any).status === 'completed') {
        const deductions = calculateOrderDeductions(enrichedItems as any, menuItemsMap, recipesMap, rawMaterialsMap);

        if (deductions.length > 0) {
          setRawMaterials((prev) =>
            prev.map((material) => {
              const deduction = deductions.find((d) => d.rawMaterialId === material.id);
              if (!deduction) return material;

              const previousDisplayBal = fromBaseUnitQuantity(material.currentQty, material.unit);
              const newBaseQty = Math.max(0, material.currentQty - deduction.baseQtyToDeduct);
              const newDisplayBal = fromBaseUnitQuantity(newBaseQty, material.unit);
              const newStatus = evaluateStockStatus(newBaseQty, material.minStockLevel, material.unit);

              ledgerEntries.push({
                id: `led-${Date.now()}-${material.id}`,
                date: now,
                rawMaterialId: material.id,
                itemName: material.name,
                sku: material.sku,
                type: 'CONSUMPTION',
                quantity: deduction.displayQtyToDeduct,
                unit: material.unit,
                baseQtyChange: -deduction.baseQtyToDeduct,
                previousBalance: previousDisplayBal,
                newBalance: newDisplayBal,
                referenceId: orderNumber,
                user: `${currentUser.name} (POS Checkout)`,
                notes: `POS Order #${orderNumber} confirmed. Auto-deducted ${formatQuantityWithUnit(deduction.displayQtyToDeduct, material.unit)} for items: ${enrichedItems.map((i) => `${i.name} (x${i.quantity})`).join(', ')}.`,
                costImpact: deduction.totalCost,
              });

              return {
                ...material,
                currentQty: newBaseQty,
                status: newStatus,
                updatedAt: now,
              };
            })
          );

          if (ledgerEntries.length > 0) {
            setStockLedger((prev) => [...ledgerEntries, ...prev]);
          }
          inventoryDeducted = true;
        }
      }

      const newOrder: RestaurantOrder = {
        ...orderData,
        id,
        orderNumber,
        items: enrichedItems,
        createdAt: now,
        confirmedAt: now,
        inventoryDeducted,
      };

      setOrders((prev) => [newOrder, ...prev]);

      // If dine-in, update table status & active order
      if (orderData.orderType === 'dine_in' && orderData.tableId) {
        setTables((prev) =>
          prev.map((tbl) =>
            tbl.id === orderData.tableId
              ? {
                  ...tbl,
                  status: 'occupied',
                  currentOrderId: id,
                  currentOrderTotal: orderData.grandTotal,
                  occupiedSince: now,
                }
              : tbl
          )
        );
      }

      // If charged to hotel room, post directly to guest room folio
      if (orderData.orderType === 'room_service' && orderData.roomNumber && orderData.paymentMethod === 'room_charge') {
        const activeBill = hotelBills.find((b) => b.roomNumber === orderData.roomNumber && b.status === 'open');
        if (activeBill) {
          const folioItem: FolioItem = {
            id: `fol-${Date.now()}`,
            date: now,
            type: 'restaurant_order',
            description: `Dining Order #${orderNumber} (${enrichedItems.map((i) => `${i.quantity}x ${i.name}`).join(', ')})`,
            referenceId: orderNumber,
            quantity: 1,
            unitPrice: orderData.grandTotal,
            totalAmount: orderData.grandTotal,
            recordedBy: `${currentUser.name} (POS Cashier)`,
          };

          setHotelBills((prev) =>
            prev.map((bill) => {
              if (bill.id !== activeBill.id) return bill;
              const updatedItems = [...bill.items, folioItem];
              const restSubtotal = bill.restaurantChargesSubtotal + orderData.grandTotal;
              const subtotal = bill.roomChargesSubtotal + restSubtotal + bill.otherChargesSubtotal;
              const taxes = Math.round(subtotal * (settings.defaultTaxRate / 100) * 10) / 10;
              const grandTotal = subtotal + taxes - bill.discount;
              const balanceDue = grandTotal - bill.advancePaid;

              return {
                ...bill,
                items: updatedItems,
                restaurantChargesSubtotal: restSubtotal,
                subtotal,
                taxes,
                grandTotal,
                balanceDue,
              };
            })
          );
          newOrder.roomChargeFolioId = activeBill.id;
          showToast(
            'info',
            'Charged to Room',
            `Order #${orderNumber} (Rs. ${orderData.grandTotal}) posted to Room ${orderData.roomNumber} folio.`
          );
        }
      }

      logAudit(
        'Restaurant Order Created',
        'POS Orders',
        orderNumber,
        `Created ${orderData.orderType} order #${orderNumber} with ${orderData.items.length} items. Total: Rs. ${orderData.grandTotal}.`
      );
      showToast('success', 'Order Placed', `Order #${orderNumber} confirmed.`);
      playAudio('bell');
      return newOrder;
    },
    [
      settings.allowNegativeInventory,
      settings.defaultTaxRate,
      menuItemsMap,
      recipesMap,
      rawMaterialsMap,
      hotelBills,
      currentUser,
      logAudit,
      showToast,
      playAudio,
    ]
  );

  // Status Lifecycle & Automatic Ingredient Deduction
  const updateOrderStatus = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      const now = new Date().toISOString();
      const prevStatus = order.status;

      // 1. If transitioning to 'completed' and inventory not yet deducted -> DEDUCT RECIPE INGREDIENTS!
      if (newStatus === 'completed' && !order.inventoryDeducted) {
        // Low Stock Validation Check
        if (!settings.allowNegativeInventory) {
          const validation = validateOrderStock(
            order.items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
            menuItemsMap,
            recipesMap,
            rawMaterialsMap
          );

          if (!validation.isValid) {
            const firstMissing = validation.insufficientItems[0];
            const errorMsg = `Insufficient stock for ${firstMissing.rawMaterialName}. Required: ${firstMissing.requiredFormatted}, Available: ${firstMissing.availableFormatted}.`;
            showToast('error', 'Stock Shortage', errorMsg);
            playAudio('warning');
            alert(errorMsg);
            return;
          }
        }

        const deductions = calculateOrderDeductions(order.items, menuItemsMap, recipesMap, rawMaterialsMap);
        const ledgerEntries: StockLedgerEntry[] = [];

        // Deduct raw material stock
        setRawMaterials((prev) =>
          prev.map((material) => {
            const deduction = deductions.find((d) => d.rawMaterialId === material.id);
            if (!deduction) return material;

            const previousDisplayBal = fromBaseUnitQuantity(material.currentQty, material.unit);
            const newBaseQty = material.currentQty - deduction.baseQtyToDeduct;
            const newDisplayBal = fromBaseUnitQuantity(newBaseQty, material.unit);
            const newStatusStatus = evaluateStockStatus(newBaseQty, material.minStockLevel, material.unit);

            ledgerEntries.push({
              id: `led-${Date.now()}-${material.id}`,
              date: now,
              rawMaterialId: material.id,
              itemName: material.name,
              sku: material.sku,
              type: 'SALE_CONSUMPTION',
              quantity: deduction.displayQtyToDeduct,
              unit: material.unit,
              baseQtyChange: -deduction.baseQtyToDeduct,
              previousBalance: previousDisplayBal,
              newBalance: newDisplayBal,
              referenceId: order.orderNumber,
              user: 'POS Engine (Recipe Consumption)',
              notes: `Order #${order.orderNumber} completed. Auto-deducted ${formatQuantityWithUnit(deduction.displayQtyToDeduct, material.unit)} for dishes: ${order.items.map(i => `${i.name} (Qty: ${i.quantity})`).join(', ')}.`,
              costImpact: deduction.totalCost,
            });

            return {
              ...material,
              currentQty: newBaseQty,
              status: newStatusStatus,
              updatedAt: now,
            };
          })
        );

        setStockLedger((prev) => [...ledgerEntries, ...prev]);

        // Release Table if Dine In
        if (order.tableId) {
          setTables((prev) =>
            prev.map((tbl) =>
              tbl.id === order.tableId
                ? { ...tbl, status: 'cleaning', currentOrderId: undefined, currentOrderTotal: undefined }
                : tbl
            )
          );
        }

        showToast(
          'success',
          'Order Completed',
          `Order #${order.orderNumber} completed. ${deductions.length} recipe ingredients auto-deducted from inventory.`
        );
        playAudio('success');
      }

      // 2. If transitioning from 'completed' to 'cancelled' and inventory was deducted -> REFUND STOCK!
      if (newStatus === 'cancelled' && order.inventoryDeducted) {
        const deductions = calculateOrderDeductions(order.items, menuItemsMap, recipesMap, rawMaterialsMap);
        const ledgerEntries: StockLedgerEntry[] = [];

        setRawMaterials((prev) =>
          prev.map((material) => {
            const deduction = deductions.find((d) => d.rawMaterialId === material.id);
            if (!deduction) return material;

            const previousDisplayBal = fromBaseUnitQuantity(material.currentQty, material.unit);
            const newBaseQty = material.currentQty + deduction.baseQtyToDeduct;
            const newDisplayBal = fromBaseUnitQuantity(newBaseQty, material.unit);
            const newStatusStatus = evaluateStockStatus(newBaseQty, material.minStockLevel, material.unit);

            ledgerEntries.push({
              id: `led-${Date.now()}-${material.id}`,
              date: now,
              rawMaterialId: material.id,
              itemName: material.name,
              sku: material.sku,
              type: 'Return',
              quantity: deduction.displayQtyToDeduct,
              unit: material.unit,
              baseQtyChange: deduction.baseQtyToDeduct,
              previousBalance: previousDisplayBal,
              newBalance: newDisplayBal,
              referenceId: order.orderNumber,
              user: 'POS Engine (Order Refund/Cancellation)',
              notes: `Refund for Order #${order.orderNumber} cancelled. Restored ${formatQuantityWithUnit(deduction.displayQtyToDeduct, material.unit)} for dishes: ${order.items.map(i => `${i.name} (Qty: ${i.quantity})`).join(', ')}.`,
              costImpact: -deduction.totalCost,
            });

            return {
              ...material,
              currentQty: newBaseQty,
              status: newStatusStatus,
              updatedAt: now,
            };
          })
        );

        setStockLedger((prev) => [...ledgerEntries, ...prev]);

        showToast(
          'info',
          'Order Cancelled & Refunded',
          `Order #${order.orderNumber} cancelled. Stock successfully returned to inventory.`
        );
      }

      // Update Order Status
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            status: newStatus,
            completedAt: newStatus === 'completed' ? now : o.completedAt,
            cancelledAt: newStatus === 'cancelled' ? now : o.cancelledAt,
            inventoryDeducted: newStatus === 'completed' ? true : (newStatus === 'cancelled' ? false : o.inventoryDeducted),
          };
        })
      );

      logAudit(
        'Order Status Changed',
        'POS Orders',
        order.orderNumber,
        `Order #${order.orderNumber} status changed from ${prevStatus} to ${newStatus}.`,
        prevStatus,
        newStatus
      );
    },
    [orders, menuItemsMap, recipesMap, rawMaterialsMap, settings, logAudit, showToast, playAudio]
  );

  const payOrder = useCallback(
    (orderId: string, paymentMethod: RestaurantOrder['paymentMethod'], paidAmount: number) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            paymentStatus: 'paid',
            paymentMethod,
            paidAmount,
          };
        })
      );

      // Auto-advance to completed if paid
      if (order.status !== 'completed') {
        updateOrderStatus(orderId, 'completed');
      }

      logAudit(
        'Order Payment Received',
        'POS Orders',
        order.orderNumber,
        `Payment received for Order #${order.orderNumber}: Rs. ${paidAmount} via ${paymentMethod.toUpperCase()}.`
      );
      showToast('success', 'Payment Received', `Order #${order.orderNumber} marked as Paid.`);
    },
    [orders, updateOrderStatus, logAudit, showToast]
  );

  // 7. Waste Management
  const recordWaste = useCallback(
    (wasteData: Omit<WasteRecord, 'id' | 'recordNumber' | 'baseQtyDeducted' | 'totalCostLoss'>) => {
      const material = rawMaterialsMap.get(wasteData.rawMaterialId);
      if (!material) return;

      const id = `wst-${Date.now()}`;
      const recordNumber = `WST-${Date.now().toString().slice(-4)}`;
      const now = new Date().toISOString();
      const baseQtyToDeduct = toBaseUnitQuantity(wasteData.quantity, wasteData.unit);
      const previousDisplayBal = fromBaseUnitQuantity(material.currentQty, material.unit);
      const newBaseQty = Math.max(0, material.currentQty - baseQtyToDeduct);
      const newDisplayBal = fromBaseUnitQuantity(newBaseQty, material.unit);
      const totalCostLoss = Math.round(wasteData.quantity * wasteData.unitCost * 100) / 100;
      const status = evaluateStockStatus(newBaseQty, material.minStockLevel, material.unit);

      const wasteEntry: WasteRecord = {
        ...wasteData,
        id,
        recordNumber,
        baseQtyDeducted: baseQtyToDeduct,
        totalCostLoss,
      };

      setWasteRecords((prev) => [wasteEntry, ...prev]);

      // Deduct from raw material stock
      setRawMaterials((prev) =>
        prev.map((item) => (item.id === material.id ? { ...item, currentQty: newBaseQty, status, updatedAt: now } : item))
      );

      // Create Waste Ledger Entry
      const ledgerEntry: StockLedgerEntry = {
        id: `led-${Date.now()}`,
        date: now,
        rawMaterialId: material.id,
        itemName: material.name,
        sku: material.sku,
        type: 'Waste',
        quantity: wasteData.quantity,
        unit: wasteData.unit,
        baseQtyChange: -baseQtyToDeduct,
        previousBalance: previousDisplayBal,
        newBalance: newDisplayBal,
        referenceId: recordNumber,
        user: `${currentUser.name} (${wasteData.recordedBy})`,
        notes: `Waste logged (${wasteData.reason.toUpperCase()}). ${wasteData.notes || ''}`,
        costImpact: totalCostLoss,
      };

      setStockLedger((prev) => [ledgerEntry, ...prev]);
      logAudit(
        'Waste Recorded',
        'Waste',
        recordNumber,
        `Logged waste of ${wasteData.quantity} ${wasteData.unit} ${material.name}. Financial loss: Rs. ${totalCostLoss}. Reason: ${wasteData.reason}.`
      );
      showToast(
        'warning',
        'Waste Logged',
        `Deducted ${wasteData.quantity} ${wasteData.unit} ${material.name} for waste (Rs. ${totalCostLoss} loss).`
      );
    },
    [rawMaterialsMap, currentUser, logAudit, showToast]
  );

  // 8. Restaurant Table Actions
  const updateTableStatus = useCallback(
    (tableId: string, status: TableStatus) => {
      setTables((prev) =>
        prev.map((tbl) =>
          tbl.id === tableId
            ? {
                ...tbl,
                status,
                currentOrderId: status === 'available' ? undefined : tbl.currentOrderId,
                currentOrderTotal: status === 'available' ? undefined : tbl.currentOrderTotal,
                occupiedSince: status === 'occupied' ? tbl.occupiedSince || new Date().toISOString() : undefined,
              }
            : tbl
        )
      );
      showToast('info', 'Table Status Updated', `Table status set to ${status.toUpperCase()}.`);
    },
    [showToast]
  );

  const reserveTable = useCallback(
    (tableId: string, reservationInfo: RestaurantTable['reservationInfo']) => {
      setTables((prev) =>
        prev.map((tbl) => (tbl.id === tableId ? { ...tbl, status: 'reserved', reservationInfo } : tbl))
      );
      showToast('success', 'Table Reserved', `Table marked as Reserved.`);
    },
    [showToast]
  );

  // 9. Hotel PMS Actions
  const createReservation = useCallback(
    (resData: Omit<Reservation, 'id' | 'reservationNumber' | 'createdAt' | 'status'>): Reservation => {
      const id = `res-${Date.now()}`;
      const reservationNumber = `RES-2026-${Date.now().toString().slice(-3)}`;
      const now = new Date().toISOString();

      const newReservation: Reservation = {
        ...resData,
        id,
        reservationNumber,
        status: 'confirmed',
        createdAt: now,
      };

      setReservations((prev) => [newReservation, ...prev]);

      // Set Room to reserved
      setRooms((prev) =>
        prev.map((rm) => (rm.id === resData.roomId ? { ...rm, status: 'reserved', currentReservationId: id } : rm))
      );

      // Create initial Guest record if new
      setGuests((prev) => {
        const existing = prev.find((g) => g.id === resData.guestId || g.phone === resData.guestPhone);
        if (existing) {
          return prev.map((g) => (g.id === existing.id ? { ...g, activeReservationId: id, totalVisits: g.totalVisits + 1 } : g));
        }
        const newGuest: Guest = {
          id: resData.guestId || `gst-${Date.now()}`,
          fullName: resData.guestName,
          phone: resData.guestPhone,
          email: resData.guestEmail || '',
          cnicPassport: 'CNIC-Pending',
          address: 'Islamabad, PK',
          vipStatus: false,
          totalVisits: 1,
          activeReservationId: id,
          currentRoomNumber: resData.roomNumber,
          createdAt: now,
        };
        return [newGuest, ...prev];
      });

      logAudit(
        'Hotel Reservation Created',
        'Hotel PMS',
        reservationNumber,
        `Created booking ${reservationNumber} for ${resData.guestName} in Room ${resData.roomNumber} (${resData.nights} nights).`
      );
      showToast('success', 'Booking Confirmed', `Reservation ${reservationNumber} created for ${resData.guestName}.`);
      return newReservation;
    },
    [logAudit, showToast]
  );

  const checkInReservation = useCallback(
    (reservationId: string) => {
      const res = reservations.find((r) => r.id === reservationId);
      if (!res) return;

      const now = new Date().toISOString();

      // 1. Update reservation
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: 'checked_in', actualCheckIn: now } : r))
      );

      // 2. Update room status to occupied
      setRooms((prev) =>
        prev.map((rm) =>
          rm.id === res.roomId
            ? { ...rm, status: 'occupied', currentGuestId: res.guestId, currentReservationId: reservationId }
            : rm
        )
      );

      // 3. Create initial Hotel Folio Bill
      const billId = `bill-${Date.now()}`;
      const roomCharges = res.totalRoomCharges;
      const taxes = Math.round(roomCharges * (settings.defaultTaxRate / 100) * 10) / 10;
      const grandTotal = roomCharges + taxes;
      const balanceDue = grandTotal - res.advanceDeposit;

      const initialBill: HotelBill = {
        id: billId,
        reservationId,
        guestId: res.guestId,
        guestName: res.guestName,
        guestPhone: res.guestPhone,
        roomNumber: res.roomNumber,
        roomType: res.roomType,
        checkInDate: res.checkInDate,
        checkOutDate: res.checkOutDate,
        nights: res.nights,
        items: [
          {
            id: `fol-${Date.now()}`,
            date: now,
            type: 'room_charge',
            description: `Room Accommodation (${res.nights} nights @ Rs. ${res.pricePerNight.toLocaleString()}/night)`,
            quantity: res.nights,
            unitPrice: res.pricePerNight,
            totalAmount: roomCharges,
            recordedBy: `${currentUser.name} (Front Desk)`,
          },
        ],
        roomChargesSubtotal: roomCharges,
        restaurantChargesSubtotal: 0,
        otherChargesSubtotal: 0,
        subtotal: roomCharges,
        taxes,
        discount: 0,
        grandTotal,
        advancePaid: res.advanceDeposit,
        balanceDue,
        status: 'open',
        notes: 'Master Hotel Folio created on check-in.',
      };

      setHotelBills((prev) => [initialBill, ...prev]);

      logAudit(
        'Guest Checked In',
        'Hotel PMS',
        res.reservationNumber,
        `Guest ${res.guestName} checked in to Room ${res.roomNumber}. Folio bill created.`
      );
      showToast('success', 'Guest Checked In', `${res.guestName} is now checked in to Room ${res.roomNumber}.`);
      playAudio('success');
    },
    [reservations, settings.defaultTaxRate, currentUser, logAudit, showToast, playAudio]
  );

  const checkOutReservation = useCallback(
    (reservationId: string, paymentMethod: HotelBill['paymentMethod'] = 'cash') => {
      const res = reservations.find((r) => r.id === reservationId);
      if (!res) return;

      const now = new Date().toISOString();

      // 1. Update reservation
      setReservations((prev) =>
        prev.map((r) => (r.id === reservationId ? { ...r, status: 'checked_out', actualCheckOut: now } : r))
      );

      // 2. Set room to cleaning
      setRooms((prev) =>
        prev.map((rm) =>
          rm.id === res.roomId
            ? { ...rm, status: 'cleaning', currentGuestId: undefined, currentReservationId: undefined }
            : rm
        )
      );

      // 3. Settle open hotel bill
      setHotelBills((prev) =>
        prev.map((bill) => {
          if (bill.reservationId !== reservationId) return bill;
          return {
            ...bill,
            status: 'settled',
            paymentMethod,
            settledAt: now,
            settledBy: currentUser.name,
            balanceDue: 0,
          };
        })
      );

      logAudit(
        'Guest Checked Out & Bill Settled',
        'Hotel PMS',
        res.reservationNumber,
        `Settled final folio for guest ${res.guestName}. Room ${res.roomNumber} vacated and sent for housekeeping cleaning.`
      );
      showToast('success', 'Checkout Complete', `Folio settled & guest checked out. Room ${res.roomNumber} set to cleaning.`);
      playAudio('success');
    },
    [reservations, currentUser, logAudit, showToast, playAudio]
  );

  const addFolioCharge = useCallback(
    (folioId: string, charge: Omit<FolioItem, 'id' | 'recordedBy'>) => {
      const now = new Date().toISOString();
      const newItem: FolioItem = {
        ...charge,
        id: `fol-${Date.now()}`,
        recordedBy: currentUser.name,
      };

      setHotelBills((prev) =>
        prev.map((bill) => {
          if (bill.id !== folioId) return bill;
          const items = [...bill.items, newItem];
          let restSub = bill.restaurantChargesSubtotal;
          let otherSub = bill.otherChargesSubtotal;

          if (charge.type === 'restaurant_order' || charge.type === 'room_service') {
            restSub += charge.totalAmount;
          } else {
            otherSub += charge.totalAmount;
          }

          const subtotal = bill.roomChargesSubtotal + restSub + otherSub;
          const taxes = Math.round(subtotal * (settings.defaultTaxRate / 100) * 10) / 10;
          const grandTotal = subtotal + taxes - bill.discount;
          const balanceDue = grandTotal - bill.advancePaid;

          return {
            ...bill,
            items,
            restaurantChargesSubtotal: restSub,
            otherChargesSubtotal: otherSub,
            subtotal,
            taxes,
            grandTotal,
            balanceDue,
          };
        })
      );

      showToast('success', 'Charge Added', `Added Rs. ${charge.totalAmount} (${charge.description}) to guest folio.`);
    },
    [currentUser, settings.defaultTaxRate, showToast]
  );

  const updateRoomStatus = useCallback(
    (roomId: string, status: RoomStatus) => {
      setRooms((prev) => prev.map((rm) => (rm.id === roomId ? { ...rm, status } : rm)));
      showToast('info', 'Room Status Changed', `Room status updated to ${status.toUpperCase()}.`);
    },
    [showToast]
  );

  const saveGuest = useCallback(
    (guestData: Omit<Guest, 'id' | 'createdAt' | 'totalVisits'> & { id?: string }): Guest => {
      const id = guestData.id || `gst-${Date.now()}`;
      const now = new Date().toISOString();

      const guest: Guest = {
        ...guestData,
        id,
        totalVisits: guestData.id ? guestsMap.get(guestData.id)?.totalVisits || 1 : 1,
        createdAt: guestData.id ? guestsMap.get(guestData.id)?.createdAt || now : now,
      };

      setGuests((prev) => {
        const idx = prev.findIndex((g) => g.id === id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = guest;
          return copy;
        }
        return [guest, ...prev];
      });

      showToast('success', 'Guest Saved', `Guest profile for ${guest.fullName} updated.`);
      return guest;
    },
    [guestsMap, showToast]
  );

  // 10. Suppliers Actions
  const saveSupplier = useCallback(
    (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'totalPurchases' | 'outstandingBalance'> & { id?: string }) => {
      const id = supplierData.id || `sup-${Date.now()}`;
      const now = new Date().toISOString();

      const sup: Supplier = {
        ...supplierData,
        id,
        totalPurchases: supplierData.id ? suppliersMap.get(supplierData.id)?.totalPurchases || 0 : 0,
        outstandingBalance: supplierData.id ? suppliersMap.get(supplierData.id)?.outstandingBalance || 0 : 0,
        createdAt: supplierData.id ? suppliersMap.get(supplierData.id)?.createdAt || now : now,
      };

      setSuppliers((prev) => {
        const idx = prev.findIndex((s) => s.id === id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = sup;
          return copy;
        }
        return [sup, ...prev];
      });

      showToast('success', 'Supplier Saved', `Supplier "${sup.name}" saved.`);
    },
    [suppliersMap, showToast]
  );

  return (
    <DbContext.Provider
      value={{
        settings,
        currentUser,
        users,
        rawMaterials,
        suppliers,
        purchases,
        recipes,
        menuItems,
        orders,
        tables,
        rooms,
        guests,
        reservations,
        hotelBills,
        stockLedger,
        wasteRecords,
        auditLogs,
        toasts,

        rawMaterialsMap,
        recipesMap,
        menuItemsMap,
        suppliersMap,
        tablesMap,
        roomsMap,
        guestsMap,
        reservationsMap,

        setCurrentUser,
        updateSettings,
        showToast,
        removeToast,
        resetAllData,
        exportDatabaseJSON,
        importDatabaseJSON,
        playAudio,

        addRawMaterial,
        updateRawMaterial,
        adjustStock,
        deleteRawMaterial,

        createPurchaseInvoice,

        saveRecipe,
        deleteRecipe,
        duplicateRecipe,

        saveMenuItem,
        toggleMenuItemAvailability,
        deleteMenuItem,

        validateOrderInventory,
        createOrder,
        updateOrderStatus,
        payOrder,

        recordWaste,

        updateTableStatus,
        reserveTable,

        createReservation,
        checkInReservation,
        checkOutReservation,
        addFolioCharge,
        updateRoomStatus,
        saveGuest,

        saveSupplier,
      }}
    >
      {children}
    </DbContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DbContext);
  if (!context) {
    throw new Error('useDb must be used within a DbProvider');
  }
  return context;
};
