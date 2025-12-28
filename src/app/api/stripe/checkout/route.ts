import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';

// POST - Crear sesión de checkout de Stripe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      service_slug,
      is_pack = false,
      customer_email,
      customer_name,
      session_id,
    } = body;

    // Validaciones
    if (!service_slug || !customer_email || !customer_name) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // URLs de retorno
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coredefemme.ch';
    const successUrl = `${baseUrl}/paiement/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/paiement/cancel`;

    // Crear sesión de Stripe
    const checkoutSession = await createCheckoutSession({
      serviceSlug: service_slug,
      isPack: is_pack,
      customerEmail: customer_email,
      customerName: customer_name,
      sessionId: session_id,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error al crear sesión de pago' },
      { status: 500 }
    );
  }
}
