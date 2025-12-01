import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('Processing voice-to-text request...');

    // Use Lovable AI to analyze the audio and extract order information
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // First, get a temporary public URL for the audio
    const audioArrayBuffer = processBase64Chunks(audio).buffer;
    const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/webm' });
    
    // Upload audio to storage temporarily
    const fileName = `temp-audio-${Date.now()}.webm`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('delivery-images')
      .upload(fileName, audioBlob, {
        contentType: 'audio/webm',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('delivery-images')
      .getPublicUrl(fileName);

    const audioUrl = urlData.publicUrl;
    console.log('Audio uploaded to:', audioUrl);

    // Call Lovable AI to transcribe and analyze
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
            role: 'system',
            content: 'Tu es un assistant qui transcrit des commandes de pâtisserie en français. Transcris exactement ce qui est dit dans l\'audio. Identifie si possible : le nom du client, le numéro de téléphone, les produits commandés avec leurs quantités, et la date de livraison.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Transcris cette commande vocale de pâtisserie :'
              },
              {
                type: 'audio_url',
                audio_url: {
                  url: audioUrl
                }
              }
            ]
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', errorText);
      
      // Clean up temporary file
      await supabase.storage.from('delivery-images').remove([fileName]);
      
      throw new Error(`Lovable AI error: ${errorText}`);
    }

    const aiResult = await aiResponse.json();
    console.log('AI raw result:', aiResult);

    const messageContent = aiResult.choices?.[0]?.message?.content;
    let transcription = '';

    if (typeof messageContent === 'string') {
      transcription = messageContent;
    } else if (Array.isArray(messageContent)) {
      const textPart = messageContent.find((part: any) =>
        (part.type === 'output_text' || part.type === 'text') && typeof part.text === 'string'
      );
      if (textPart) {
        transcription = textPart.text;
      } else {
        transcription = JSON.stringify(messageContent);
      }
    } else if (messageContent && typeof messageContent === 'object') {
      if (typeof (messageContent as any).text === 'string') {
        transcription = (messageContent as any).text;
      } else {
        transcription = JSON.stringify(messageContent);
      }
    }
    
    console.log('Transcription result:', transcription);

    // Clean up temporary file
    await supabase.storage.from('delivery-images').remove([fileName]);

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
