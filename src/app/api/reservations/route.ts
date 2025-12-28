import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendEmail,
  reservationConfirmationTemplate,
  adminNewReservationTemplate,
} from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Obtener reservaciones (con filtros opcionales)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const sessionId = searchParams.get('session_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('reservations')
      .select(`
        *,
        session:sessions (
          id,
          session_date,
          start_time,
          end_time,
          service:services (
            id,
            name,
            slug,
            service_type
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (email) {
      query = query.eq('customer_email', email);
    }

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reservations, error } = await query;

    if (error) throw error;

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Error al obtener reservaciones' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva reservación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_message,
      reservation_type = 'single',
      pack_id,
      user_id, // ID del usuario autenticado (opcional)
    } = body;

    // Validaciones
    if (!session_id || !customer_name || !customer_email) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: session_id, customer_name, customer_email' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Obtener información de la sesión
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        service:services (*)
      `)
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    // Verificar si ya existe una reservación del mismo cliente para esta sesión
    const { data: existingReservation } = await supabase
      .from('reservations')
      .select('id')
      .eq('session_id', session_id)
      .eq('customer_email', customer_email)
      .not('status', 'in', '("cancelled","no_show")')
      .single();

    if (existingReservation) {
      return NextResponse.json(
        { error: 'Ya tienes una reservación para esta sesión' },
        { status: 400 }
      );
    }

    // Determinar si va a cola de espera
    const isSessionFull = session.current_participants >= session.max_participants;
    let queuePosition = null;

    if (isSessionFull) {
      // Obtener la última posición en cola
      const { data: lastInQueue } = await supabase
        .from('reservations')
        .select('queue_position')
        .eq('session_id', session_id)
        .not('queue_position', 'is', null)
        .order('queue_position', { ascending: false })
        .limit(1)
        .single();

      queuePosition = (lastInQueue?.queue_position || 0) + 1;
    }

    // Crear la reservación
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert({
        session_id,
        service_id: session.service_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_message,
        status: 'pending',
        queue_position: queuePosition,
        reservation_type,
        pack_id,
        user_id: user_id || null, // Vincular con usuario autenticado si existe
        source: 'website',
      })
      .select()
      .single();

    if (reservationError) throw reservationError;

    // Formatear fecha para emails
    const sessionDate = new Date(session.session_date).toLocaleDateString('fr-CH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const location = session.service.service_type === 'home'
      ? 'À votre domicile'
      : 'Rue de la Maltière 82H, 2904 Bressaucourt';

    // Enviar email de confirmación al cliente
    const customerEmailResult = await sendEmail({
      to: customer_email,
      subject: queuePosition
        ? `Liste d'attente - ${session.service.name}`
        : `Réservation confirmée - ${session.service.name}`,
      html: reservationConfirmationTemplate({
        customerName: customer_name,
        reservationNumber: reservation.reservation_number,
        serviceName: session.service.name,
        sessionDate,
        sessionTime: session.start_time.slice(0, 5),
        location,
        price: `CHF ${session.service.price}.-`,
        queuePosition: queuePosition || undefined,
      }),
    });

    // Enviar notificación al admin
    const adminEmailResult = await sendEmail({
      to: 'contact@coredefemme.ch',
      subject: `Nouvelle réservation: ${reservation.reservation_number}`,
      html: adminNewReservationTemplate({
        reservationNumber: reservation.reservation_number,
        customerName: customer_name,
        customerEmail: customer_email,
        customerPhone: customer_phone,
        serviceName: session.service.name,
        sessionDate,
        sessionTime: session.start_time.slice(0, 5),
        isQueued: !!queuePosition,
        queuePosition: queuePosition || undefined,
      }),
    });

    // Guardar log de emails
    await supabase.from('email_logs').insert([
      {
        recipient_email: customer_email,
        recipient_name: customer_name,
        email_type: queuePosition ? 'queue_confirmation' : 'reservation_confirmation',
        subject: queuePosition
          ? `Liste d'attente - ${session.service.name}`
          : `Réservation confirmée - ${session.service.name}`,
        status: customerEmailResult.success ? 'sent' : 'failed',
        resend_id: customerEmailResult.id,
        related_id: reservation.id,
        error_message: customerEmailResult.error,
      },
      {
        recipient_email: 'contact@coredefemme.ch',
        recipient_name: 'Chloé (Admin)',
        email_type: 'admin_notification',
        subject: `Nouvelle réservation: ${reservation.reservation_number}`,
        status: adminEmailResult.success ? 'sent' : 'failed',
        resend_id: adminEmailResult.id,
        related_id: reservation.id,
        error_message: adminEmailResult.error,
      },
    ]);

    return NextResponse.json({
      reservation: {
        ...reservation,
        session,
      },
      message: queuePosition
        ? `Vous êtes en position ${queuePosition} sur la liste d'attente`
        : 'Réservation confirmée !',
      isQueued: !!queuePosition,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Error al crear reservación' },
      { status: 500 }
    );
  }
}
