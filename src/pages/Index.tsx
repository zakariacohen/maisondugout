import { useState, useEffect } from "react";
import { OrderForm } from "@/components/OrderForm";
import { OrderList } from "@/components/OrderList";
import { OrderCalendar } from "@/components/OrderCalendar";
import { Plus, Clock, CheckCircle2, Package, LogOut, CalendarDays, Menu, AlertCircle, BarChart3, TrendingUp, PackageX, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Products from "@/pages/Products";
import Dashboard from "@/pages/Dashboard";
import Statistics from "@/pages/Statistics";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpg";
import { NotificationService } from "@/utils/notifications";

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  items: OrderItem[];
  total: number;
  date: Date;
  delivered: boolean;
  deliveryImageUrl?: string;
  deliveryDate?: Date;
}

export interface OrderItem {
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const Index = () => {
  const [view, setView] = useState<"form" | "pending" | "delivered" | "products" | "calendar" | "alerts" | "dashboard" | "statistics">("form");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { orders, isLoading, addOrder, updateOrder, deleteOrder, uploadDeliveryImage } = useOrders();
  const { data: products } = useProducts();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  // Calculate urgent orders (delivery date is today or past, and not delivered)
  const getUrgentOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders.filter(order => {
      if (order.delivered) return false;
      if (!order.deliveryDate) return false;
      
      const deliveryDate = new Date(order.deliveryDate);
      deliveryDate.setHours(0, 0, 0, 0);
      
      return deliveryDate <= today;
    });
  };

  const urgentOrders = getUrgentOrders();
  
  // Get low stock products
  const lowStockProducts = products?.filter(p => p.stock <= p.stock_alert_threshold) || [];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Initialize notifications
  useEffect(() => {
    NotificationService.initialize();
  }, []);

  // Check for urgent orders and send notifications
  useEffect(() => {
    if (!isLoading && urgentOrders.length > 0) {
      NotificationService.notifyUrgentOrders(urgentOrders);
      NotificationService.playSound();
    }
  }, [urgentOrders.length, isLoading]);

