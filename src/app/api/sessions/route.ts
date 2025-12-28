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
    const includeAll = searchParams.get('include_all') === 'true';

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
      .gte('session_date', startDate || new Date().toISOString().split('T')[0])
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true });

    // Si no es admin (include_all), filtrar solo sesiones disponibles
    if (!includeAll) {
      query = query.in('status', ['available', 'full']);
    }

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
        current_participants: 0,
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

// PUT - Actualizar sesión (admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, service_id, session_date, start_time, end_time, max_participants, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID de sesión requerido' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (service_id) updateData.service_id = service_id;
    if (session_date) updateData.session_date = session_date;
    if (start_time) updateData.start_time = start_time;
    if (end_time) updateData.end_time = end_time;
    if (max_participants) updateData.max_participants = max_participants;
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    updateData.updated_at = new Date().toISOString();

    const { data: session, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Error al actualizar sesión' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar sesión (admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de sesión requerido' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Error al eliminar sesión' },
      { status: 500 }
    );
  }
}
