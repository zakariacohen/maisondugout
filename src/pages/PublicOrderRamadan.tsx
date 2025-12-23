import { useState, useEffect } from "react";
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
import { generateUuid } from "@/lib/uuid";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { SEO } from "@/components/SEO";

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
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Ramadan 2026 starts approximately February 18, 2026
  const ramadanDate = new Date('2026-02-18T00:00:00');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = ramadanDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

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

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const categories = product.category ? product.category.split(",") : [];
    const matchesCategory = categories.includes('ramadan') || categories.includes('both');
    return matchesSearch && matchesCategory;
  }) || [];

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
      // Insert order (use a client-generated id to avoid needing SELECT/RETURNING under RLS)
      const orderId = generateUuid();
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          customer_name: customerName.trim(),
          phone_number: phoneNumber.trim(),
          delivery_address: deliveryAddress.trim(),
          total: calculateTotal(),
          delivered: false,
          delivery_date: deliveryDate?.toISOString() || null,
          order_source: 'ramadan',
        });

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: orderId,
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
      const message =
        (typeof error === "object" && error && "message" in error && typeof (error as any).message === "string")
          ? (error as any).message
          : "Erreur inconnue";

      console.error("Error creating order:", error);
      toast.error(`Erreur lors de l'envoi: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-amber-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Moroccan pattern background */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, gold 2%, transparent 0%), 
                           radial-gradient(circle at 75px 75px, gold 2%, transparent 0%)`,
          backgroundSize: '100px 100px'
        }}></div>
        
        {/* Decorative stars and lanterns */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-16 h-20 text-amber-400 animate-pulse">
            <div className="w-full h-full border-2 border-current rounded-lg relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-current rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-current rounded-full"></div>
            </div>
          </div>
          <Star className="absolute top-20 right-20 w-6 h-6 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Star className="absolute bottom-20 left-32 w-5 h-5 text-amber-300 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-10 right-10 w-16 h-20 text-amber-400 animate-pulse" style={{ animationDelay: '1.5s' }}>
            <div className="w-full h-full border-2 border-current rounded-lg relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-current rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-current rounded-full"></div>
            </div>
          </div>
        </div>
        
        <Card className="max-w-md w-full shadow-2xl border-4 border-amber-500/50 bg-gradient-to-br from-amber-50 to-white relative overflow-hidden">
          {/* Decorative border pattern */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-red-700 via-amber-500 to-red-700"></div>
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-red-700 via-amber-500 to-red-700"></div>
          
          <CardContent className="pt-12 pb-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce shadow-2xl border-4 border-white">
              <Check className="w-14 h-14 text-white" strokeWidth={3} />
            </div>
            <div className="mb-4 flex justify-center gap-2">
              <span className="text-6xl">🕌</span>
              <span className="text-6xl">🌙</span>
              <span className="text-6xl">✨</span>
            </div>
            <h2 className="text-4xl font-serif font-bold mb-3 bg-gradient-to-r from-red-800 via-amber-600 to-red-800 bg-clip-text text-transparent">
              رمضان مبارك
            </h2>
            <h3 className="text-2xl font-bold mb-3 text-red-900">
              Ramadan Mubarak !
            </h3>
            <div className="w-24 h-1 mx-auto mb-4 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            <p className="text-xl text-red-800 mb-2 font-semibold">
              Commande Reçue avec Succès
            </p>
            <p className="text-gray-700 text-lg leading-relaxed px-4">
              Merci <span className="font-bold text-red-900">{customerName}</span> ! <br/>
              Nous vous contacterons bientôt pour confirmer votre commande de Ramadan.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <span className="text-3xl">🤲</span>
              <span className="text-3xl">💚</span>
              <span className="text-3xl">🤲</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ramadanStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Maison du Goût - Spécial Ramadan",
    "description": "Pâtisserie artisanale marocaine - Commandes spéciales Ramadan 2026. Chebakia, sellou, briouates et pâtisseries traditionnelles.",
    "url": "https://commande.maisondugout.ma/ramadan",
    "telephone": "+212600000000",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MA",
      "addressRegion": "Maroc"
    },
    "priceRange": "$$",
    "servesCuisine": "Pâtisserie Marocaine Ramadan",
    "event": {
      "@type": "Event",
      "name": "Commandes Ramadan 2026",
      "startDate": "2026-02-18",
      "description": "Commandez vos pâtisseries traditionnelles pour le Ramadan 1447"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Pâtisseries Ramadan",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Chebakia, Sellou, Briouates"
          }
        }
      ]
    }
  };

  return (
    <>
      <SEO
        title="Commandes Ramadan 2026 | Maison du Goût - Pâtisseries Traditionnelles Maroc"
        description="Commandez vos pâtisseries marocaines pour Ramadan 2026. Chebakia, sellou, briouates et délices traditionnels faits maison. رمضان مبارك"
        keywords="ramadan 2026, pâtisserie ramadan maroc, chebakia, sellou, briouates, حلويات رمضان, pâtisserie marocaine ramadan"
        canonicalUrl="/ramadan"
        structuredData={ramadanStructuredData}
      />
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-amber-900 to-red-950 py-12 px-4 relative overflow-hidden">
        {/* Moroccan zellige pattern background */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,215,0,0.3) 35px, rgba(255,215,0,0.3) 70px),
                           repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(139,69,19,0.2) 35px, rgba(139,69,19,0.2) 70px)`,
        }}></div>
      
      {/* Decorative glow elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-amber-400 blur-3xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 rounded-full bg-yellow-400 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 rounded-full bg-red-600 blur-3xl"></div>
        <div className="absolute bottom-40 right-1/4 w-36 h-36 rounded-full bg-amber-500 blur-3xl"></div>
      </div>

      {/* Floating lanterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-24 text-amber-300 animate-pulse opacity-60">
          <div className="w-full h-full border-3 border-current rounded-xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 border-2 border-current rounded-full bg-amber-400/20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border-2 border-current rounded-full"></div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-current rounded"></div>
          </div>
        </div>
        <div className="absolute top-32 right-20 w-16 h-20 text-yellow-300 animate-pulse opacity-50" style={{ animationDelay: '0.7s' }}>
          <div className="w-full h-full border-2 border-current rounded-lg relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 border-2 border-current rounded-full bg-yellow-400/20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-current rounded-full"></div>
          </div>
        </div>
        <Star className="absolute top-24 left-32 w-8 h-8 text-amber-300 animate-pulse" style={{ animationDelay: '0.3s' }} />
        <Star className="absolute bottom-32 left-24 w-6 h-6 text-yellow-300 animate-pulse" style={{ animationDelay: '1s' }} />
        <Star className="absolute bottom-48 right-32 w-7 h-7 text-amber-300 animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header with Moroccan arch design */}
        <div className="text-center mb-8">
          {/* Decorative arch */}
          <div className="relative inline-block mb-6">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-16 border-t-4 border-l-4 border-r-4 border-amber-400 rounded-t-full"></div>
            <div className="relative pt-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="text-5xl animate-pulse">🕌</span>
                <div className="text-center">
                  <h1 className="text-5xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-300 to-amber-400 drop-shadow-2xl mb-2" style={{ textShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }}>
                    رمضان ١٤٤٧
                  </h1>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-100 drop-shadow-lg">
                    Ramadan 2026
                  </h2>
                </div>
                <span className="text-5xl animate-pulse" style={{ animationDelay: '0.5s' }}>🌙</span>
              </div>
            </div>
          </div>
          
          {/* Decorative separator */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-400 to-amber-400"></div>
            <Star className="w-6 h-6 text-amber-300" />
            <div className="w-24 h-1 bg-gradient-to-l from-transparent via-amber-400 to-amber-400"></div>
          </div>
          
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 blur-xl opacity-60"></div>
            <div className="relative bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-red-950 py-4 px-8 border-4 border-amber-300 shadow-2xl" style={{
              clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)'
            }}>
              <p className="text-2xl md:text-3xl font-bold flex flex-col items-center justify-center gap-2 px-8">
                <span className="flex items-center gap-3">
                  <Sparkles className="w-7 h-7" />
                  <span>طلبات رمضان المباركة</span>
                  <Sparkles className="w-7 h-7" />
                </span>
                <span className="text-xl">Commandes Spéciales Ramadan</span>
              </p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <p className="text-amber-100 text-2xl font-bold drop-shadow-lg">
              🌙 اللهم بلغنا رمضان 🌙
            </p>
            <p className="text-emerald-300 text-xl font-semibold drop-shadow-lg">
              كل عام وأنتم بخير - تقبل الله منا ومنكم
            </p>
            <p className="text-amber-100 text-lg font-medium drop-shadow-lg max-w-2xl mx-auto leading-relaxed">
              احتفلوا بالشهر الفضيل مع حلوياتنا التقليدية<br/>
              Célébrez le mois sacré avec nos délices traditionnels faits maison
            </p>
          </div>
          
          {/* Decorative border */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <div className="w-16 h-px bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-16 h-px bg-amber-400"></div>
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          </div>
        </div>

        {/* Countdown Timer - Minimal Version */}
        <div className="mb-4">
          <div className="text-center bg-red-900/60 border border-amber-400/30 rounded-lg py-1.5 px-2 max-w-md mx-auto">
            <p className="text-amber-100 text-xs mb-1 hidden sm:block">Ramadan 2026</p>
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {[
                { value: timeLeft.days, label: 'j' },
                { value: timeLeft.hours, label: 'h' },
                { value: timeLeft.minutes, label: 'm' },
                { value: timeLeft.seconds, label: 's' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-0.5">
                  <span className="text-amber-300 font-bold text-sm sm:text-base">{String(item.value).padStart(2, '0')}</span>
                  <span className="text-amber-200/60 text-xs">{item.label}</span>
                  {index < 3 && <span className="text-amber-400/40 text-xs">:</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Products Selection */}
            <Card className="shadow-2xl border-4 border-amber-500/40 bg-gradient-to-br from-amber-50 to-white relative overflow-hidden">
              {/* Decorative top border */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-700 via-amber-500 to-red-700"></div>
              
              <CardHeader className="bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border-b-3 border-amber-400/50 relative">
                {/* Decorative corner patterns */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-500/50 rounded-tl-lg"></div>
                <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-500/50 rounded-tr-lg"></div>
                
                <CardTitle className="text-2xl font-serif flex items-center gap-3">
                  <span className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 text-white flex items-center justify-center text-lg shadow-xl border-2 border-white font-bold">
                    ١
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="bg-gradient-to-r from-red-900 via-amber-700 to-red-900 bg-clip-text text-transparent font-bold">
                      اختر منتجاتك
                    </span>
                    <span className="text-lg text-red-800">
                      Nos Produits Ramadan
                    </span>
                  </div>
                  <span className="text-2xl">🥮</span>
                </CardTitle>
                <CardDescription className="text-red-900 font-medium text-base mt-2">
                  اختاروا ما تفضلونه من حلويات رمضان<br/>
                  Sélectionnez vos délices préférés pour ce mois béni
                </CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />
                  <Input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 border-2 border-amber-400 focus:border-red-600 bg-white text-base"
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto pt-6">
                {isLoading ? (
                  <div className="text-center py-8 text-red-800 font-medium">
                    <div className="animate-spin w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Chargement des produits...
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => {
                      const IconComponent = (icons[product.icon as keyof typeof icons] || Package) as LucideIcon;
                      const isInCart = items.some(item => item.productId === product.id);
                      const cartQuantity = items.find(item => item.productId === product.id)?.quantity || 0;
                      
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => addToCart(product.id, product.name, product.price)}
                          className={`relative flex flex-col items-center gap-3 p-4 rounded-2xl border-3 transition-all hover:scale-105 active:scale-95 shadow-lg ${
                            isInCart 
                              ? 'border-amber-500 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 shadow-amber-500/50 shadow-xl' 
                              : 'border-amber-300/50 hover:border-amber-500 hover:shadow-xl bg-white'
                          }`}
                        >
                          {isInCart && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-red-600 via-red-500 to-amber-600 text-white text-sm font-bold flex items-center justify-center shadow-xl border-2 border-white animate-pulse">
                              {cartQuantity}
                            </div>
                          )}
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-2 ${
                            isInCart 
                              ? 'bg-gradient-to-br from-red-600 to-amber-600 border-white' 
                              : 'bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-300'
                          }`}>
                            <IconComponent className={`w-9 h-9 ${isInCart ? 'text-white' : 'text-red-800'}`} />
                          </div>
                          <div className="text-center w-full">
                            <p className="font-bold text-sm line-clamp-2 text-red-900">{product.name}</p>
                            <p className="text-base font-bold mt-1 text-amber-700">{product.price.toFixed(2)} DH</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-8">
                    <p className="text-red-800 mb-3 font-medium">Aucun produit trouvé pour "{searchQuery}"</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="border-2 border-amber-400 text-red-800 hover:bg-amber-50 font-medium"
                    >
                      Réinitialiser la recherche
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-red-800 py-8 font-medium">Aucun produit disponible</p>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Customer Info */}
              <Card className="shadow-2xl border-4 border-amber-500/40 bg-gradient-to-br from-amber-50 to-white relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-700 via-amber-500 to-red-700"></div>
                
                <CardHeader className="bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border-b-3 border-amber-400/50 relative">
                  <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-500/50 rounded-tl-lg"></div>
                  <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-500/50 rounded-tr-lg"></div>
                  
                  <CardTitle className="text-2xl font-serif flex items-center gap-3">
                    <span className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 text-white flex items-center justify-center text-lg shadow-xl border-2 border-white font-bold">
                      ٢
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="bg-gradient-to-r from-red-900 via-amber-700 to-red-900 bg-clip-text text-transparent font-bold">
                        معلوماتك
                      </span>
                      <span className="text-lg text-red-800">
                        Vos Informations
                      </span>
                    </div>
                    <span className="text-2xl">📝</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-red-900 font-bold text-base flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-700"></span>
                      Nom Complet *
                    </Label>
                    <Input
                      id="customerName"
                      placeholder="Ex: Ahmed Alami"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      maxLength={100}
                      className="border-2 border-amber-400 focus:border-red-600 bg-white text-base h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-red-900 font-bold text-base flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-700"></span>
                      Numéro de Téléphone *
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Ex: 0612345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      maxLength={20}
                      className="border-2 border-amber-400 focus:border-red-600 bg-white text-base h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryAddress" className="text-red-900 font-bold text-base flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-700"></span>
                      Adresse de Livraison *
                    </Label>
                    <Input
                      id="deliveryAddress"
                      placeholder="Ex: 123 Rue Mohammed V, Casablanca"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                      maxLength={200}
                      className="border-2 border-amber-400 focus:border-red-600 bg-white text-base h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-red-900 font-bold text-base flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-700"></span>
                      Date de Livraison Ramadan
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal border-2 border-amber-400 hover:border-red-600 h-11 text-base",
                            !deliveryDate && "text-amber-600"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-5 w-5" />
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
              <Card className="shadow-2xl border-4 border-amber-500/40 bg-gradient-to-br from-amber-50 to-white relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-700 via-amber-500 to-red-700"></div>
                
                <CardHeader className="bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border-b-3 border-amber-400/50 relative">
                  <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-500/50 rounded-tl-lg"></div>
                  <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-500/50 rounded-tr-lg"></div>
                  
                  <CardTitle className="text-2xl font-serif flex items-center gap-3">
                    <span className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 text-white flex items-center justify-center text-lg shadow-xl border-2 border-white font-bold">
                      ٣
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="bg-gradient-to-r from-red-900 via-amber-700 to-red-900 bg-clip-text text-transparent font-bold">
                        سلة المشتريات
                      </span>
                      <span className="text-lg text-red-800">
                        Votre Panier
                      </span>
                    </div>
                    <span className="text-2xl">🛒</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {items.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-3">🛒</div>
                      <p className="text-red-800 font-medium">Votre panier est vide</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                        {items.map((item) => (
                          <div key={item.productId} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-300 shadow-md">
                            <div className="flex-1">
                              <p className="font-bold text-sm text-red-900">{item.productName}</p>
                              <p className="text-xs text-amber-700 font-medium mt-1">{item.unitPrice.toFixed(2)} DH × {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 border-2 border-red-600 hover:bg-red-50 text-red-700"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-10 text-center font-bold text-red-900 text-base">{item.quantity}</span>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 border-2 border-red-600 hover:bg-red-50 text-red-700"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="ml-4 font-bold text-amber-700 text-base">
                              {item.total.toFixed(2)} DH
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t-3 border-amber-500/50 mt-4">
                        <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-red-100 to-amber-100 border-2 border-amber-500">
                          <span className="text-2xl font-bold text-red-900">Total</span>
                          <span className="text-2xl font-bold text-amber-700">{calculateTotal().toFixed(2)} DH</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full text-xl py-7 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-800 hover:via-red-700 hover:to-amber-700 text-white shadow-2xl border-2 border-amber-400 font-bold relative overflow-hidden group"
                disabled={isSubmitting || items.length === 0}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity"></span>
                <span className="relative flex flex-col items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
                      <span>جاري الإرسال... - Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl flex items-center gap-2">
                        <span>🌙</span>
                        <span>رمضان كريم</span>
                        <span>🌙</span>
                      </span>
                      <span>Confirmer ma Commande Ramadan</span>
                    </>
                  )}
                </span>
              </Button>
              <p className="text-center text-emerald-300 font-semibold mt-4 text-lg">
                بارك الله فيكم - Merci pour votre confiance
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}