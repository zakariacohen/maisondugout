import { useState } from "react";
import { OrderForm } from "@/components/OrderForm";
import { OrderList } from "@/components/OrderList";
import { Plus, List, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Products from "@/pages/Products";
import { useOrders } from "@/hooks/useOrders";
import { toast } from "sonner";

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  items: OrderItem[];
  total: number;
  date: Date;
  delivered: boolean;
  deliveryImageUrl?: string;
}

export interface OrderItem {
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const Index = () => {
  const [view, setView] = useState<"form" | "list" | "products">("form");
  const { orders, isLoading, addOrder, updateOrder, deleteOrder, uploadDeliveryImage } = useOrders();

  const handleAddOrder = async (order: Order) => {
    try {
      await addOrder(order);
      setView("list");
      toast.success("Commande ajoutée avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la commande");
    }
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

  const handleImageUpload = async (orderId: string, file: File) => {
    try {
      const imageUrl = await uploadDeliveryImage(file, orderId);
      await updateOrder({ orderId, delivered: true, deliveryImageUrl: imageUrl });
    } catch (error) {
      toast.error("Erreur lors de l'upload de l'image");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-primary">
                Maison du Goût
              </h1>
              <p className="text-sm text-muted-foreground">Gestion des Commandes</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={view === "form" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("form")}
                className="transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Nouvelle</span>
              </Button>
              <Button
                variant={view === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("list")}
                className="transition-all"
              >
                <List className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  Liste ({orders.length})
                </span>
                <span className="sm:hidden">{orders.length}</span>
              </Button>
              <Button
                variant={view === "products" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("products")}
                className="transition-all"
              >
                <Package className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Produits</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          {view === "form" ? (
            <OrderForm onAddOrder={handleAddOrder} />
          ) : view === "list" ? (
            <OrderList 
              orders={orders} 
              onDeleteOrder={handleDeleteOrder}
              onToggleDelivered={handleToggleDelivered}
              onImageUpload={handleImageUpload}
              isLoading={isLoading}
            />
          ) : (
            <Products />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
