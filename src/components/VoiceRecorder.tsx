import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

export const VoiceRecorder = ({ onTranscriptionComplete }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Enregistrement en cours...");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Erreur lors de l'accès au microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Send to edge function
        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { audio: base64Audio }
        });

        if (error) {
          throw error;
        }

        if (data?.text) {
          onTranscriptionComplete(data.text);
          toast.success("Transcription terminée !");
        } else {
          throw new Error('No transcription received');
        }
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error("Erreur lors de la transcription");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex gap-2">
      {!isRecording && !isProcessing && (
        <Button
          type="button"
          variant="outline"
          onClick={startRecording}
          className="flex-1 hover:bg-primary/5"
        >
          <Mic className="w-4 h-4 mr-2" />
          Commande Vocale
        </Button>
      )}
      
      {isRecording && (
        <Button
          type="button"
          variant="destructive"
          onClick={stopRecording}
          className="flex-1 animate-pulse"
        >
          <Square className="w-4 h-4 mr-2" />
          Arrêter l'enregistrement
        </Button>
      )}

      {isProcessing && (
        <Button
          type="button"
          variant="outline"
          disabled
          className="flex-1"
        >
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Transcription en cours...
        </Button>
      )}
    </div>
  );
};
