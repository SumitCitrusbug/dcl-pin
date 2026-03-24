import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM districts ORDER BY name ASC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Fetch districts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
