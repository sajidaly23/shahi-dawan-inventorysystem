import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { loginSchema } from '@/lib/validations/auth';
import { verifyPassword, setSessionCookie } from '@/lib/auth';
import { INITIAL_USERS } from '@/data/seedData';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Please provide a valid email and password.' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    const db = await connectToDatabase();

    if (db) {
      const user = await User.findOne({ email: normalizedEmail });

      if (user) {
        // MongoDB user found — verify real password hash
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          return NextResponse.json(
            { error: 'Invalid email or password.' },
            { status: 401 }
          );
        }

        const sessionUser = {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department,
          avatar: user.avatar,
        };

        await setSessionCookie(sessionUser);

        return NextResponse.json({
          success: true,
          user: sessionUser,
          message: 'Logged in successfully.',
        });
      }
      // No MongoDB user found — fall through to seed data below
    }

    // Demo / seed-data fallback (works when MongoDB is offline OR DB is empty)
    const seedUser = INITIAL_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!seedUser) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const sessionUser = {
      userId: seedUser.id,
      email: seedUser.email,
      name: seedUser.name,
      role: seedUser.role,
      department: seedUser.department,
      avatar: seedUser.avatar,
    };

    await setSessionCookie(sessionUser);

    return NextResponse.json({
      success: true,
      user: sessionUser,
      message: 'Logged in successfully (Demo Mode).',
    });
  } catch (error: any) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred during login.' },
      { status: 500 }
    );
  }
}
