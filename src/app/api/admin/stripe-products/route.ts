import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    // Obtener todos los productos activos de Stripe
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    // Obtener todos los precios
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    // Obtener las últimas sesiones de checkout completadas (compras)
    const checkoutSessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: 'complete',
      expand: ['data.line_items'],
    });

    // Formatear productos
    const formattedProducts = products.data.map((product) => {
      const productPrices = prices.data.filter(
        (price) => (price.product as string) === product.id ||
                   (typeof price.product === 'object' && price.product.id === product.id)
      );

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        images: product.images,
        active: product.active,
        metadata: product.metadata,
        prices: productPrices.map((price) => ({
          id: price.id,
          unit_amount: price.unit_amount,
          currency: price.currency,
          type: price.type,
          nickname: price.nickname,
        })),
        created: product.created,
      };
    });

    // Formatear compras recientes
    const recentPurchases = checkoutSessions.data
      .filter((session) => session.payment_status === 'paid')
      .map((session) => ({
        id: session.id,
        customer_email: session.customer_email,
        customer_name: session.metadata?.customer_name || session.customer_details?.name,
        amount_total: session.amount_total,
        currency: session.currency,
        created: session.created,
        metadata: session.metadata,
        payment_status: session.payment_status,
        is_pack: session.metadata?.is_pack === 'true',
        service_slug: session.metadata?.service_slug,
      }));

    return NextResponse.json({
      products: formattedProducts,
      purchases: recentPurchases,
      stats: {
        totalProducts: products.data.length,
        totalPurchases: recentPurchases.length,
        totalRevenue: recentPurchases.reduce((sum, p) => sum + (p.amount_total || 0), 0) / 100,
      },
    });
  } catch (error) {
    console.error('Error fetching Stripe data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Stripe data' },
      { status: 500 }
    );
  }
}
