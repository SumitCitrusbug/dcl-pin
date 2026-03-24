import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || payload.userId; // Admin can view others

    const result = await query(`
      SELECT ea.pincode_id, p.pincode, p.area, p.taluka, d.name as district_name 
      FROM employee_assignments ea
      JOIN pincodes p ON ea.pincode_id = p.id
      JOIN districts d ON ea.district_id = d.id
      WHERE ea.employee_id = $1
    `, [userId]);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Fetch assignments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { pincode_ids, district_id } = await request.json();
    const ids = Array.isArray(pincode_ids) ? pincode_ids : [pincode_ids];
    
    for (const pinId of ids) {
      await query(
        'INSERT INTO employee_assignments (employee_id, district_id, pincode_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [payload.userId, district_id, pinId]
      );
    }

    return NextResponse.json({ message: 'Assignments updated successfully' });
  } catch (error) {
    console.error('Employee assign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { pincode_ids } = await request.json();
    const ids = Array.isArray(pincode_ids) ? pincode_ids : [pincode_ids];
    
    for (const pinId of ids) {
      await query(
        'DELETE FROM employee_assignments WHERE employee_id = $1 AND pincode_id = $2',
        [payload.userId, pinId]
      );
    }
    return NextResponse.json({ message: 'Assignments removed' });
  } catch (error) {
    console.error('Employee remove error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
