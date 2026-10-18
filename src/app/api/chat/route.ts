import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { RawMaterial } from '@/models/RawMaterial';
import { Order } from '@/models/Order';
import { Recipe } from '@/models/Recipe';
import { INITIAL_RAW_MATERIALS, INITIAL_RECIPES, INITIAL_ORDERS, INITIAL_ROOMS } from '@/data/seedData';

// System knowledge base description for Shahi Diwan ERP
const SYSTEM_KNOWLEDGE = `
You are the Diwan AI Executive Assistant for the "Shahi Diwan Grand — Luxury Hotel & Royal Dining Inventory ERP".
Your role is to assist managers, chefs, front-desk staff, and cashiers with comprehensive guidance on how the ERP works, where each feature is located, how to perform workflows, and understanding the system's architecture.

### CORE APPLICATION ARCHITECTURE & MODULES:
1. Executive Dashboard (/dashboard): High-level KPI metrics: Total inventory valuation (PKR), daily sales, food waste loss, room occupancy percentage, fast-moving ingredients, and low-stock alerts.
2. Dish Recipes (/dashboard/recipes): Bill of Materials (BOM) Engine. Defines the exact ingredient quantities (in grams, ml, pieces) needed to cook each menu dish. Calculates automated dish food cost and profit margins.
3. Inventory & Stock (/dashboard/raw-materials): Raw ingredient storage. Tracks bulk raw materials (Rice, Cooking Oil, Spices, Meat, Milk) with unit conversion (KG, GM, LTR, ML). Real-time status (in_stock, low_stock, out_of_stock).
4. Purchase & Stock (/dashboard/stock-in): Supplier invoice receiving. Increases raw material quantities, recalculates weighted average purchase prices, and logs supplier ledger entries.
5. Sales History (/dashboard/stock-ledger): Complete immutable audit ledger of every stock transaction (Purchases, Order Consumption deductions, and Waste write-offs).
6. Food Waste (/dashboard/stock-out): Kitchen waste logging for expired, burnt, or spoiled items. Calculates total financial losses.
7. Order Billing (/dashboard/pos): Point of Sale terminal for Dine-In, Takeaway, and Room Delivery orders. Real-time ingredient check, tax calculations, discounts, and receipt generation.
8. Kitchen Orders (/dashboard/kitchen): Kitchen Display System (KDS). Displays active orders in real-time with status progression (Pending -> Preparing -> Ready).
9. Menu Items (/dashboard/menu): Front-facing customer food menu catalog, prices, and categories.
10. Floor Plan & Tables (/dashboard/tables): Visual table floor matrix (Ground Floor, Royal Banquet, Executive Terrace). Shows occupied, available, and reserved statuses.
11. Room Booking (/dashboard/hotel): Hotel Property Management System (PMS). Room matrix (Deluxe, Royal Suite, Presidential Suite), check-in/out, and guest room assignments.
12. Room Bills (/dashboard/folio-billing): Unified hotel folio billing. Combines room stay tariffs with room-service dining orders into a single consolidated checkout invoice.
13. Guest List (/dashboard/guests): Guest directory and CRM tracking VIP status, contact details, total stays, and dining expenditures.
14. Suppliers (/dashboard/suppliers): Supplier contact directory, NTN numbers, terms, and purchase histories.
15. Reports (/dashboard/reports): Financial & inventory analytical charts, COGS, food cost ratios, and consumption trends.
16. Activity Logs (/dashboard/audit-logs): Security compliance audit trail tracking all user actions, logins, stock adjustments, and order creations.
17. Settings (/dashboard/settings): Restaurant profile, tax rates, currency symbol (PKR), low stock alert thresholds, and theme toggles.

### CORE DATA MODELS:
- RawMaterial: { id, name, code, category, unit, currentQty (base units: g/ml/pcs), minThreshold, costPerUnit, purchasePrice, status }
- Recipe (BOM): { id, menuItemId, dishName, portionYield, ingredients: [{ rawMaterialId, quantity, unit }], totalCost, recommendedPrice }
- Order: { id, orderNumber, orderType (dine_in, takeaway, room_delivery), items: [{ menuItemId, name, quantity, unitPrice, subtotal }], subtotal, taxAmount, discountAmount, grandTotal, status (pending, preparing, ready, completed, cancelled), paymentStatus (paid, unpaid, room_folio), tableId, roomId }
- StockTransaction / Ledger: { id, timestamp, rawMaterialId, itemName, type (PURCHASE, CONSUMPTION, WASTE, ADJUSTMENT), quantity, unit, balanceAfter, referenceId, performedBy }
- Room / Reservation: { id, roomNumber, type, status (available, occupied, cleaning, maintenance), ratePerNight, guestName, folioBalance }

### KEY AUTOMATED WORKFLOWS:
1. Automated BOM Recipe Deduction: When a customer orders a dish (e.g., Chicken Biryani x2) in Order Billing (POS), the system retrieves the recipe BOM, calculates 2x the base ingredient quantities (e.g. 500g Chicken, 400g Basmati Rice, 50ml Cooking Oil), deducts them from RawMaterial inventory, creates Stock Ledger records, and flags any items that fall below their minimum safety threshold.
2. Room Service Integrated Billing: When placing an order for a hotel guest, select "Room Delivery" and select their Room Number. Payment can be marked as "Charge to Room Folio". When the guest checks out at Room Bills (/dashboard/folio-billing), their hotel room bill automatically includes all dining charges!
3. Waste Management Loss Prevention: Any kitchen burn or spoilage is recorded in Food Waste (/dashboard/stock-out) with reason codes. Cost is calculated using purchasePrice to reflect true bottom-line loss in executive reports.
`;

