import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail, adminReplyTemplate } from "@/lib/email";

// Crear cliente Supabase con service role para operaciones admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contact_id, reply_message } = body;

    if (!contact_id || !reply_message) {
      return NextResponse.json(
        { error: "Contact ID et message de réponse requis" },
        { status: 400 }
      );
    }

    // Obtener el contacto
    const { data: contact, error: fetchError } = await supabaseAdmin
      .from("contacts")
      .select("*")
      .eq("id", contact_id)
      .single();

    if (fetchError || !contact) {
      return NextResponse.json(
        { error: "Contact non trouvé" },
        { status: 404 }
      );
    }

    // Enviar email de respuesta
    const emailResult = await sendEmail({
      to: contact.email,
      subject: `Re: ${contact.subject || "Votre message"} - Core de Femme`,
      html: adminReplyTemplate({
        customerName: contact.name,
        originalSubject: contact.subject,
        originalMessage: contact.message,
        replyMessage: reply_message,
      }),
    });

    if (!emailResult.success) {
      // Log del error
      await supabaseAdmin.from('email_logs').insert({
        recipient_email: contact.email,
        recipient_name: contact.name,
        email_type: 'admin_reply',
        subject: `Re: ${contact.subject || "Votre message"} - Core de Femme`,
        status: 'failed',
        error_message: emailResult.error,
        related_id: contact_id,
      });

      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    // Actualizar el estado del contacto a "replied"
    await supabaseAdmin
      .from("contacts")
      .update({
        status: "replied",
        replied_at: new Date().toISOString(),
        notes: reply_message, // Guardar la respuesta en notes
      })
      .eq("id", contact_id);

    // Log del email enviado
    await supabaseAdmin.from('email_logs').insert({
      recipient_email: contact.email,
      recipient_name: contact.name,
      email_type: 'admin_reply',
      subject: `Re: ${contact.subject || "Votre message"} - Core de Femme`,
      status: 'sent',
      resend_id: emailResult.id,
      related_id: contact_id,
    });

    return NextResponse.json({
      success: true,
      message: "Réponse envoyée avec succès",
    });

  } catch (error) {
    console.error("Error sending reply:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
