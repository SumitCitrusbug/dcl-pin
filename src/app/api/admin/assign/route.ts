import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { employee_id, district_id, pincode_ids } = await request.json();

    for (const pinId of pincode_ids) {
      await query(
        'INSERT INTO employee_assignments (employee_id, district_id, pincode_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [employee_id, district_id, pinId]
      );
    }

    return NextResponse.json({ message: 'Assignments created successfully' });
  } catch (error) {
    console.error('Admin assign error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { employee_id, pincode_ids } = await request.json();
    const ids = Array.isArray(pincode_ids) ? pincode_ids : [pincode_ids];
    
    for (const pinId of ids) {
      await query(
        'DELETE FROM employee_assignments WHERE employee_id = $1 AND pincode_id = $2',
        [employee_id, pinId]
      );
    }
    return NextResponse.json({ message: 'Assignments removed successfully' });
  } catch (error) {
    console.error('Admin remove error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
