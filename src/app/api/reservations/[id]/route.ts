import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendEmail,
  reservationCancellationTemplate,
  queuePositionUpdatedTemplate,
} from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Obtener una reservación específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: reservation, error } = await supabase
      .from('reservations')
      .select(`
        *,
        session:sessions (
          *,
          service:services (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !reservation) {
      return NextResponse.json(
        { error: 'Reservación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      { error: 'Error al obtener reservación' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar reservación (confirmar, cancelar, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, payment_status, payment_intent_id } = body;

    // Obtener reservación actual con sesión
    const { data: currentReservation, error: fetchError } = await supabase
      .from('reservations')
      .select(`
        *,
        session:sessions (
          *,
          service:services (*)
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !currentReservation) {
      return NextResponse.json(
        { error: 'Reservación no encontrada' },
        { status: 404 }
      );
    }

    // Preparar datos de actualización
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;

      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }
    }

    if (notes !== undefined) updateData.notes = notes;
    if (payment_status) updateData.payment_status = payment_status;
    if (payment_intent_id) updateData.payment_intent_id = payment_intent_id;

    // Actualizar reservación
    const { data: reservation, error: updateError } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Si se cancela, enviar email de cancelación
    if (status === 'cancelled') {
      const sessionDate = new Date(currentReservation.session.session_date).toLocaleDateString('fr-CH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      await sendEmail({
        to: currentReservation.customer_email,
        subject: `Réservation annulée - ${currentReservation.session.service.name}`,
        html: reservationCancellationTemplate({
          customerName: currentReservation.customer_name,
          reservationNumber: currentReservation.reservation_number,
          serviceName: currentReservation.session.service.name,
          sessionDate,
          sessionTime: currentReservation.session.start_time.slice(0, 5),
        }),
      });

      // Promover siguiente en cola (manejado por trigger, pero también enviar email)
      const { data: nextInQueue } = await supabase
        .from('reservations')
        .select('*')
        .eq('session_id', currentReservation.session_id)
        .is('queue_position', null) // Ya fue promovido por el trigger
        .eq('status', 'pending')
        .neq('id', id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (nextInQueue) {
        const nextSessionDate = new Date(currentReservation.session.session_date).toLocaleDateString('fr-CH', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        await sendEmail({
          to: nextInQueue.customer_email,
          subject: `Bonne nouvelle ! Place disponible - ${currentReservation.session.service.name}`,
          html: queuePositionUpdatedTemplate({
            customerName: nextInQueue.customer_name,
            serviceName: currentReservation.session.service.name,
            sessionDate: nextSessionDate,
            sessionTime: currentReservation.session.start_time.slice(0, 5),
            isNowConfirmed: true,
          }),
        });
      }
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { error: 'Error al actualizar reservación' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar reservación
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Reservación eliminada' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { error: 'Error al eliminar reservación' },
      { status: 500 }
    );
  }
}
