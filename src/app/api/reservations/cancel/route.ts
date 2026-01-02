import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { sendEmail, reservationCancellationTemplate, adminCancellationTemplate } from "@/lib/email";

// Crear cliente Supabase con service role para operaciones admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reservation_id, reason } = body;

    if (!reservation_id) {
      return NextResponse.json(
        { error: "reservation_id es requerido" },
        { status: 400 }
      );
    }

    // Obtener el token de autenticación del usuario
    const cookieStore = await cookies();
    const supabaseAuthToken = cookieStore.get("sb-access-token")?.value;

    // Crear cliente con el token del usuario para verificar autenticación
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Verificar usuario autenticado
    let userId: string | null = null;

    if (supabaseAuthToken) {
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(supabaseAuthToken);
      if (!authError && user) {
        userId = user.id;
      }
    }

    // Obtener la reservación con información completa
    const { data: reservation, error: fetchError } = await supabaseAdmin
      .from("reservations")
      .select(`
        *,
        sessions(
          session_date,
          start_time,
          service:services(name, slug)
        )
      `)
      .eq("id", reservation_id)
      .single();

    if (fetchError || !reservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Verificar que el usuario puede cancelar esta reserva
    // (por email si no está autenticado, o por user_id si lo está)
    if (userId && reservation.user_id && reservation.user_id !== userId) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas annuler cette réservation" },
        { status: 403 }
      );
    }

    // Verificar que la sesión no ha pasado
    if (reservation.sessions) {
      const sessionDateTime = new Date(
        `${reservation.sessions.session_date}T${reservation.sessions.start_time}`
      );
      const now = new Date();

      if (sessionDateTime < now) {
        return NextResponse.json(
          { error: "Impossible d'annuler une séance passée" },
          { status: 400 }
        );
      }

      // Verificar política de 24h
      const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursUntilSession < 24) {
        return NextResponse.json(
          { error: "Annulation impossible moins de 24h avant la séance" },
          { status: 400 }
        );
      }
    }

    // Si ya está cancelada
    if (reservation.status === "cancelled") {
      return NextResponse.json(
        { error: "Cette réservation est déjà annulée" },
        { status: 400 }
      );
    }

    // Actualizar la reservación a cancelada
    const { error: updateError } = await supabaseAdmin
      .from("reservations")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        notes: reason ? `Annulé par client: ${reason}` : "Annulé par client",
        updated_at: new Date().toISOString(),
      })
      .eq("id", reservation_id);

    if (updateError) {
      console.error("Error updating reservation:", updateError);
      return NextResponse.json(
        { error: "Erreur lors de l'annulation" },
        { status: 500 }
      );
    }

    // Si era de un pack, devolver la sesión al pack
    if (reservation.pack_id && reservation.reservation_type === "pack") {
      const { error: packError } = await supabaseAdmin
        .from("customer_packs")
        .update({
          used_sessions: supabaseAdmin.rpc("greatest", { a: 0, b: "used_sessions - 1" }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", reservation.pack_id);

      // Alternativa más simple: usar raw SQL
      if (packError) {
        await supabaseAdmin.rpc("decrement_pack_usage", { pack_id: reservation.pack_id });
      }
    }

    // Crear notificación para el usuario si está autenticado
    if (userId) {
      await supabaseAdmin.from("user_notifications").insert({
        user_id: userId,
        type: "cancellation",
        title: "Réservation annulée",
        message: `Votre réservation ${reservation.reservation_number} a été annulée avec succès.`,
        related_id: reservation_id,
      });
    }

    // Formatear fecha y hora para emails
    const sessionDate = new Date(reservation.sessions.session_date).toLocaleDateString('fr-CH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const sessionTime = reservation.sessions.start_time.slice(0, 5);
    const serviceName = reservation.sessions.service?.name || 'Séance';

    // Enviar email de confirmación al cliente
    try {
      await sendEmail({
        to: reservation.customer_email,
        subject: `Annulation confirmée - ${serviceName}`,
        html: reservationCancellationTemplate({
          customerName: reservation.customer_name,
          reservationNumber: reservation.reservation_number,
          serviceName,
          sessionDate,
          sessionTime,
        }),
      });

      // Log del email cliente
      await supabaseAdmin.from('email_logs').insert({
        recipient_email: reservation.customer_email,
        recipient_name: reservation.customer_name,
        email_type: 'cancellation_confirmation',
        subject: `Annulation confirmée - ${serviceName}`,
        status: 'sent',
        related_id: reservation_id,
      });
    } catch (emailError) {
      console.error('Error sending cancellation email to customer:', emailError);
    }

    // Enviar email de notificación a Chloé (admin)
    const adminEmail = process.env.ADMIN_EMAIL || 'contact@coredefemme.ch';
    try {
      await sendEmail({
        to: adminEmail,
        subject: `Annulation - ${reservation.reservation_number}`,
        html: adminCancellationTemplate({
          reservationNumber: reservation.reservation_number,
          customerName: reservation.customer_name,
          customerEmail: reservation.customer_email,
          customerPhone: reservation.customer_phone,
          serviceName,
          sessionDate,
          sessionTime,
          reason,
        }),
      });

      // Log del email admin
      await supabaseAdmin.from('email_logs').insert({
        recipient_email: adminEmail,
        recipient_name: 'Admin',
        email_type: 'admin_cancellation_notification',
        subject: `Annulation - ${reservation.reservation_number}`,
        status: 'sent',
        related_id: reservation_id,
      });
    } catch (emailError) {
      console.error('Error sending cancellation email to admin:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Réservation annulée avec succès",
      reservation_number: reservation.reservation_number,
    });

  } catch (error) {
    console.error("Error in cancel reservation:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
