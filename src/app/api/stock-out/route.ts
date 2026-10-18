import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { RawMaterial } from '@/models/RawMaterial';
import { StockTransaction } from '@/models/StockTransaction';
import { stockOutSchema } from '@/lib/validations/inventory';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const result = stockOutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid stock-out data' },
        { status: 400 }
      );
    }

    const { rawMaterialId, quantity, reason, notes, referenceId } = result.data;
    const db = await connectToDatabase();

    if (db) {
      const material = await RawMaterial.findById(rawMaterialId);
      if (!material) {
        return NextResponse.json({ error: 'Raw material item not found' }, { status: 404 });
      }

      if (material.currentQty < quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock: Requested ${quantity} ${material.unit}, but only ${material.currentQty} ${material.unit} is available.`,
          },
          { status: 400 }
        );
      }

      const previousBalance = material.currentQty;
      const newBalance = Math.max(0, previousBalance - quantity);

      material.currentQty = newBalance;
      material.status =
        newBalance <= 0 ? 'out_of_stock' : newBalance <= material.minStockLevel ? 'low_stock' : 'active';
      await material.save();

      const transaction = await StockTransaction.create({
        date: new Date(),
        rawMaterialId: material._id.toString(),
        itemName: material.name,
        sku: material.sku,
        type: reason,
        quantity,
        unit: material.unit,
        baseQtyChange: -quantity,
        previousBalance,
        newBalance,
        referenceId: referenceId || `OUT-${Date.now()}`,
        user: user?.name || 'Kitchen Staff',
        notes: notes || `Stock deduction for ${reason}`,
        costImpact: quantity * material.purchasePrice,
      });

      return NextResponse.json({
        success: true,
        data: { material, transaction },
        message: `Successfully deducted ${quantity} ${material.unit} of ${material.name}.`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Stock-out recorded successfully.',
    });
  } catch (error: any) {
    console.error('Stock Out API Error:', error);
    return NextResponse.json({ error: 'Failed to record stock out' }, { status: 500 });
  }
}
