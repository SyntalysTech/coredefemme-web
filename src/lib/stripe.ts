import Stripe from 'stripe';

// Inicializar Stripe (solo server-side)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Productos de Stripe - LIVE
// Sesiones individuales: Core de Maman/Sculpt = GRATIS, Domicile = 40 CHF
// Packs: Core de Maman = 99/120 CHF, Domicile = 180/220 CHF
// Sculpt Pilates: No disponible todavía
export const STRIPE_PRODUCTS = {
  // Sesiones individuales
  'core-de-maman-single': {
    priceId: 'free', // GRATIS - no requiere Stripe
    name: 'Core de Maman - Séance d\'essai',
    amount: 0,
    isFree: true,
  },
  'sculpt-pilates-single': {
    priceId: 'free', // GRATIS - no requiere Stripe (no disponible aún)
    name: 'Sculpt Pilates - Séance d\'essai',
    amount: 0,
    isFree: true,
  },
  'cours-domicile-single': {
    priceId: 'price_1SjRUeRgJLOxeFSVgH8O2GFl', // 40 CHF
    name: 'Cours à domicile - Séance',
    amount: 4000,
    isFree: false,
  },
  // Packs de 6 sesiones (oferta de lanzamiento)
  'core-de-maman-pack': {
    priceId: 'price_1SjRTkRgJLOxeFSVL4Ip0dYx', // 99 CHF oferta
    priceIdNormal: 'price_1SjRUHRgJLOxeFSV4e4EVpTp', // 120 CHF normal
    name: 'Core de Maman - Pack 6 séances',
    amount: 9900, // 99 CHF (oferta lanzamiento)
    amountAfterOffer: 12000, // 120 CHF después
  },
  'sculpt-pilates-pack': {
    priceId: 'placeholder_sculpt_pack', // No disponible aún
    name: 'Sculpt Pilates - Pack 6 séances',
    amount: 9900,
    amountAfterOffer: 12000,
  },
  'cours-domicile-pack': {
    priceId: 'price_1SjRYQRgJLOxeFSV8IbVY1LB', // 180 CHF oferta
    priceIdNormal: 'price_1SjRYhRgJLOxeFSVyfAfqCHU', // 220 CHF normal
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

// Verificar si un producto es gratuito
export function isProductFree(serviceSlug: string, isPack: boolean): boolean {
  const productKey = `${serviceSlug}-${isPack ? 'pack' : 'single'}` as keyof typeof STRIPE_PRODUCTS;
  const product = STRIPE_PRODUCTS[productKey];
  return product?.isFree === true || product?.priceId === 'free';
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

  // Si es gratuito, no necesitamos Stripe
  if (product.isFree || product.priceId === 'free') {
    throw new Error('FREE_PRODUCT'); // Manejar en el cliente
  }

  // Si el priceId contiene placeholder, no está disponible
  if (product.priceId.includes('placeholder')) {
    throw new Error(`Product not available yet: ${productKey}`);
  }

  // Usar priceId real de Stripe
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
