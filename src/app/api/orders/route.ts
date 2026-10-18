import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/Order';
import { orderCreateSchema } from '@/lib/validations/inventory';
import { INITIAL_ORDERS } from '@/data/seedData';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const db = await connectToDatabase();

    if (db) {
      const orders = await Order.find().sort({ createdAt: -1 });
      if (orders.length > 0) {
        return NextResponse.json({ success: true, count: orders.length, data: orders });
      }
    }

    return NextResponse.json({
      success: true,
      count: INITIAL_ORDERS.length,
      data: INITIAL_ORDERS,
    });
  } catch (error: any) {
    console.error('Orders GET API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const result = orderCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid order data' },
        { status: 400 }
      );
    }

    const orderData = result.data;
    const orderNumber = `ORD-${Date.now().toString().slice(-4)}`;
    const db = await connectToDatabase();

    if (db) {
      const newOrder = await Order.create({
        ...orderData,
        orderNumber,
        status: 'confirmed',
        serverName: user?.name || 'Hamza Tariq',
        inventoryDeducted: false,
        confirmedAt: new Date(),
      });

      return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: `ord-${Date.now()}`,
        orderNumber,
        ...orderData,
        status: 'confirmed',
        serverName: user?.name || 'Staff Member',
        inventoryDeducted: false,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Orders POST API Error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
