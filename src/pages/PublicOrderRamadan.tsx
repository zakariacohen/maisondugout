import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Minus, CalendarIcon, Check, Package, icons, LucideIcon, Search, Sparkles, Star } from "lucide-react";
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
  deliveryAddress: z.string().trim().min(5, "L'adresse doit contenir au moins 5 caractères").max(200),
});

export default function PublicOrderRamadan() {
  const { data: products, isLoading } = useProducts();
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
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
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (product.category === 'ramadan' || product.category === 'both')
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      orderSchema.parse({ customerName, phoneNumber, deliveryAddress });
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
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName.trim(),
          phone_number: phoneNumber.trim(),
          delivery_address: deliveryAddress.trim(),
          total: calculateTotal(),
          delivered: false,
          delivery_date: deliveryDate?.toISOString() || null,
          order_source: 'ramadan',
        })
        .select()
        .single();

      if (orderError) throw orderError;

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
      toast.success("Commande Ramadan envoyée avec succès ! Ramadan Mubarak 🌙");
      
      setTimeout(() => {
        setCustomerName("");
        setPhoneNumber("");
        setDeliveryAddress("");
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Star className="absolute top-10 left-10 w-6 h-6 text-yellow-300 animate-pulse" />
          <Star className="absolute top-20 right-20 w-4 h-4 text-yellow-200 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Star className="absolute bottom-20 left-32 w-5 h-5 text-yellow-300 animate-pulse" style={{ animationDelay: '1s' }} />
          <Star className="absolute bottom-40 right-40 w-4 h-4 text-yellow-200 animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <Card className="max-w-md w-full shadow-2xl border-2 border-yellow-400/30 bg-white/95 backdrop-blur">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shadow-lg">
              <Check className="w-12 h-12 text-white" />
            </div>
            <div className="mb-4">
              <span className="text-6xl">🌙</span>
            </div>
            <h2 className="text-3xl font-serif font-bold mb-2 bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent">
              Ramadan Mubarak !
            </h2>
            <p className="text-lg text-gray-700 mb-2">
              Commande Reçue avec Succès
            </p>
            <p className="text-muted-foreground">
              Merci {customerName} ! Nous vous contacterons bientôt pour confirmer votre commande de Ramadan.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 py-12 px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-yellow-300 blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-emerald-400 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 rounded-full bg-purple-400 blur-3xl"></div>
        <Star className="absolute top-20 left-20 w-8 h-8 text-yellow-300 animate-pulse" />
        <Star className="absolute top-32 right-32 w-6 h-6 text-yellow-200 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Star className="absolute bottom-32 left-40 w-7 h-7 text-yellow-300 animate-pulse" style={{ animationDelay: '1s' }} />
        <Star className="absolute bottom-48 right-48 w-5 h-5 text-yellow-200 animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-5xl animate-pulse">🌙</span>
            <h1 className="text-5xl font-serif font-bold text-white drop-shadow-2xl">
              Ramadan 2026
            </h1>
            <span className="text-5xl animate-pulse" style={{ animationDelay: '0.5s' }}>✨</span>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 text-purple-900 py-3 px-6 rounded-full inline-block shadow-xl mb-4">
            <p className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Commandes Spéciales Ramadan
              <Sparkles className="w-6 h-6" />
            </p>
          </div>
          <p className="text-yellow-100 text-lg font-medium">
            Célébrez le mois sacré avec nos délices traditionnels
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Products Selection */}
            <Card className="shadow-2xl border-2 border-yellow-400/30 bg-white/95 backdrop-blur">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-violet-100 border-b-2 border-yellow-400/30">
                <CardTitle className="text-xl font-serif flex items-center gap-2">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center text-sm shadow-lg">
                    1
                  </span>
                  <span className="bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent">
                    Nos Produits Ramadan
                  </span>
                </CardTitle>
                <CardDescription className="text-purple-800">
                  Sélectionnez vos délices préférés pour ce mois béni
                </CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                  <Input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-purple-300 focus:border-yellow-400"
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto pt-6">
                {isLoading ? (
                  <div className="text-center py-8 text-purple-600">Chargement des produits...</div>
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
                          className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 shadow-md ${
                            isInCart 
                              ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-yellow-400/50 shadow-lg' 
                              : 'border-purple-200 hover:border-yellow-400/50 hover:shadow-lg bg-white'
                          }`}
                        >
                          {isInCart && (
                            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                              {cartQuantity}
                            </div>
                          )}
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                            isInCart 
                              ? 'bg-gradient-to-br from-purple-600 to-violet-600' 
                              : 'bg-gradient-to-br from-purple-100 to-violet-100'
                          }`}>
                            <IconComponent className={`w-8 h-8 ${isInCart ? 'text-white' : 'text-purple-600'}`} />
                          </div>
                          <div className="text-center w-full">
                            <p className="font-semibold text-sm line-clamp-2 text-purple-900">{product.name}</p>
                            <p className="text-sm font-bold mt-1 text-amber-600">{product.price.toFixed(2)} DH</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-8">
                    <p className="text-purple-600 mb-2">Aucun produit trouvé pour "{searchQuery}"</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      Réinitialiser la recherche
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-purple-600 py-8">Aucun produit disponible</p>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Customer Info */}
              <Card className="shadow-2xl border-2 border-yellow-400/30 bg-white/95 backdrop-blur">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-violet-100 border-b-2 border-yellow-400/30">
                  <CardTitle className="text-xl font-serif flex items-center gap-2">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center text-sm shadow-lg">
                      2
                    </span>
                    <span className="bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent">
                      Vos Informations
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-purple-900 font-medium">Nom Complet *</Label>
                    <Input
                      id="customerName"
                      placeholder="Ex: Ahmed Alami"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      maxLength={100}
                      className="border-2 border-purple-300 focus:border-yellow-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-purple-900 font-medium">Numéro de Téléphone *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Ex: 0612345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      maxLength={20}
                      className="border-2 border-purple-300 focus:border-yellow-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress" className="text-purple-900 font-medium">Adresse de Livraison *</Label>
                    <Input
                      id="deliveryAddress"
                      placeholder="Ex: 123 Rue Mohammed V, Casablanca"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                      maxLength={200}
                      className="border-2 border-purple-300 focus:border-yellow-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-purple-900 font-medium">Date de Livraison Ramadan</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-2 border-purple-300 hover:border-yellow-400",
                            !deliveryDate && "text-purple-400"
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
              <Card className="shadow-2xl border-2 border-yellow-400/30 bg-white/95 backdrop-blur">
                <CardHeader className="bg-gradient-to-r from-purple-100 to-violet-100 border-b-2 border-yellow-400/30">
                  <CardTitle className="text-xl font-serif flex items-center gap-2">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center text-sm shadow-lg">
                      3
                    </span>
                    <span className="bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent">
                      Votre Panier
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {items.length === 0 ? (
                    <p className="text-center text-purple-600 py-4">Votre panier est vide</p>
                  ) : (
                    <>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {items.map((item) => (
                          <div key={item.productId} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200">
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-purple-900">{item.productName}</p>
                              <p className="text-xs text-purple-600">{item.unitPrice.toFixed(2)} DH × {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 border-purple-300 hover:bg-purple-100"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-bold text-purple-900">{item.quantity}</span>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 border-purple-300 hover:bg-purple-100"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="ml-4 font-bold text-amber-600">
                              {item.total.toFixed(2)} DH
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 border-t-2 border-yellow-400/50">
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span className="text-purple-900">Total</span>
                          <span className="text-amber-600">{calculateTotal().toFixed(2)} DH</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full text-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-xl"
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? "Envoi en cours..." : "🌙 Confirmer ma Commande Ramadan"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}