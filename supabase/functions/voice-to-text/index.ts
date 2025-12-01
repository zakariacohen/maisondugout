import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('Processing voice-to-text request, audio length:', audio.length);

    // Call Lovable AI (Gemini) to transcribe the audio
    // Gemini expects inline_data with base64 audio
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Transcris cette commande vocale de pâtisserie en français/darija. Identifie si possible : le nom du client, le numéro de téléphone, les produits commandés avec leurs quantités, et la date de livraison. Donne la transcription complète de ce qui est dit.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:audio/webm;base64,${audio}`
                }
              }
            ]
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`Lovable AI error (${aiResponse.status}): ${errorText}`);
    }

    const aiResult = await aiResponse.json();
    console.log('AI result received');

    const messageContent = aiResult.choices?.[0]?.message?.content;
    let transcription = '';

    if (typeof messageContent === 'string') {
      transcription = messageContent;
    } else if (Array.isArray(messageContent)) {
      const textPart = messageContent.find((part: any) =>
        part.type === 'text' && typeof part.text === 'string'
      );
      transcription = textPart ? textPart.text : JSON.stringify(messageContent);
    } else if (messageContent && typeof messageContent === 'object') {
      transcription = (messageContent as any).text || JSON.stringify(messageContent);
    }
    
    if (!transcription) {
      throw new Error('No transcription received from AI');
    }

    console.log('Transcription completed, length:', transcription.length);

    return new Response(
      JSON.stringify({ text: transcription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in voice-to-text function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