// Advanced domain intent matcher for instant, authoritative, and structured responses
function generateDomainResponse(query: string, liveStats?: any): { response: string; suggestions: string[] } {
  const q = query.toLowerCase().trim();

  // 1. ERP Flow / System Overview
  if (q.includes('erp flow') || q.includes('overview') || q.includes('how does it work') || q.includes('system flow') || q.includes('architecture')) {
    return {
      response: `### 🏰 Shahi Diwan ERP Complete Operational Flow

The Shahi Diwan ERP connects **Hotel PMS**, **Kitchen KDS**, and **Inventory BOM** in a closed-loop system:

1. **Purchasing & Stock In** (\`/dashboard/stock-in\`):
   - Raw ingredients (Rice, Meat, Spices, Dairy) are received from suppliers.
   - Bulk units (KG, Liters) are safely converted to precise base units (Grams, ML) and added to your **Inventory** (\`/dashboard/raw-materials\`).

2. **Recipe & Bill of Materials (BOM)** (\`/dashboard/recipes\`):
   - Every dish on the menu has a mapped BOM recipe specifying exact ingredients per portion.
   - Food cost and profit margins are calculated dynamically.

3. **POS Order Billing** (\`/dashboard/pos\`):
   - Waiters or cashiers create Dine-In, Takeaway, or Room Delivery orders.
   - **Auto-Deduction**: The moment an order is confirmed, ingredients are automatically deducted from stock!

4. **Live Kitchen Display (KDS)** (\`/dashboard/kitchen\`):
   - Orders appear immediately in the kitchen for preparation. Chefs change status to *Preparing* $\\rightarrow$ *Ready*.

5. **Hotel Room Folio Integration** (\`/dashboard/folio-billing\`):
   - Room delivery orders can be charged directly to the guest's hotel room folio, bundling stay + dining into a single invoice at checkout!

6. **Audits & Executive Reports** (\`/dashboard/reports\`):
   - Every transaction is logged immutably in the **Sales History / Stock Ledger** (\`/dashboard/stock-ledger\`) for real-time COGS and profit insights.`,
      suggestions: [
        'How does BOM auto-deduction work?',
        'How to create a Recipe?',
        'How to book a Room?',
        'How to view sales reports?',
      ],
    };
  }

  // 2. Recipe & BOM Questions
  if (q.includes('recipe') || q.includes('bom') || q.includes('bill of material') || q.includes('ingredients')) {
    return {
      response: `### 🍳 How to Create & Manage Dish Recipes (BOM)

The **Bill of Materials (BOM) Engine** links your customer-facing dishes directly to warehouse raw materials:

#### **Steps to Add a Recipe:**
1. Navigate to **Dish Recipes** in the sidebar (\`/dashboard/recipes\`).
2. Click the **"+ New Recipe"** button at the top right.
3. Select the target **Menu Dish** (e.g. *Shahi Mutton Biryani* or *Chicken Karahi*).
4. Specify the **Portion Yield** (e.g., 1 Portion / Serving).
5. Add the required **Ingredients**:
   - Choose the raw material from stock (e.g. *Basmati Rice*, *Cooking Oil*, *Chicken Breast*).
   - Enter the exact portion weight/volume (e.g. \`250 g\`, \`40 ml\`).
6. Review the automatically calculated **Dish Cost** and **Target Profit Margin**.
7. Click **Save Recipe**.

> 💡 **Key Feature**: Once saved, every time this dish is billed in POS, the system automatically subtracts those exact ingredients from inventory and logs the deduction in the Stock Ledger!`,
      suggestions: [
        'How does BOM auto-deduction work?',
        'How to add stock purchases?',
        'Where to check food waste?',
        'Launch Order Billing',
      ],
    };
  }

  // 3. BOM Auto Deduction Logic
  if (q.includes('auto-deduction') || q.includes('deduct') || q.includes('consumption') || q.includes('stock reduce') || q.includes('deduction')) {
    return {
      response: `### ⚡ Automatic Inventory Deduction Mechanism

Here is exactly how the automated ingredient depletion engine operates:

1. **Trigger**: When an order is placed or completed in **Order Billing (POS)** (\`/dashboard/pos\`).
2. **Lookup**: The ERP matches each ordered menu item with its corresponding **Recipe BOM** record.
3. **Calculation**:
   $$\\text{Total Depletion} = \\text{Item Quantity} \\times \\text{Recipe Ingredient Base Quantity}$$
   *(e.g., 3x Chicken Karahi with 400g Chicken each = 1,200g Chicken deducted).*
4. **Validation**:
   - If stock is sufficient, current inventory quantity (\`currentQty\`) is reduced immediately.
   - If stock falls below \`minThreshold\`, the material status flips to **Low Stock (Amber)** or **Out of Stock (Red)** with a top navbar alert.
5. **Ledger Audit**:
   - An immutable transaction of type \`Order Consumption\` is written to **Sales History** (\`/dashboard/stock-ledger\`) with the order ID, cashier name, and post-transaction balance.`,
      suggestions: [
        'How to add stock purchases?',
        'How to view sales reports?',
        'Where to check food waste?',
      ],
    };
  }

  // 4. POS / Billing Questions
  if (q.includes('pos') || q.includes('billing') || q.includes('order') || q.includes('checkout') || q.includes('invoice') || q.includes('cashier')) {
    return {
      response: `### 🛒 POS Billing & Order Processing

The **Order Billing** terminal (\`/dashboard/pos\`) handles high-speed restaurant ordering:

#### **Billing Workflow:**
1. **Select Order Type**: Choose **Dine-In** (select Table), **Takeaway**, or **Room Delivery** (select Room).
2. **Add Menu Items**: Click any dish category (Starters, Royal Curries, Biryani & Rice, Desserts, Beverages) to add items to the cart.
3. **Adjust Quantities**: Increase/decrease servings; ingredients will be verified for availability.
4. **Checkout**:
   - Review subtotal, automated sales tax (default 16%), and optional discount.
   - Select payment method: **Cash**, **Credit Card**, **Online Transfer**, or **Charge to Room Folio**.
5. **Print Thermal Receipt**: Click **Checkout & Print** to launch the high-contrast guest thermal receipt with royal crest and tax breakdown!

> 💡 **Kitchen Integration**: Clicking checkout immediately transmits the ticket to the **Kitchen Orders (KDS)** terminal for live preparation!`,
      suggestions: [
        'How to book a Room?',
        'How does BOM auto-deduction work?',
        'Where to view kitchen orders?',
        'How to view daily sales?',
      ],
    };
  }

  // 5. Kitchen Display System (KDS)
  if (q.includes('kds') || q.includes('kitchen') || q.includes('chef') || q.includes('cooking')) {
    return {
      response: `### 👨‍🍳 Kitchen Display System (KDS) Operations

The **Kitchen Orders** module (\`/dashboard/kitchen\`) provides a paperless real-time dispatch screen for the kitchen staff:

- **Live Order Feed**: Displays tickets ordered via POS with elapsed timers and table/room numbers.
- **Status Workflow**:
  1. **PENDING (Amber)**: Newly placed order awaiting chef pickup.
  2. **PREPARING (Sky Blue)**: Chef clicks *"Start Preparing"* when the burners are fired.
  3. **READY (Emerald)**: Chef clicks *"Mark Ready"* to alert floor waiters or room service runners for pickup.
- **Audio Notifications**: Plays a bell chime when new tickets arrive so the kitchen never misses an order!`,
      suggestions: [
        'Launch Order Billing',
        'How does BOM auto-deduction work?',
        'Explain ERP Flow',
      ],
    };
  }

  // 6. Food Waste Management
  if (q.includes('waste') || q.includes('spoilage') || q.includes('expired') || q.includes('loss') || q.includes('food waste')) {
    return {
      response: `### 🗑️ Food Waste Management & Loss Tracking

Tracking kitchen shrinkage is vital for maintaining food cost percentages:

#### **How to Record Waste:**
1. Open **Food Waste** in the sidebar (\`/dashboard/stock-out\`).
2. Click **"Record Food Waste"**.
3. Select the ingredient (e.g. *Fresh Milk*, *Boneless Chicken*, *Tomatoes*).
4. Enter the wasted quantity (e.g. \`1.5 kg\`).
5. Choose the **Waste Reason**:
   - *Spoilage / Expired*
   - *Kitchen Burn / Overcooked*
   - *Contaminated / Damaged*
   - *Quality Rejection*
6. The system calculates the exact **Financial Cost Loss (PKR)** using purchase price history and deducts the quantity from stock.
7. Total monthly loss is summarized on the **Executive Dashboard** and **Reports** page!`,
      suggestions: [
        'How to view sales reports?',
        'How to add stock purchases?',
        'Explain ERP Flow',
      ],
    };
  }

  // 7. Hotel PMS & Room Booking
  if (q.includes('room') || q.includes('hotel') || q.includes('booking') || q.includes('folio') || q.includes('pms') || q.includes('check-in') || q.includes('guest')) {
    return {
      response: `### 🏨 Hotel Property Management & Integrated Room Folios

The ERP seamlessly synchronizes hotel guest stays with restaurant dining tabs:

#### **1. Room Booking & PMS (\`/dashboard/hotel\`):**
- View real-time room grid: **Deluxe Rooms**, **Executive Suites**, and **Presidential Suites**.
- Check status: **Available (Emerald)**, **Occupied (Blue)**, **Cleaning (Amber)**, or **Maintenance (Rose)**.
- Click any available room to check-in a guest with dates, ID details, and room rates.

#### **2. Integrated Dining Folio (\`/dashboard/folio-billing\`):**
- When a room guest orders from the restaurant, select **Room Delivery** at checkout and choose **Charge to Room Folio**.
- The dining cost attaches to the guest's folio ledger in real-time.
- At guest check-out, the **Room Bills** screen prints a consolidated master bill with room charges + restaurant dining tabs combined!`,
      suggestions: [
        'How does POS billing work?',
        'Where to view guest list?',
        'How to view daily sales?',
      ],
    };
  }

  // 8. Purchases & Stock In
  if (q.includes('purchase') || q.includes('stock in') || q.includes('supplier') || q.includes('inventory stock') || q.includes('add stock')) {
    return {
      response: `### 📦 Purchase Orders & Stock In Receiving

To replenish inventory when new deliveries arrive:

1. Open **Purchase & Stock** (\`/dashboard/stock-in\`).
2. Click **"+ New Stock In / Purchase"**.
3. Select the **Supplier** and input their delivery invoice number.
4. Add the received raw materials:
   - Enter received quantity (e.g. \`50 KG\`).
   - Enter the unit purchase price (PKR).
5. Choose payment status (*Paid* or *Credit Payable*).
6. Click **Confirm & Stock In**:
   - Inventory current quantity increases immediately.
   - Weighted average cost is updated.
   - An immutable transaction of type \`PURCHASE\` is logged in **Sales History** (\`/dashboard/stock-ledger\`).`,
      suggestions: [
        'How to create a Recipe?',
        'How does BOM auto-deduction work?',
        'Where to check food waste?',
      ],
    };
  }

  // 9. Reports & Financials
  if (q.includes('report') || q.includes('sales') || q.includes('revenue') || q.includes('cogs') || q.includes('profit') || q.includes('analytics')) {
    return {
      response: `### 📊 Financial & Inventory Reports

Access all management analytics at **Reports** (\`/dashboard/reports\`):

- **Executive Revenue Metrics**: Daily, weekly, and monthly gross sales, net revenue, tax collected, and guest counts.
- **Food Cost & Margin Analysis**: Compares raw material usage against sales revenue to calculate your true **Food Cost Percentage (COGS)**.
- **Top Consumed Ingredients**: Breakdown of top raw materials by weight and financial expenditure.
- **Waste & Shrinkage Report**: Financial cost losses categorized by spoilage, burns, and expiration.
- **Export Data**: Full exportable JSON backups and ledger audit statements at **Settings** (\`/dashboard/settings\`).`,
      suggestions: [
        'Explain ERP Flow',
        'How does POS billing work?',
        'How to create a Recipe?',
      ],
    };
  }

  // 10. Live Database Stats if available
  if (q.includes('stat') || q.includes('how many') || q.includes('count') || q.includes('status') || q.includes('current stock')) {
    const rawCount = liveStats?.rawMaterialsCount ?? INITIAL_RAW_MATERIALS.length;
    const recipeCount = liveStats?.recipesCount ?? INITIAL_RECIPES.length;
    const ordersCount = liveStats?.ordersCount ?? INITIAL_ORDERS.length;
    const roomsCount = liveStats?.roomsCount ?? INITIAL_ROOMS.length;

    return {
      response: `### 📈 Current Shahi Diwan System Statistics

Here is the live overview of your ERP database:
- **Raw Ingredients Registered**: ${rawCount} items tracked in inventory
- **Active BOM Dish Recipes**: ${recipeCount} recipes mapped
- **Total Orders Recorded**: ${ordersCount} POS transactions
- **Total Hotel Rooms**: ${roomsCount} luxury rooms/suites managed
- **Active Currency**: Pakistani Rupee (PKR)
- **Database Engine**: Next.js App Router full-stack architecture with MongoDB / local fallback hydration.`,
      suggestions: [
        'Explain ERP Flow',
        'How to view sales reports?',
        'How to create a Recipe?',
      ],
    };
  }

  // Default Fallback
  return {
    response: `### 👑 Shahi Diwan AI Assistant

I am your intelligent operational co-pilot for the **Shahi Diwan Hotel & Restaurant ERP**.

I can guide you through:
- 🍳 **Recipe BOM Management**: How recipes deduct ingredients on every POS sale.
- 🛒 **Order Billing & POS**: Dine-in table orders, takeaway, room delivery, and receipts.
- 📦 **Inventory & Purchases**: Receiving supplier invoices, threshold alerts, and ledger history.
- 🏨 **Hotel PMS & Folio Billing**: Room bookings and combining hotel stay with restaurant dining tabs.
- 🗑️ **Food Waste Loss Prevention**: Recording spoilage and tracking financial shrinkage.
- 📊 **Executive Reports**: COGS, food cost ratios, and daily sales metrics.

What operational workflow or module would you like help with?`,
    suggestions: [
      'Explain ERP Flow',
      'How does BOM auto-deduction work?',
      'How to create a Recipe?',
      'How to book a Room?',
      'How to view sales reports?',
    ],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, query } = body;

    const userMessage = query || (Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1].content : '');

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      return NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
    }

    // Attempt to gather live counts from database if connected
    let liveStats: any = null;
    try {
      const db = await connectToDatabase();
      if (db) {
        const [rawCount, recipeCount, orderCount] = await Promise.all([
          RawMaterial.countDocuments().catch(() => INITIAL_RAW_MATERIALS.length),
          Recipe.countDocuments().catch(() => INITIAL_RECIPES.length),
          Order.countDocuments().catch(() => INITIAL_ORDERS.length),
        ]);
        liveStats = {
          rawMaterialsCount: rawCount,
          recipesCount: recipeCount,
          ordersCount: orderCount,
          roomsCount: INITIAL_ROOMS.length,
        };
      }
    } catch {
      // Fallback to seed data stats seamlessly
      liveStats = {
        rawMaterialsCount: INITIAL_RAW_MATERIALS.length,
        recipesCount: INITIAL_RECIPES.length,
        ordersCount: INITIAL_ORDERS.length,
        roomsCount: INITIAL_ROOMS.length,
      };
    }

    // Check if an external Gemini API key is configured in the environment
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey) {
      try {
        const promptText = `
${SYSTEM_KNOWLEDGE}

Current Real-time System Snapshot:
- Raw Materials: ${liveStats.rawMaterialsCount}
- BOM Recipes: ${liveStats.recipesCount}
- Historical Orders: ${liveStats.ordersCount}
- Rooms: ${liveStats.roomsCount}

User Query: "${userMessage}"

Provide a clear, professional, concise, and beautifully formatted response with actionable steps, markdown headings, and bullet points.
`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            return NextResponse.json({
              response: candidateText,
              suggestions: [
                'How does BOM auto-deduction work?',
                'How to create a Recipe?',
                'How does POS billing work?',
                'Explain ERP Flow',
              ],
              timestamp: Date.now(),
            });
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local expert engine:', err);
      }
    }

    // Default: Use our comprehensive built-in domain reasoning engine
    const result = generateDomainResponse(userMessage, liveStats);

    return NextResponse.json({
      response: result.response,
      suggestions: result.suggestions,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      {
        response:
          'I apologize, but I encountered an unexpected error processing your request. Please try asking your question again or check the documentation in Settings.',
        suggestions: ['Explain ERP Flow', 'How to create a Recipe?', 'How does POS billing work?'],
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
