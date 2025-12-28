import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Obtener sesiones disponibles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('service_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('sessions')
      .select(`
        *,
        service:services (
          id,
          name,
          slug,
          duration_minutes,
          price,
          max_participants,
          service_type
        )
      `)
      .in('status', ['available', 'full'])
      .gte('session_date', startDate || new Date().toISOString().split('T')[0])
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }

    if (endDate) {
      query = query.lte('session_date', endDate);
    }

    const { data: sessions, error } = await query;

    if (error) throw error;

    // Añadir información de disponibilidad
    const sessionsWithAvailability = sessions?.map(session => ({
      ...session,
      available_spots: session.max_participants - session.current_participants,
      is_available: session.status === 'available' && session.current_participants < session.max_participants,
    }));

    return NextResponse.json({ sessions: sessionsWithAvailability });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Error al obtener sesiones' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva sesión (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service_id, session_date, start_time, end_time, max_participants, notes } = body;

    // Validaciones
    if (!service_id || !session_date || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        service_id,
        session_date,
        start_time,
        end_time,
        max_participants: max_participants || 8,
        notes,
        status: 'available',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Error al crear sesión' },
      { status: 500 }
    );
  }
}
