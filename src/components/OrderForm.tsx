import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ShoppingBag, Loader2, CalendarIcon, Check, ChevronsUpDown, Grid3x3 } from "lucide-react";
import { toast } from "sonner";
import type { Order, OrderItem } from "@/pages/Index";
import { useProducts, Product } from "@/hooks/useProducts";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { OrderScanner } from "./OrderScanner";
import { VoiceRecorder } from "./VoiceRecorder";

interface OrderFormProps {
  onAddOrder: (order: Order) => void;
  onUpdateOrder?: (order: Order) => void;
  editingOrder?: Order | null;
  onCancelEdit?: () => void;
  onScanningChange?: (isScanning: boolean) => void;
}

const FORM_STORAGE_KEY = 'orderFormDraft';

interface FormDraft {
  customerName: string;
  phoneNumber: string;
  deliveryAddress: string;
  deliveryDate: string | null;
  items: OrderItem[];
}

const saveFormDraft = (draft: FormDraft) => {
  try {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draft));
  } catch (e) {
    console.error('Error saving form draft:', e);
  }
};

const loadFormDraft = (): FormDraft | null => {
  try {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Error loading form draft:', e);
    return null;
  }
};

const clearFormDraft = () => {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing form draft:', e);
  }
};

export const OrderForm = ({ onAddOrder, onUpdateOrder, editingOrder, onCancelEdit, onScanningChange }: OrderFormProps) => {
  const { data: products, isLoading } = useProducts();
  
  // Load saved draft on initial mount (only for new orders)
  const initialDraft = !editingOrder ? loadFormDraft() : null;
  
  const [customerName, setCustomerName] = useState(editingOrder?.customerName || initialDraft?.customerName || "");
  const [phoneNumber, setPhoneNumber] = useState(editingOrder?.phoneNumber || initialDraft?.phoneNumber || "");
  const [deliveryAddress, setDeliveryAddress] = useState(editingOrder?.deliveryAddress || initialDraft?.deliveryAddress || "");
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    editingOrder?.deliveryDate || (initialDraft?.deliveryDate ? new Date(initialDraft.deliveryDate) : undefined)
  );
  const [items, setItems] = useState<OrderItem[]>(
    editingOrder?.items || initialDraft?.items || [{ product: "", quantity: 1, unitPrice: 0, total: 0 }]
  );
  const [openCombobox, setOpenCombobox] = useState<number | null>(null);
  const [showProductGrid, setShowProductGrid] = useState<number | null>(null);
  const [gridSearchTerm, setGridSearchTerm] = useState("");
  const lastItemRef = useRef<HTMLDivElement>(null);

  // Save form draft whenever form data changes (only for new orders)
  useEffect(() => {
    if (!editingOrder) {
      const draft: FormDraft = {
        customerName,
        phoneNumber,
        deliveryAddress,
        deliveryDate: deliveryDate?.toISOString() || null,
        items,
      };
      saveFormDraft(draft);
    }
  }, [customerName, phoneNumber, deliveryAddress, deliveryDate, items, editingOrder]);

  // Update form when editingOrder changes
  useEffect(() => {
    if (editingOrder) {
      setCustomerName(editingOrder.customerName);
      setPhoneNumber(editingOrder.phoneNumber);
      setDeliveryAddress(editingOrder.deliveryAddress || "");
      setDeliveryDate(editingOrder.deliveryDate);
      setItems(editingOrder.items);
    }
  }, [editingOrder]);

  const addItem = () => {
    setItems([...items, { product: "", quantity: 1, unitPrice: 0, total: 0 }]);
    // Scroll to last item after adding (mobile UX improvement)
    setTimeout(() => {
      if (lastItemRef.current) {
        lastItemRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate total for this item
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        product: product.name,
        unitPrice: product.price,
        total: newItems[index].quantity * product.price,
      };
      setItems(newItems);
      setShowProductGrid(null); // Close the grid after selection
      setGridSearchTerm(""); // Reset search term
    }
  };

  const handleScanComplete = (scannedData: any) => {
    console.log('Scanned data:', scannedData);
    
    // Update customer name if available
    if (scannedData.customerName) {
      setCustomerName(scannedData.customerName);
    }
    
    // Update phone number if available
    if (scannedData.phoneNumber) {
      setPhoneNumber(scannedData.phoneNumber);
    }
    
    // Update delivery date if available
    if (scannedData.deliveryDate) {
      try {
        const date = new Date(scannedData.deliveryDate);
        if (!isNaN(date.getTime())) {
          setDeliveryDate(date);
        }
      } catch (error) {
        console.error('Error parsing delivery date:', error);
      }
    }
    
    // Update items if available
    if (scannedData.items && Array.isArray(scannedData.items) && scannedData.items.length > 0) {
      const newItems = scannedData.items.map((scannedItem: any) => {
        const product = products?.find(p => 
          p.name.toLowerCase().includes(scannedItem.product.toLowerCase()) ||
          scannedItem.product.toLowerCase().includes(p.name.toLowerCase())
        );
        
        // Use scanned quantity/price if available, otherwise use defaults
        const quantity = scannedItem.quantity || (product ? 1 : 0);
        const unitPrice = scannedItem.unitPrice || (product?.price || 0);
        const total = scannedItem.total || (quantity * unitPrice);
        
        if (product) {
          return {
            product: product.name,
            quantity,
            unitPrice,
            total,
          };
        }
        
        // If no matching product found, create item with scanned info
        return {
          product: scannedItem.product,
          quantity,
          unitPrice,
          total,
        };
      });
      
      setItems(newItems);
    }
    
    toast.success("Informations extraites avec succès!");
  };

  const handleVoiceTranscription = (text: string) => {
    console.log('Voice transcription:', text);

    const normalized = text.trim();

    // --- Extract customer name ---
    let extractedName: string | null = null;

    const namePatterns = [
      /mon\s+nom\s+est\s+([^,.]+)/i,
      /je\s+m'appelle\s+([^,.]+)/i,
      /(?:client|pour)\s+([^,.]+)/i,
      /(?:nom|client)\s*:?\s*([A-ZÀ-ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-ÿ][a-zà-ÿ]+)*)/i,
    ];

    for (const pattern of namePatterns) {
      const match = normalized.match(pattern);
      if (match && match[1]) {
        extractedName = match[1].trim();
        break;
      }
    }

    if (extractedName) {
      setCustomerName(extractedName);
    }

    // --- Extract phone number anywhere in text ---
    const phonePattern = /((?:\+?212[\s.-]?)?0?\d[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2})/;
    const phoneMatch = normalized.match(phonePattern);
    if (phoneMatch && phoneMatch[1]) {
      const cleaned = phoneMatch[1].replace(/[\s.-]/g, '');
      setPhoneNumber(cleaned);
    }

    // --- Extract products from known catalog ---
    const lowerText = normalized.toLowerCase();
    const productNames = products?.map((p) => p.name.toLowerCase()) || [];
    const mentionedProducts: OrderItem[] = [];

    productNames.forEach((productName) => {
      if (lowerText.includes(productName)) {
        const product = products?.find((p) => p.name.toLowerCase() === productName);
        if (product) {
          const productIndex = lowerText.indexOf(productName);
          const windowStart = Math.max(0, productIndex - 25);
          const windowText = lowerText.substring(windowStart, productIndex);
          const quantityMatch = windowText.match(/(\d{1,3})/);

          const quantity = quantityMatch ? parseInt(quantityMatch[1], 10) : 1;

          mentionedProducts.push({
            product: product.name,
            quantity,
            unitPrice: product.price,
            total: quantity * product.price,
          });
        }
      }
    });

    if (mentionedProducts.length > 0) {
      setItems(mentionedProducts);
    }

    // --- Extract delivery date: numeric or "14 février" ---
    let parsedDate: Date | null = null;

    // Pattern A: numeric date
    const numericDateMatch = normalized.match(
      /(?:livraison|pour le|date)\s*(?:est|du|le)?\s*(\d{1,2}[\s\/. -]\d{1,2}[\s\/. -]\d{2,4})/i
    );
    if (numericDateMatch && numericDateMatch[1]) {
      try {
        const parts = numericDateMatch[1].split(/[\s\/. -]/);
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parts[2].length === 2 ? 2000 + parseInt(parts[2], 10) : parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) parsedDate = d;
      } catch (error) {
        console.error('Error parsing numeric delivery date from voice:', error);
      }
    }

    // Pattern B: "14 février"
    if (!parsedDate) {
      const monthNames: Record<string, number> = {
        janvier: 0,
        fevrier: 1,
        février: 1,
        mars: 2,
        avril: 3,
        mai: 4,
        juin: 5,
        juillet: 6,
        aout: 7,
        août: 7,
        septembre: 8,
        octobre: 9,
        novembre: 10,
        decembre: 11,
        décembre: 11,
      };

      const monthPattern = /(?:livraison|pour le|pour|date)\s*(?:est|du|le)?\s*(\d{1,2})\s+([a-zà-ÿ]+)/i;
      const match = normalized.toLowerCase().match(monthPattern);
      if (match && match[1] && match[2]) {
        const day = parseInt(match[1], 10);
        const rawMonth = match[2];
        const monthKey = rawMonth.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const monthIndex =
          monthNames[monthKey] ?? monthNames[rawMonth as keyof typeof monthNames];
        if (monthIndex !== undefined) {
          const year = new Date().getFullYear();
          const d = new Date(year, monthIndex, day);
          if (!isNaN(d.getTime())) parsedDate = d;
        }
      }
    }

    if (parsedDate) {
      setDeliveryDate(parsedDate);
    }

    toast.success("Commande vocale traitée !");
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      toast.error("Veuillez remplir le nom du client");
      return;
    }

    if (items.some(item => !item.product.trim() || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error("Veuillez remplir tous les produits correctement");
      return;
    }

    const order: Order = {
      id: editingOrder?.id || "",
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      deliveryAddress: deliveryAddress.trim() || undefined,
      items: items.map(item => ({
        ...item,
        product: item.product.trim(),
      })),
      total: calculateTotal(),
      date: editingOrder?.date || new Date(),
      delivered: editingOrder?.delivered || false,
      deliveryImageUrl: editingOrder?.deliveryImageUrl,
      deliveryDate: deliveryDate,
    };

    // Check if we're updating an existing order
    if (editingOrder?.id && onUpdateOrder) {
      console.log("Updating order:", order.id, "with items:", order.items.length);
      onUpdateOrder(order);
    } else {
      console.log("Adding new order");
      onAddOrder(order);
    }
    
    // Clear saved draft and reset form for new orders
    if (!editingOrder) {
      clearFormDraft();
      setCustomerName("");
      setPhoneNumber("");
      setDeliveryAddress("");
      setDeliveryDate(undefined);
      setItems([{ product: "", quantity: 1, unitPrice: 0, total: 0 }]);
    }
  };

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <div>
            <CardTitle className="text-xl font-serif">
              {editingOrder ? "Modifier la Commande" : "Nouvelle Commande"}
            </CardTitle>
            <CardDescription>
              {editingOrder ? "Modifiez les détails de la commande" : "Ajoutez les détails de la commande"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Scanner and Voice Section */}
          <div className="space-y-4 pb-6 border-b border-border">
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm">
                📷
              </span>
              Scanner ou Dicter une Commande
            </h3>
            <div className="space-y-3">
              <OrderScanner 
                onScanComplete={handleScanComplete}
                onScanningChange={onScanningChange}
              />
              <VoiceRecorder onTranscriptionComplete={handleVoiceTranscription} />
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">
                1
              </span>
              Informations Client
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nom du Client</Label>
                <Input
                  id="customerName"
                  placeholder="Ex: Ahmed Alami"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="transition-all focus:shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Numéro de Téléphone (optionnel)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Ex: 0612345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="transition-all focus:shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Adresse de Livraison (optionnelle)</Label>
                <Input
                  id="deliveryAddress"
                  placeholder="Ex: 123 Rue Mohammed V, Casablanca"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="transition-all focus:shadow-sm"
                  maxLength={200}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date de Livraison (optionnelle)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deliveryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? format(deliveryDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4 relative">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">
                  2
                </span>
                Produits
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="hover:bg-primary/5 hidden sm:flex"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </div>
            
            {/* Floating Add Button for Mobile */}
            <Button
              type="button"
              onClick={addItem}
              className="fixed bottom-24 right-4 z-50 rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 sm:hidden"
              size="icon"
            >
              <Plus className="w-6 h-6" />
            </Button>

            <div className="space-y-3">
              {items.map((item, index) => (
                <Card 
                  key={index} 
                  ref={index === items.length - 1 ? lastItemRef : null}
                  className="border-border/50 bg-muted/30"
                >
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12 sm:col-span-5">
                        <Label className="text-xs">Produit</Label>
                        {isLoading ? (
                          <div className="mt-1 h-9 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {/* Grid View Dialog - Mobile Friendly */}
                            <Dialog 
                              open={showProductGrid === index} 
                              onOpenChange={(open) => {
                                setShowProductGrid(open ? index : null);
                                if (!open) setGridSearchTerm("");
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="flex-1 justify-start font-normal"
                                >
                                  {item.product || "Choisir un produit"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                                <DialogHeader>
                                  <DialogTitle>Choisir un produit</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                                  <Input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    value={gridSearchTerm}
                                    onChange={(e) => setGridSearchTerm(e.target.value)}
                                    className="w-full"
                                  />
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto flex-1">
                                    {products
                                      ?.filter((product) =>
                                        product.name.toLowerCase().includes(gridSearchTerm.toLowerCase())
                                      )
                                      .map((product) => (
                                    <Card
                                      key={product.id}
                                      className={cn(
                                        "cursor-pointer transition-all hover:shadow-md hover:scale-105",
                                        item.product === product.name && "ring-2 ring-primary bg-primary/5"
                                      )}
                                      onClick={() => selectProduct(index, product.id)}
                                    >
                                      <CardContent className="p-4 text-center">
                                        <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-primary" />
                                        <p className="font-semibold text-sm mb-1">{product.name}</p>
                                        <p className="text-primary font-bold">{product.price.toFixed(2)} Dh</p>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Icon to toggle between grid and search */}
                            <Popover open={openCombobox === index} onOpenChange={(open) => setOpenCombobox(open ? index : null)}>
                              <PopoverTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="shrink-0"
                                >
                                  <ChevronsUpDown className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Taper pour chercher..." />
                                  <CommandList>
                                    <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                                    <CommandGroup>
                                      {products?.map((product) => (
                                        <CommandItem
                                          key={product.id}
                                          value={product.name}
                                          onSelect={() => {
                                            selectProduct(index, product.id);
                                            setOpenCombobox(null);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              item.product === product.name ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {product.name} - {product.price.toFixed(2)} Dh
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <Label className="text-xs">Qté</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <Label className="text-xs">Prix</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <Label className="text-xs">Total</Label>
                        <div className="mt-1 h-9 flex items-center font-semibold text-sm text-primary">
                          {item.total.toFixed(2)} Dh
                        </div>
                      </div>
                      <div className="col-span-1 flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-foreground">Total Commande:</span>
              <span className="text-2xl font-bold text-primary">{calculateTotal().toFixed(2)} Dh</span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2">
            {editingOrder && onCancelEdit && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancelEdit}
                className="flex-1"
                size="lg"
              >
                Annuler
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {editingOrder ? "Mettre à jour" : "Enregistrer la Commande"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
