import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/Order';
import { RawMaterial } from '@/models/RawMaterial';
import { Recipe } from '@/models/Recipe';
import { StockTransaction } from '@/models/StockTransaction';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    const db = await connectToDatabase();

    if (db) {
      const order = await Order.findById(id);
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      order.status = status;
      if (status === 'completed') {
        order.completedAt = new Date();

        // Check if recipe BOM has already been deducted for this order
        if (!order.inventoryDeducted) {
          // Perform automatic BOM ingredient deduction
          for (const item of order.items) {
            if (item.recipeId) {
              const recipe = await Recipe.findById(item.recipeId);
              if (recipe) {
                for (const ing of recipe.ingredients) {
                  const material = await RawMaterial.findById(ing.rawMaterialId);
                  if (material) {
                    const deductQty = ing.quantity * item.quantity;
                    const prevBal = material.currentQty;
                    const newBal = Math.max(0, prevBal - deductQty);

                    material.currentQty = newBal;
                    material.status =
                      newBal <= 0 ? 'out_of_stock' : newBal <= material.minStockLevel ? 'low_stock' : 'active';
                    await material.save();

                    // Create ledger trail entry
                    await StockTransaction.create({
                      date: new Date(),
                      rawMaterialId: material._id.toString(),
                      itemName: material.name,
                      sku: material.sku,
                      type: 'Order Consumption',
                      quantity: deductQty,
                      unit: material.unit,
                      baseQtyChange: -deductQty,
                      previousBalance: prevBal,
                      newBalance: newBal,
                      referenceId: order.orderNumber,
                      user: 'KDS Engine',
                      notes: `Auto-deducted ${deductQty} ${material.unit} for Order #${order.orderNumber} (${item.quantity}x ${item.name}).`,
                      costImpact: (ing.calculatedCost || 0) * item.quantity,
                    });
                  }
                }
              }
            }
          }
          // Mark as deducted to prevent double-deduction!
          order.inventoryDeducted = true;
        }
      }

      await order.save();
      return NextResponse.json({ success: true, data: order });
    }

    return NextResponse.json({
      success: true,
      message: `Order status advanced to ${status}.`,
    });
  } catch (error: any) {
    console.error('Order PATCH API Error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
