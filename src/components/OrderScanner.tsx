import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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
  onScanningChange?: (isScanning: boolean) => void;
}

export const OrderScanner = ({ onScanComplete, onScanningChange }: OrderScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImagesSelect = async (selectedFiles: FileList) => {
    if (!selectedFiles.length) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      newFiles.push(file);
      
      // Create preview
      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newPreviews.push(preview);
    }

    setFiles(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const scanAllImages = async () => {
    if (previews.length === 0) return;

    setIsScanning(true);
    onScanningChange?.(true);
    
    try {
      const allScannedData: ScannedData = {
        customerName: null,
        phoneNumber: null,
        deliveryDate: null,
        items: []
      };

      for (let i = 0; i < previews.length; i++) {
        setCurrentPreviewIndex(i);
        const base64Image = previews[i];
        
        console.log(`Scanning image ${i + 1}/${previews.length}...`);
        
        const { data, error } = await supabase.functions.invoke('scan-order', {
          body: { image: base64Image }
        });

        if (error) {
          console.error('Scan error:', error);
          continue;
        }

        if (data?.error) {
          console.error('AI error:', data.error);
          continue;
        }

        // Merge scanned data
        if (data) {
          if (data.customerName && !allScannedData.customerName) {
            allScannedData.customerName = data.customerName;
          }
          if (data.phoneNumber && !allScannedData.phoneNumber) {
            allScannedData.phoneNumber = data.phoneNumber;
          }
          if (data.deliveryDate && !allScannedData.deliveryDate) {
            allScannedData.deliveryDate = data.deliveryDate;
          }
          if (data.items && Array.isArray(data.items)) {
            allScannedData.items = [...(allScannedData.items || []), ...data.items];
          }
        }
      }

      if (allScannedData.items?.length || allScannedData.customerName || allScannedData.phoneNumber) {
        onScanComplete(allScannedData);
        toast.success(`${previews.length} photo(s) scannée(s) avec succès!`);
      } else {
        toast.warning("Aucune donnée extraite des images");
      }
      
      clearPreviews();
    } catch (error: any) {
      console.error('Error scanning images:', error);
      toast.error(`Erreur lors du scan: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsScanning(false);
      onScanningChange?.(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleImagesSelect(selectedFiles);
    }
  };

  const clearPreviews = () => {
    setPreviews([]);
    setFiles([]);
    setCurrentPreviewIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (currentPreviewIndex >= previews.length - 1 && currentPreviewIndex > 0) {
      setCurrentPreviewIndex(currentPreviewIndex - 1);
    }
  };

  const goToPrevious = () => {
    setCurrentPreviewIndex(prev => (prev > 0 ? prev - 1 : previews.length - 1));
  };

  const goToNext = () => {
    setCurrentPreviewIndex(prev => (prev < previews.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-4">
      {previews.length === 0 ? (
        <div className="flex flex-col gap-2 w-full sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onScanningChange?.(true);
              cameraInputRef.current?.click();
            }}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Prendre une photo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onScanningChange?.(true);
              fileInputRef.current?.click();
            }}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Uploader photos
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
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Preview carousel */}
          <div className="relative rounded-lg overflow-hidden border-2 border-border">
            <img 
              src={previews[currentPreviewIndex]} 
              alt={`Preview ${currentPreviewIndex + 1}`} 
              className="w-full h-48 object-contain bg-muted"
            />
            
            {isScanning && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Scan {currentPreviewIndex + 1}/{previews.length}...
                  </p>
                </div>
              </div>
            )}

            {/* Navigation arrows */}
            {previews.length > 1 && !isScanning && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-1 top-1/2 -translate-y-1/2 bg-background/80 h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-background/80 h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Remove current image */}
            {!isScanning && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeImage(currentPreviewIndex)}
                className="absolute top-2 right-2 bg-background/80 h-7 w-7 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}

            {/* Image counter */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-2 py-0.5 rounded text-xs">
              {currentPreviewIndex + 1} / {previews.length}
            </div>
          </div>

          {/* Thumbnails */}
          {previews.length > 1 && (
            <div className="flex gap-1 overflow-x-auto pb-1">
              {previews.map((preview, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentPreviewIndex(index)}
                  className={`flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden ${
                    index === currentPreviewIndex ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img src={preview} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="flex-1"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-1" />
              Ajouter
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={clearPreviews}
              disabled={isScanning}
              size="sm"
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={scanAllImages}
              disabled={isScanning}
              className="flex-1"
              size="sm"
            >
              {isScanning ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : null}
              Scanner ({previews.length})
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};