  // Fix mobile browsers (Safari / WhatsApp) freezing when coming back to the app
  useEffect(() => {
    let wasHidden = false;

    const handleVisibilityChange = () => {
      // Don't reload if we're in the middle of scanning
      if (isScanning) {
        console.log('Scan in progress, skipping reload');
        return;
      }
      
      if (document.visibilityState === "hidden") {
        wasHidden = true;
      } else if (document.visibilityState === "visible" && wasHidden) {
        wasHidden = false;
        window.location.reload();
      }
    };

    const handlePageShow = (event: any) => {
      // Don't reload if we're in the middle of scanning
      if (isScanning) {
        console.log('Scan in progress, skipping reload');
        return;
      }
      
      if (event.persisted) {
        window.location.reload();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [isScanning]);

  const handleAddOrder = async (order: Order) => {
    try {
      await addOrder(order);
      setView("pending");
      setEditingOrder(null);
      toast.success("Commande ajoutée avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la commande");
    }
  };

  const handleUpdateOrder = async (order: Order) => {
    try {
      await updateOrder({
        orderId: order.id,
        customerName: order.customerName,
        phoneNumber: order.phoneNumber,
        items: order.items,
        total: order.total,
        deliveryDate: order.deliveryDate,
      });
      setView("pending");
      setEditingOrder(null);
      toast.success("Commande modifiée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la modification de la commande");
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setView("form");
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleToggleDelivered = async (orderId: string, currentStatus: boolean) => {
    try {
      await updateOrder({ orderId, delivered: !currentStatus });
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Déconnexion réussie");
  };

  if (authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-2 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink">
              <img 
                src={logo} 
                alt="Maison du Goût" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl md:text-2xl font-serif font-bold text-primary truncate">
                  Maison du Goût
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Gestion des Commandes</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2 items-center justify-end max-w-full">
              {urgentOrders.length > 0 && (
                <Button
                  variant={view === "alerts" ? "default" : "destructive"}
                  size="sm"
                  onClick={() => setView("alerts")}
                  className="transition-all px-2 sm:px-4 relative animate-pulse"
                >
                  <AlertCircle className="w-4 h-4 sm:mr-2" />
                  <span className="hidden md:inline">
                    Alertes ({urgentOrders.length})
                  </span>
                  <span className="md:hidden">{urgentOrders.length}</span>
                </Button>
              )}
              {lowStockProducts.length > 0 && (
                <Button
                  variant={view === "products" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("products")}
                  className="transition-all px-2 sm:px-4 border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950 animate-pulse"
                >
                  <PackageX className="w-4 h-4 sm:mr-2" />
                  <span className="hidden md:inline">
                    Stock Bas ({lowStockProducts.length})
                  </span>
                  <span className="md:hidden">{lowStockProducts.length}</span>
                </Button>
              )}
              <Button
                variant={view === "form" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("form")}
                className="transition-all px-2 sm:px-4"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden md:inline">Nouvelle</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const orderLink = `${window.location.origin}/commander`;
                  navigator.clipboard.writeText(orderLink);
                  toast.success("Lien de commande copié ! Partagez-le avec vos clients.");
                }}
                className="transition-all px-2 sm:px-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/50 hover:border-green-500"
                title="Copier le lien de commande en ligne"
              >
                <Share2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden lg:inline">Commandes en ligne</span>
              </Button>
              <Button
                variant={view === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("pending")}
                className="transition-all px-2 sm:px-4"
              >
                <Clock className="w-4 h-4 sm:mr-2" />
                <span className="hidden md:inline">
                  En attente ({orders.filter(o => !o.delivered).length})
                </span>
                <span className="md:hidden">{orders.filter(o => !o.delivered).length}</span>
              </Button>
              <Button
                variant={view === "delivered" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("delivered")}
                className="transition-all px-2 sm:px-4"
              >
                <CheckCircle2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden md:inline">
                  Livrées ({orders.filter(o => o.delivered).length})
                </span>
                <span className="md:hidden">{orders.filter(o => o.delivered).length}</span>
              </Button>
              <Button
                variant={view === "products" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("products")}
                className="transition-all px-2 sm:px-3 hidden sm:flex"
              >
                <Package className="w-4 h-4 sm:mr-2" />
                <span className="hidden md:inline">Produits</span>
              </Button>
              <Button
                variant={view === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("calendar")}
                className="transition-all px-2 sm:px-3 hidden sm:flex"
              >
                <CalendarDays className="w-4 h-4 sm:mr-2" />
                <span className="hidden md:inline">Calendrier</span>
              </Button>
              <Button
                variant={view === "dashboard" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("dashboard")}
                className="transition-all px-2 sm:px-3 hidden sm:flex"
              >
                <BarChart3 className="w-4 h-4 sm:mr-2" />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
              <Button
                variant={view === "statistics" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("statistics")}
                className="transition-all px-2 sm:px-3 hidden sm:flex"
              >
                <TrendingUp className="w-4 h-4 sm:mr-2" />
                <span className="hidden md:inline">Statistiques</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="transition-all px-2 sm:px-3 hidden sm:flex"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden md:inline">Déconnexion</span>
              </Button>
              
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="sm:hidden px-2"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col gap-3 mt-8">
                    <Button
                      variant={view === "products" ? "default" : "outline"}
                      size="lg"
                      onClick={() => {
                        setView("products");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <Package className="w-5 h-5 mr-3" />
                      Produits
                    </Button>
                    <Button
                      variant={view === "calendar" ? "default" : "outline"}
                      size="lg"
                      onClick={() => {
                        setView("calendar");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <CalendarDays className="w-5 h-5 mr-3" />
                      Calendrier
                    </Button>
                    <Button
                      variant={view === "dashboard" ? "default" : "outline"}
                      size="lg"
                      onClick={() => {
                        setView("dashboard");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <BarChart3 className="w-5 h-5 mr-3" />
                      Dashboard
                    </Button>
                    <Button
                      variant={view === "statistics" ? "default" : "outline"}
                      size="lg"
                      onClick={() => {
                        setView("statistics");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <TrendingUp className="w-5 h-5 mr-3" />
                      Statistiques
                    </Button>
                    <div className="border-t pt-3 mt-2">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          const orderLink = `${window.location.origin}/commander`;
                          navigator.clipboard.writeText(orderLink);
                          toast.success("Lien de commande copié !");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/50"
                      >
                        <Share2 className="w-5 h-5 mr-3" />
                        Lien Commande en Ligne
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Déconnexion
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          {view === "form" ? (
            <OrderForm 
              onAddOrder={handleAddOrder}
              onUpdateOrder={handleUpdateOrder}
              editingOrder={editingOrder}
              onCancelEdit={() => {
                setEditingOrder(null);
                setView("pending");
              }}
              onScanningChange={setIsScanning}
            />
          ) : view === "pending" ? (
            <OrderList 
              orders={orders
                .filter(o => !o.delivered)
                .sort((a, b) => {
                  if (!a.deliveryDate && !b.deliveryDate) return 0;
                  if (!a.deliveryDate) return 1;
                  if (!b.deliveryDate) return -1;
                  return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
                })} 
              onDeleteOrder={handleDeleteOrder}
              onToggleDelivered={handleToggleDelivered}
              onEditOrder={handleEditOrder}
              isLoading={isLoading}
              title="Commandes en Attente"
            />
          ) : view === "delivered" ? (
            <OrderList 
              orders={orders.filter(o => o.delivered)} 
              onDeleteOrder={handleDeleteOrder}
              onToggleDelivered={handleToggleDelivered}
              onEditOrder={handleEditOrder}
              isLoading={isLoading}
              title="Commandes Livrées"
            />
          ) : view === "alerts" ? (
            <OrderList 
              orders={urgentOrders.sort((a, b) => {
                const dateA = new Date(a.deliveryDate!);
                const dateB = new Date(b.deliveryDate!);
                return dateA.getTime() - dateB.getTime();
              })} 
              onDeleteOrder={handleDeleteOrder}
              onToggleDelivered={handleToggleDelivered}
              onEditOrder={handleEditOrder}
              isLoading={isLoading}
              title="⚠️ Commandes Urgentes"
            />
          ) : view === "calendar" ? (
            <OrderCalendar 
              orders={orders}
              isLoading={isLoading}
            />
          ) : view === "dashboard" ? (
            <Dashboard 
              orders={orders}
              isLoading={isLoading}
            />
          ) : view === "statistics" ? (
            <Statistics />
          ) : (
            <Products />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
