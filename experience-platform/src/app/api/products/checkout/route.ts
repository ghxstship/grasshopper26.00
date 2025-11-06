import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { productId, variantId, quantity } = await req.json();

    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get variant if specified
    let selectedVariant = null;
    let price = product.base_price;
    
    if (variantId) {
      selectedVariant = product.product_variants.find((v: any) => v.id === variantId);
      if (!selectedVariant) {
        return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
      }
      price = selectedVariant.price || product.base_price;
      
      // Check stock
      if (selectedVariant.stock_quantity < quantity) {
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 400 }
        );
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: price * quantity,
        status: 'pending',
        order_items: [{
          product_id: productId,
          variant_id: variantId,
          quantity,
          price,
          name: product.name,
        }],
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: selectedVariant?.name || product.description,
            images: product.images ? [product.images[0]] : [],
          },
          unit_amount: Math.round(price * 100),
        },
        quantity,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop/${product.slug}?canceled=true`,
      metadata: {
        order_id: order.id,
        user_id: user.id,
        product_id: productId,
        variant_id: variantId || '',
      },
    });

    return NextResponse.json({ 
      sessionId: session.id, 
      orderId: order.id,
      clientSecret: session.client_secret,
    });
  } catch (error) {
    console.error('Product checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
