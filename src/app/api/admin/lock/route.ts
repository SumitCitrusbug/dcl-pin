import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { user_id, is_locked } = await request.json();

    await query(
      'UPDATE users SET is_locked = $1 WHERE id = $2',
      [is_locked, user_id]
    );

    return NextResponse.json({ message: `User ${is_locked ? 'locked' : 'unlocked'} successfully` });
  } catch (error) {
    console.error('Admin lock error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
