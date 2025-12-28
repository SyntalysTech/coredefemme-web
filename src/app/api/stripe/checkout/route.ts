import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, isProductFree } from '@/lib/stripe';

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
      user_id,
    } = body;

    // Validaciones
    if (!service_slug || !customer_email || !customer_name) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Si es producto gratuito, no necesitamos Stripe
    if (isProductFree(service_slug, is_pack)) {
      return NextResponse.json({
        isFree: true,
        message: 'Producto gratuito, no requiere pago',
      });
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
      metadata: user_id ? { user_id } : undefined,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);

    // Manejar errores específicos
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

    if (errorMessage === 'FREE_PRODUCT') {
      return NextResponse.json({
        isFree: true,
        message: 'Producto gratuito, no requiere pago',
      });
    }

    if (errorMessage.includes('not available yet')) {
      return NextResponse.json(
        { error: 'Ce produit n\'est pas encore disponible' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear sesión de pago' },
      { status: 500 }
    );
  }
}
