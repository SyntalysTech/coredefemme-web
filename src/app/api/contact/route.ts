import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendEmail,
  contactConfirmationTemplate,
  adminNewContactTemplate,
} from '@/lib/email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Obtener mensajes de contacto (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: contacts, error } = await query;

    if (error) throw error;

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Error al obtener mensajes' },
      { status: 500 }
    );
  }
}

// POST - Enviar mensaje de contacto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validaciones
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, email, message' },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Sanitizar mensaje (prevenir XSS)
    const sanitizedMessage = message
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .slice(0, 5000); // Limitar longitud

    // Guardar en base de datos
    const { data: contact, error: dbError } = await supabase
      .from('contacts')
      .insert({
        name,
        email,
        phone,
        subject,
        message: sanitizedMessage,
        status: 'new',
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // Enviar email de confirmación al usuario
    const customerEmailResult = await sendEmail({
      to: email,
      subject: 'Message reçu - Core de Femme',
      html: contactConfirmationTemplate({
        customerName: name,
        subject: subject || '',
        message: sanitizedMessage,
      }),
    });

    // Enviar notificación al admin
    const adminEmailResult = await sendEmail({
      to: 'contact@coredefemme.ch',
      subject: `Nouveau message: ${subject || 'Contact'}`,
      html: adminNewContactTemplate({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        subject,
        message: sanitizedMessage,
      }),
      replyTo: email, // Para que el admin pueda responder directamente
    });

    // Guardar logs de emails
    await supabase.from('email_logs').insert([
      {
        recipient_email: email,
        recipient_name: name,
        email_type: 'contact_confirmation',
        subject: 'Message reçu - Core de Femme',
        status: customerEmailResult.success ? 'sent' : 'failed',
        resend_id: customerEmailResult.id,
        related_id: contact.id,
        error_message: customerEmailResult.error,
      },
      {
        recipient_email: 'contact@coredefemme.ch',
        recipient_name: 'Chloé (Admin)',
        email_type: 'admin_contact_notification',
        subject: `Nouveau message: ${subject || 'Contact'}`,
        status: adminEmailResult.success ? 'sent' : 'failed',
        resend_id: adminEmailResult.id,
        related_id: contact.id,
        error_message: adminEmailResult.error,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Merci pour votre message ! Je vous répondrai dans les plus brefs délais.',
    }, { status: 201 });

  } catch (error) {
    console.error('Error sending contact:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
