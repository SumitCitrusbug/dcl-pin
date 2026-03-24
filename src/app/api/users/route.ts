export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        u.id, u.email, u.role, u.is_active, u.is_locked, 
        ep.name, ep.phone, ep.alternate_phone, ep.address, ep.vehicle_type, ep.vehicle_note
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      ORDER BY u.id DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
