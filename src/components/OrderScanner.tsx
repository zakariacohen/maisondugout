import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ScannedData {
  customerName?: string | null;
  phoneNumber?: string | null;
  deliveryDate?: string | null;
  items?: Array<{
    product: string;
    quantity: number;
  }>;
}

interface OrderScannerProps {
  onScanComplete: (data: ScannedData) => void;
}

export const OrderScanner = ({ onScanComplete }: OrderScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (file: File) => {
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Convert to base64 for AI
    const base64Reader = new FileReader();
    base64Reader.onloadend = async () => {
      const base64Image = base64Reader.result as string;
      await scanImage(base64Image);
    };
    base64Reader.readAsDataURL(file);
  };

  const scanImage = async (base64Image: string) => {
    setIsScanning(true);
    try {
      console.log('Sending image to scan-order function...');
      
      const { data, error } = await supabase.functions.invoke('scan-order', {
        body: { image: base64Image }
      });

      if (error) {
        console.error('Scan error:', error);
        throw error;
      }

      console.log('Scan result:', data);

      if (data.error) {
        throw new Error(data.error);
      }

      // Pass extracted data to parent
      onScanComplete(data);
      
      toast.success("Commande scannée avec succès!");
      setPreview(null);
    } catch (error) {
      console.error('Error scanning image:', error);
      toast.error("Erreur lors du scan de la commande");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Prendre une photo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Uploader une photo
          </Button>
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInput}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden border-2 border-border">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-48 object-contain bg-muted"
            />
            {isScanning && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Scan en cours...</p>
                </div>
              </div>
            )}
          </div>
          {!isScanning && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearPreview}
              className="absolute top-2 right-2 bg-background/80"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
