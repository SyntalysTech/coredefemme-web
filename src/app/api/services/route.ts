import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Obtener todos los servicios activos
export async function GET() {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        schedules (
          id,
          day_of_week,
          start_time,
          end_time,
          is_active
        )
      `)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Error al obtener servicios' },
      { status: 500 }
    );
  }
}
