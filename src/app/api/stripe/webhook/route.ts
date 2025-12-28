import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { verifyWebhookSignature } from '@/lib/stripe';
import { sendEmail, packPurchaseTemplate, reservationConfirmationTemplate } from '@/lib/email';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verificar firma
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Manejar eventos
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  const {
    customer_name,
    customer_email,
    service_slug,
    is_pack,
    session_id,
  } = metadata;

  const isPack = is_pack === 'true';

  if (isPack) {
    // Compra de pack de sesiones
    await handlePackPurchase({
      customerName: customer_name,
      customerEmail: customer_email,
      serviceSlug: service_slug,
      paymentIntentId: session.payment_intent as string,
      amountPaid: (session.amount_total || 0) / 100,
    });
  } else if (session_id) {
    // Pago de sesión individual
    await handleSessionPayment({
      sessionId: session_id,
      customerName: customer_name,
      customerEmail: customer_email,
      paymentIntentId: session.payment_intent as string,
      amountPaid: (session.amount_total || 0) / 100,
    });
  }
}

async function handlePackPurchase({
  customerName,
  customerEmail,
  serviceSlug,
  paymentIntentId,
  amountPaid,
}: {
  customerName: string;
  customerEmail: string;
  serviceSlug: string;
  paymentIntentId: string;
  amountPaid: number;
}) {
  // Obtener servicio
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('slug', serviceSlug)
    .single();

  if (!service) return;

  // Calcular fecha de expiración (6 meses)
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 6);

  // Crear pack para el cliente
  const { data: pack } = await supabase
    .from('customer_packs')
    .insert({
      customer_email: customerEmail,
      customer_name: customerName,
      service_id: service.id,
      total_sessions: service.pack_sessions || 6,
      amount_paid: amountPaid,
      payment_intent_id: paymentIntentId,
      status: 'active',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  // Enviar email de confirmación
  await sendEmail({
    to: customerEmail,
    subject: `Pack ${service.pack_sessions} séances activé - ${service.name}`,
    html: packPurchaseTemplate({
      customerName,
      serviceName: service.name,
      totalSessions: service.pack_sessions || 6,
      amountPaid: `CHF ${amountPaid}.-`,
      expiresAt: expiresAt.toLocaleDateString('fr-CH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    }),
  });

  // Log
  await supabase.from('email_logs').insert({
    recipient_email: customerEmail,
    recipient_name: customerName,
    email_type: 'pack_confirmation',
    subject: `Pack activé - ${service.name}`,
    status: 'sent',
    related_id: pack?.id,
  });
}

async function handleSessionPayment({
  sessionId,
  customerName,
  customerEmail,
  paymentIntentId,
  amountPaid,
}: {
  sessionId: string;
  customerName: string;
  customerEmail: string;
  paymentIntentId: string;
  amountPaid: number;
}) {
  // Buscar reservación
  const { data: reservation } = await supabase
    .from('reservations')
    .select(`
      *,
      session:sessions (
        *,
        service:services (*)
      )
    `)
    .eq('session_id', sessionId)
    .eq('customer_email', customerEmail)
    .single();

  if (!reservation) return;

  // Actualizar reservación con pago
  await supabase
    .from('reservations')
    .update({
      payment_status: 'paid',
      payment_intent_id: paymentIntentId,
      amount_paid: amountPaid,
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', reservation.id);

  // Enviar email de confirmación
  const sessionDate = new Date(reservation.session.session_date).toLocaleDateString('fr-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const location = reservation.session.service.service_type === 'home'
    ? 'À votre domicile'
    : 'Rue de la Maltière 82H, 2904 Bressaucourt';

  await sendEmail({
    to: customerEmail,
    subject: `Paiement confirmé - ${reservation.session.service.name}`,
    html: reservationConfirmationTemplate({
      customerName,
      reservationNumber: reservation.reservation_number,
      serviceName: reservation.session.service.name,
      sessionDate,
      sessionTime: reservation.session.start_time.slice(0, 5),
      location,
      price: `CHF ${amountPaid}.- (Payé)`,
    }),
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata || {};
  const { customer_email } = metadata;

  if (customer_email) {
    // Actualizar reservación si existe
    await supabase
      .from('reservations')
      .update({
        payment_status: 'failed',
      })
      .eq('customer_email', customer_email)
      .eq('payment_intent_id', paymentIntent.id);
  }

  console.log('Payment failed for:', customer_email);
}
