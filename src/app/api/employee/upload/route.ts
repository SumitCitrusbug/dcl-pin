import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if locked
  const userResult = await query('SELECT is_locked FROM users WHERE id = $1', [payload.userId]);
  if (userResult.rows[0]?.is_locked) {
    return NextResponse.json({ error: 'Your assignments are locked by admin' }, { status: 403 });
  }

  try {
    const { district_id, pincode_ids, action } = await request.json(); // action: 'add' or 'remove'

    if (action === 'add') {
      for (const pinId of pincode_ids) {
        await query(
          'INSERT INTO employee_assignments (employee_id, district_id, pincode_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [payload.userId, district_id, pinId]
        );
      }
    } else if (action === 'remove') {
      await query(
        'DELETE FROM employee_assignments WHERE employee_id = $1 AND pincode_id = ANY($2)',
        [payload.userId, pincode_ids]
      );
    }

    return NextResponse.json({ message: 'Assignments updated successfully' });
  } catch (error) {
    console.error('Assignment upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
