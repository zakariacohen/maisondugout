import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Order {
  id: string;
  customer_name: string;
  phone_number: string;
  delivery_date: string;
  total: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate the time 48 hours from now
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + 48);
    
    // Get the start and end of the target day (48h from now)
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Checking for orders between', startOfDay.toISOString(), 'and', endOfDay.toISOString());

    // Query orders that have a delivery date in 48 hours and are not delivered yet
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, customer_name, phone_number, delivery_date, total')
      .eq('delivered', false)
      .gte('delivery_date', startOfDay.toISOString())
      .lte('delivery_date', endOfDay.toISOString());

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }

    console.log(`Found ${orders?.length || 0} orders to remind about`);

    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER'); // e.g., whatsapp:+14155238886
    const recipientNumber = Deno.env.get('BUSINESS_WHATSAPP_NUMBER'); // Your business WhatsApp number

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber || !recipientNumber) {
      console.log('Twilio credentials not configured. Orders found:', orders);
      return new Response(
        JSON.stringify({
          message: 'Twilio credentials not configured',
          ordersFound: orders?.length || 0,
          orders: orders,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const notifications = [];

    // Send WhatsApp message for each order
    for (const order of orders || []) {
      const message = `🔔 Rappel de livraison\n\nCommande pour: ${order.customer_name}\nTéléphone: ${order.phone_number}\nMontant: ${order.total} DH\nLivraison prévue: ${new Date(order.delivery_date).toLocaleDateString('fr-FR', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}\n\nN'oubliez pas de préparer cette commande!`;

      try {
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              From: twilioWhatsAppNumber,
              To: `whatsapp:${recipientNumber}`,
              Body: message,
            }),
          }
        );

        const result = await response.json();
        
        if (response.ok) {
          console.log(`Notification sent for order ${order.id}`);
          notifications.push({
            orderId: order.id,
            status: 'sent',
            messageSid: result.sid,
          });
        } else {
          console.error(`Failed to send notification for order ${order.id}:`, result);
          notifications.push({
            orderId: order.id,
            status: 'failed',
            error: result.message,
          });
        }
      } catch (error) {
        console.error(`Error sending notification for order ${order.id}:`, error);
        notifications.push({
          orderId: order.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Reminder check completed',
        ordersFound: orders?.length || 0,
        notifications,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in whatsapp-reminder function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
