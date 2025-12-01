import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Minus, CalendarIcon, ShoppingBag, Check, Package, icons, LucideIcon, Search } from "lucide-react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const orderSchema = z.object({
  customerName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  phoneNumber: z.string().trim().min(10, "Numéro invalide").max(20),
});

export default function PublicOrder() {
  const { data: products, isLoading } = useProducts();
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const addToCart = (productId: string, productName: string, price: number) => {
    const existing = items.find(item => item.productId === productId);
    if (existing) {
      updateQuantity(productId, existing.quantity + 1);
    } else {
      setItems([...items, {
        productId,
        productName,
        quantity: 1,
        unitPrice: price,
        total: price
      }]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setItems(items.filter(item => item.productId !== productId));
      return;
    }
    setItems(items.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.unitPrice }
        : item
    ));
  };

  const calculateTotal = () => items.reduce((sum, item) => sum + item.total, 0);

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    try {
      orderSchema.parse({ customerName, phoneNumber });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    if (items.length === 0) {
      toast.error("Veuillez ajouter au moins un produit à votre commande");
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName.trim(),
          phone_number: phoneNumber.trim(),
          total: calculateTotal(),
          delivered: false,
          delivery_date: deliveryDate?.toISOString() || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.total,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderSuccess(true);
      toast.success("Commande envoyée avec succès ! Nous vous contacterons bientôt.");
      
      // Reset form
      setTimeout(() => {
        setCustomerName("");
        setPhoneNumber("");
        setDeliveryDate(undefined);
        setItems([]);
        setOrderSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("Erreur lors de l'envoi de la commande. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">Commande Reçue !</h2>
            <p className="text-muted-foreground">
              Merci {customerName} ! Nous vous contacterons bientôt pour confirmer votre commande.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShoppingBag className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-serif font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Commander en Ligne
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Passez votre commande facilement et recevez une confirmation rapidement
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Products Selection */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-serif flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                  Choisissez vos Produits
                </CardTitle>
                <CardDescription>Sélectionnez les produits que vous souhaitez commander</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Chargement des produits...</div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredProducts.map((product) => {
                      const IconComponent = (icons[product.icon as keyof typeof icons] || Package) as LucideIcon;
                      const isInCart = items.some(item => item.productId === product.id);
                      const cartQuantity = items.find(item => item.productId === product.id)?.quantity || 0;
                      
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addToCart(product.id, product.name, product.price)}
                          className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${
                            isInCart 
                              ? 'border-primary bg-primary/5 shadow-lg' 
                              : 'border-border hover:border-primary/50 hover:shadow-md'
                          }`}
                        >
                          {isInCart && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                              {cartQuantity}
                            </div>
                          )}
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                            isInCart 
                              ? 'bg-gradient-to-br from-primary to-accent' 
                              : 'bg-gradient-to-br from-primary/20 to-accent/20'
                          }`}>
                            <IconComponent className={`w-8 h-8 ${isInCart ? 'text-white' : 'text-primary'}`} />
                          </div>
                          <div className="text-center w-full">
                            <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                            <p className="text-sm text-primary font-bold mt-1">{product.price.toFixed(2)} DH</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">Aucun produit trouvé pour "{searchQuery}"</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                    >
                      Réinitialiser la recherche
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Aucun produit disponible</p>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Customer Info */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-serif flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                    Vos Informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Nom Complet *</Label>
                    <Input
                      id="customerName"
                      placeholder="Ex: Ahmed Alami"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Numéro de Téléphone *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Ex: 0612345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      maxLength={20}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de Livraison Souhaitée</Label>
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
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              {/* Cart */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-serif flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
                    Votre Panier
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Votre panier est vide</p>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {items.map((item) => (
                          <div key={item.productId} className="flex items-center justify-between p-2 rounded bg-muted/50">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.productName}</p>
                              <p className="text-xs text-muted-foreground">{item.unitPrice.toFixed(2)} DH × {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="ml-4 font-semibold text-primary">
                              {item.total.toFixed(2)} DH
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-border">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total</span>
                          <span className="text-primary">{calculateTotal().toFixed(2)} DH</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full text-lg"
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer ma Commande"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}