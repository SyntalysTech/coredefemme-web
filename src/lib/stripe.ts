import Stripe from 'stripe';

// Inicializar Stripe (solo server-side)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Productos de Stripe (estos IDs se actualizarán cuando creen la cuenta)
export const STRIPE_PRODUCTS = {
  // Sesiones individuales
  'core-de-maman-single': {
    priceId: 'price_placeholder_core_maman_single',
    name: 'Core de Maman - Séance',
    amount: 2000, // 20 CHF en centimes
  },
  'sculpt-pilates-single': {
    priceId: 'price_placeholder_sculpt_single',
    name: 'Sculpt Pilates - Séance',
    amount: 2000,
  },
  'cours-domicile-single': {
    priceId: 'price_placeholder_domicile_single',
    name: 'Cours à domicile - Séance',
    amount: 4000, // 40 CHF
  },
  // Packs de 6 sesiones (oferta de lanzamiento)
  'core-de-maman-pack': {
    priceId: 'price_placeholder_core_maman_pack',
    name: 'Core de Maman - Pack 6 séances',
    amount: 9000, // 90 CHF (oferta lanzamiento)
    amountAfterOffer: 10800, // 108 CHF después
  },
  'sculpt-pilates-pack': {
    priceId: 'price_placeholder_sculpt_pack',
    name: 'Sculpt Pilates - Pack 6 séances',
    amount: 9000,
    amountAfterOffer: 10800,
  },
  'cours-domicile-pack': {
    priceId: 'price_placeholder_domicile_pack',
    name: 'Cours à domicile - Pack 6 séances',
    amount: 18000, // 180 CHF (oferta)
    amountAfterOffer: 22000, // 220 CHF después
  },
};

// Tipos
export interface CreateCheckoutParams {
  serviceSlug: string;
  isPack: boolean;
  customerEmail: string;
  customerName: string;
  sessionId?: string; // Para reservaciones individuales
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

// Crear sesión de checkout
export async function createCheckoutSession({
  serviceSlug,
  isPack,
  customerEmail,
  customerName,
  sessionId,
  successUrl,
  cancelUrl,
  metadata = {},
}: CreateCheckoutParams) {
  const productKey = `${serviceSlug}-${isPack ? 'pack' : 'single'}` as keyof typeof STRIPE_PRODUCTS;
  const product = STRIPE_PRODUCTS[productKey];

  if (!product) {
    throw new Error(`Product not found: ${productKey}`);
  }

  // Verificar si estamos en modo placeholder
  if (product.priceId.includes('placeholder')) {
    // Modo de desarrollo: crear price inline
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'chf',
            unit_amount: product.amount,
            product_data: {
              name: product.name,
              description: isPack
                ? '6 séances de 45 minutes - Valable 6 mois'
                : 'Séance de 45 minutes',
              images: ['https://coredefemme.ch/logos/logo-core-de-femme-no-bg.png'],
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        customer_name: customerName,
        customer_email: customerEmail,
        service_slug: serviceSlug,
        is_pack: isPack.toString(),
        session_id: sessionId || '',
        ...metadata,
      },
      payment_intent_data: {
        metadata: {
          customer_name: customerName,
          customer_email: customerEmail,
          service_slug: serviceSlug,
        },
      },
      locale: 'fr',
      billing_address_collection: 'required',
    });

    return session;
  }

  // Modo producción: usar priceId real
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: customerEmail,
    line_items: [
      {
        price: product.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      customer_name: customerName,
      customer_email: customerEmail,
      service_slug: serviceSlug,
      is_pack: isPack.toString(),
      session_id: sessionId || '',
      ...metadata,
    },
    locale: 'fr',
    billing_address_collection: 'required',
  });

  return session;
}

// Verificar firma de webhook
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
