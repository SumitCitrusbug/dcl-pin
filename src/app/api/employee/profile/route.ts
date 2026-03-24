import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await query(`
      SELECT ep.*, u.is_locked, u.is_active 
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      WHERE ep.user_id = $1
    `, [payload.userId]);
    return NextResponse.json(result.rows[0] || {});
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { name, phone, alternate_phone, address, district_id, vehicle_type, vehicle_note } = data;

    const result = await query(`
      INSERT INTO employee_profiles (user_id, name, phone, alternate_phone, address, district_id, vehicle_type, vehicle_note)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        alternate_phone = EXCLUDED.alternate_phone,
        address = EXCLUDED.address,
        district_id = EXCLUDED.district_id,
        vehicle_type = EXCLUDED.vehicle_type,
        vehicle_note = EXCLUDED.vehicle_note
      RETURNING *
    `, [payload.userId, name, phone, alternate_phone, address, district_id, vehicle_type, vehicle_note]);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
