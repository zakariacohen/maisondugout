import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      throw new Error('No image data provided');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Scanning order image with AI...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Tu es un assistant qui extrait les informations de commandes depuis des images de commandes écrites à la main.
Extrait les informations suivantes si elles sont disponibles:
- Nom du client (customerName)
- Numéro de téléphone (phoneNumber)
- Date de livraison (deliveryDate) au format YYYY-MM-DD
- Liste des produits avec leurs quantités, prix unitaires et totaux (items)

Retourne UNIQUEMENT un objet JSON valide avec cette structure:
{
  "customerName": "nom ou null",
  "phoneNumber": "numéro ou null", 
  "deliveryDate": "YYYY-MM-DD ou null",
  "items": [
    {
      "product": "nom du produit", 
      "quantity": nombre ou null,
      "unitPrice": prix_unitaire ou null,
      "total": total ou null
    }
  ]
}

Si une information n'est pas lisible ou absente, mets null pour ce champ spécifique. 
Si le total est écrit mais pas le prix unitaire, essaie de calculer: unitPrice = total / quantity.
Si le prix unitaire est écrit mais pas le total, calcule: total = unitPrice * quantity.
Ne retourne RIEN d'autre que le JSON.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extrait les informations de cette commande:"
              },
              {
                type: "image_url",
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes dépassée, réessayez plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédit insuffisant, ajoutez des crédits à votre workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erreur du service AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    console.log('AI response:', content);

    // Parse the JSON response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extractedData = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse extracted data');
    }

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in scan-order function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
