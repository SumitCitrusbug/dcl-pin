import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district_id = searchParams.get('district_id');

  if (!district_id) {
    return NextResponse.json({ error: 'District ID is required' }, { status: 400 });
  }

  try {
    const result = await query(
      'SELECT * FROM pincodes WHERE district_id = $1 ORDER BY pincode ASC',
      [district_id]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Fetch pincodes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
