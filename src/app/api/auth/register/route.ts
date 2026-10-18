import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { registerSchema } from '@/lib/validations/auth';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { INITIAL_USERS } from '@/data/seedData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const { name, email, password, role } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const db = await connectToDatabase();

    if (db) {
      // Check if user already exists in MongoDB
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email address already exists.' },
          { status: 409 }
        );
      }

      // Check if this is the first user (grant admin if first user in DB)
      const count = await User.countDocuments();
      const assignedRole = count === 0 ? 'admin' : role || 'inventory_manager';

      const passwordHash = await hashPassword(password);
      const newUser = await User.create({
        name,
        email: normalizedEmail,
        passwordHash,
        role: assignedRole,
        title: assignedRole === 'admin' ? 'General Director' : 'Staff Member',
        department: assignedRole === 'admin' ? 'Executive' : 'Inventory & Store',
      });

      const sessionUser = {
        userId: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department,
        avatar: newUser.avatar,
      };

      await setSessionCookie(sessionUser);

      return NextResponse.json({
        success: true,
        user: sessionUser,
        message: 'Account registered successfully.',
      });
    } else {
      // Fallback in-memory registration when MongoDB is not running locally
      const existingSeed = INITIAL_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (existingSeed) {
        return NextResponse.json(
          { error: 'An account with this email address already exists.' },
          { status: 409 }
        );
      }

      const assignedRole = role || 'inventory_manager';
      const sessionUser = {
        userId: `usr-${Date.now()}`,
        email: normalizedEmail,
        name,
        role: assignedRole,
        department: 'Inventory & Store',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };

      await setSessionCookie(sessionUser);

      return NextResponse.json({
        success: true,
        user: sessionUser,
        message: 'Account registered successfully (Session active).',
      });
    }
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred during registration.' },
      { status: 500 }
    );
  }
}
