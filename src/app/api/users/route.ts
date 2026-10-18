import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { INITIAL_USERS } from '@/data/seedData';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    const db = await connectToDatabase();

    if (db) {
      const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
      if (users.length > 0) {
        return NextResponse.json({ success: true, count: users.length, data: users });
      }
    }

    return NextResponse.json({
      success: true,
      count: INITIAL_USERS.length,
      data: INITIAL_USERS,
    });
  } catch (error: any) {
    console.error('Users GET API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
