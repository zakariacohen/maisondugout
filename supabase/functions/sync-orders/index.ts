import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

// Webhook secret for authentication (set this in your secrets)
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') || 'your-default-secret';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook secret
    const webhookSecret = req.headers.get('x-webhook-secret');
    if (webhookSecret !== WEBHOOK_SECRET) {
      console.error('Invalid webhook secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = await req.json();
    console.log('Received webhook payload:', JSON.stringify(payload));

    // Validate required fields
    if (!payload.customer_name || !payload.phone_number || !payload.total) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: customer_name, phone_number, total' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare order data with validation
    const orderData = {
      customer_name: String(payload.customer_name).trim().slice(0, 100),
      phone_number: String(payload.phone_number).trim().slice(0, 20),
      delivery_address: payload.delivery_address ? String(payload.delivery_address).trim().slice(0, 200) : null,
      total: Number(payload.total) || 0,
      delivered: Boolean(payload.delivered) || false,
      delivery_date: payload.delivery_date ? new Date(payload.delivery_date).toISOString() : null,
      order_source: payload.order_source ? String(payload.order_source).trim().slice(0, 50) : 'v0_sync',
    };

    console.log('Inserting order:', JSON.stringify(orderData));

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Error inserting order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to insert order', details: orderError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order inserted successfully:', order.id);

    // Insert order items if provided
    if (payload.items && Array.isArray(payload.items) && payload.items.length > 0) {
      const orderItems = payload.items.map((item: any) => ({
        order_id: order.id,
        product: String(item.product || item.name || 'Unknown').trim().slice(0, 100),
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price || item.price) || 0,
        total: Number(item.total) || (Number(item.quantity) || 1) * (Number(item.unit_price || item.price) || 0),
      }));

      console.log('Inserting order items:', JSON.stringify(orderItems));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error inserting order items:', itemsError);
        // Order was created but items failed - log but don't fail the whole request
      } else {
        console.log('Order items inserted successfully');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order synced successfully',
        order_id: order.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
