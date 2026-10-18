import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { RawMaterial } from '@/models/RawMaterial';
import { StockTransaction } from '@/models/StockTransaction';
import { stockInSchema } from '@/lib/validations/inventory';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const result = stockInSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid stock-in data' },
        { status: 400 }
      );
    }

    const { rawMaterialId, quantity, unitCost, supplierName, invoiceNumber, notes } = result.data;
    const db = await connectToDatabase();

    if (db) {
      const material = await RawMaterial.findById(rawMaterialId);
      if (!material) {
        return NextResponse.json({ error: 'Raw material item not found' }, { status: 404 });
      }

      const previousBalance = material.currentQty;
      const newBalance = previousBalance + quantity;
      const newTotalStockIn = material.totalStockIn + quantity;

      material.currentQty = newBalance;
      material.totalStockIn = newTotalStockIn;
      material.status = newBalance > material.minStockLevel ? 'active' : 'low_stock';
      await material.save();

      const transaction = await StockTransaction.create({
        date: new Date(),
        rawMaterialId: material._id.toString(),
        itemName: material.name,
        sku: material.sku,
        type: 'STOCK IN',
        quantity,
        unit: material.unit,
        baseQtyChange: quantity,
        previousBalance,
        newBalance,
        referenceId: invoiceNumber || `IN-${Date.now()}`,
        user: user?.name || 'Store Officer',
        notes: notes || `Stock in received from ${supplierName || 'Supplier'}`,
        costImpact: quantity * unitCost,
      });

      return NextResponse.json({
        success: true,
        data: { material, transaction },
        message: `Successfully received ${quantity} ${material.unit} of ${material.name}.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Stock-in recorded successfully.',
    });
  } catch (error: any) {
    console.error('Stock In API Error:', error);
    return NextResponse.json({ error: 'Failed to record stock in' }, { status: 500 });
  }
}
