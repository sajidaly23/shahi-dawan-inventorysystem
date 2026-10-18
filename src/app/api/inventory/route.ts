import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { RawMaterial } from '@/models/RawMaterial';
import { rawMaterialSchema } from '@/lib/validations/inventory';
import { INITIAL_RAW_MATERIALS } from '@/data/seedData';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const db = await connectToDatabase();

    if (db) {
      const query: any = {};
      if (category && category !== 'All') query.category = category;
      if (status && status !== 'All') query.status = status;

      const items = await RawMaterial.find(query).sort({ updatedAt: -1 });
      if (items.length > 0) {
        return NextResponse.json({ success: true, count: items.length, data: items });
      }
    }

    // Fallback: Return seed raw materials
    let data = INITIAL_RAW_MATERIALS;
    if (category && category !== 'All') {
      data = data.filter((m) => m.category === category);
    }
    if (status && status !== 'All') {
      data = data.filter((m) => m.status === status);
    }

    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error: any) {
    console.error('Inventory GET API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    // Allow authorized staff
    if (user && user.role === 'waiter') {
      return NextResponse.json({ error: 'Unauthorized: Staff role cannot modify inventory' }, { status: 403 });
    }

    const body = await request.json();
    const result = rawMaterialSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid item data' },
        { status: 400 }
      );
    }

    const itemData = result.data;
    const db = await connectToDatabase();

    if (db) {
      const existing = await RawMaterial.findOne({ sku: itemData.sku.toUpperCase() });
      if (existing) {
        return NextResponse.json({ error: 'SKU code already exists in inventory' }, { status: 409 });
      }

      const newItem = await RawMaterial.create({
        ...itemData,
        sku: itemData.sku.toUpperCase(),
        totalStockIn: itemData.currentQty,
        status:
          itemData.currentQty <= 0
            ? 'out_of_stock'
            : itemData.currentQty < itemData.minStockLevel
            ? 'low_stock'
            : 'active',
      });

      return NextResponse.json({ success: true, data: newItem }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: `rm-${Date.now()}`,
        ...itemData,
        sku: itemData.sku.toUpperCase(),
        totalStockIn: itemData.currentQty,
        status: itemData.currentQty <= 0 ? 'out_of_stock' : 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Inventory POST API Error:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
